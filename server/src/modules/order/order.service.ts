import { OrderStatus, PaymentMethod, ShippingMethod, Prisma } from '@prisma/client';
import prisma from '../../config/database';
import { NotFoundError, BadRequestError, BusinessRuleError } from '../../utils/errors';
import { sendNotification } from '../notification/notification.service';
import type { GripChoice } from '../stringing/stringing.constants';
import { getZoneForProvince } from '../shipping/shipping.zones';
import { calculateShippingFee } from '../shipping/shipping.calculator';
import { COD_MAX_ORDER_VALUE } from '../shipping/shipping.constants';
import { validateCoupon as verifyCouponRules, getCouponByCode } from '../coupon/coupon.service';
import { calculateCouponDiscount } from '../coupon/coupon.calculator';
import { calculateOrderTotals, calculateMaxPointsRedeemable, calculatePointsEarned } from './order.calculator';
import { canTransition, OrderActor } from './order.state-machine';
import { generateOrderCode } from './order.code-generator';
import { initiatePayment } from '../payment/payment.service';
import { validateStringingConfig } from '../stringing/stringing.service';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  stringing?: {
    stringVariantId: string;
    tension: number;
    gripChoice?: string;
  };
}

export interface ShippingAddressInput {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  addressLine: string;
  note?: string;
}

export interface CreateOrderInput {
  itemsSource: 'cart' | 'inline';
  items?: OrderItemInput[];
  customer?: {
    email: string;
    fullName: string;
    phone: string;
  };
  shippingAddress?: ShippingAddressInput;
  shippingAddressId?: string;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  pointsToRedeem?: number;
  ipAddress?: string;
}

// Reusable include for all order fetches
const ORDER_INCLUDE = {
  items: true,
  statusHistory: { orderBy: { createdAt: 'asc' as const } },
  couponUsage: true,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function resolveAddress(input: CreateOrderInput, userId?: string): Promise<ShippingAddressInput> {
  if (input.shippingAddressId) {
    if (!userId) throw new BadRequestError('Must be authenticated to use saved address');
    const addr = await prisma.address.findUnique({ where: { id: input.shippingAddressId } });
    if (!addr || addr.userId !== userId) throw new NotFoundError('Address not found');
    return {
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.provinceName,
      district: addr.districtName ?? '',
      ward: addr.wardName ?? '',
      addressLine: addr.addressLine,
    };
  }
  if (!input.shippingAddress) throw new BadRequestError('Shipping address is required');
  return input.shippingAddress;
}

async function resolveCustomer(
  input: CreateOrderInput,
  userId?: string,
): Promise<{ email: string; fullName: string; phone: string }> {
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    return {
      email: input.customer?.email ?? user.email,
      fullName: input.customer?.fullName ?? user.fullName,
      phone: input.customer?.phone ?? user.phone ?? '',
    };
  }
  if (!input.customer) throw new BadRequestError('Customer info required for guest checkout');
  return input.customer;
}

async function resolveItems(input: CreateOrderInput, userId?: string): Promise<OrderItemInput[]> {
  if (input.itemsSource === 'cart') {
    if (!userId) throw new BadRequestError('Cart checkout requires authentication');
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });
    if (!cart || cart.items.length === 0) throw new BadRequestError('Cart is empty');
    return cart.items.map((ci) => ({
      productId: ci.productId,
      variantId: ci.variantId,
      quantity: ci.quantity,
      stringing: ci.stringVariantId
        ? {
            stringVariantId: ci.stringVariantId,
            tension: Number(ci.tension),
            gripChoice: ci.gripChoice ?? undefined,
          }
        : undefined,
    }));
  }
  if (!input.items || input.items.length === 0) throw new BadRequestError('No items provided');
  return input.items;
}

interface ValidatedItem {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  stringVariantId: string | null;
  stringPrice: number;
  tension: number | null;
  gripChoice: string | null;
  // Snapshots
  productName: string;
  productImage: string | null;
  productCategory: string;
  variantName: string;
  variantAttrs: unknown;
  stringName: string | null;
  stringImage: string | null;
}

async function validateAndPriceItems(items: OrderItemInput[]): Promise<ValidatedItem[]> {
  const result: ValidatedItem[] = [];

  for (const item of items) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: item.variantId },
      include: {
        product: {
          include: {
            category: true,
            images: { where: { isMain: true }, take: 1 },
          },
        },
      },
    });
    if (!variant || !variant.isActive) {
      throw new BusinessRuleError(`Variant not found or inactive: ${item.variantId}`, 'VARIANT_INACTIVE');
    }
    if (variant.productId !== item.productId) {
      throw new BadRequestError('Product/variant mismatch');
    }
    const product = variant.product;
    if (product.status !== 'ACTIVE') {
      throw new BusinessRuleError(`Product "${product.name}" is no longer available`, 'PRODUCT_INACTIVE');
    }
    if (variant.stock < item.quantity) {
      throw new BusinessRuleError(
        `Insufficient stock for "${product.name}" — ${variant.name}`,
        'OUT_OF_STOCK',
      );
    }

    const now = new Date();
    const saleActive =
      variant.salePrice !== null &&
      (product.saleStartDate === null || now >= product.saleStartDate) &&
      (product.saleEndDate === null || now <= product.saleEndDate);
    const unitPrice = Number(saleActive ? variant.salePrice : variant.price);

    let stringVariantId: string | null = null;
    let stringPrice = 0;
    let tension: number | null = null;
    let gripChoice: GripChoice | null = null;
    let stringName: string | null = null;
    let stringImage: string | null = null;

    if (item.stringing) {
      const strResult = await validateStringingConfig({
        racketVariantId: item.variantId,
        stringVariantId: item.stringing.stringVariantId,
        tension: item.stringing.tension,
        gripChoice: (item.stringing.gripChoice ?? 'ORIGINAL') as GripChoice,
      });
      if (!strResult.valid) {
        throw new BusinessRuleError(
          strResult.rule ?? 'Stringing config invalid',
          strResult.rule ?? 'STRINGING_INVALID',
        );
      }
      stringVariantId = item.stringing.stringVariantId;
      tension = item.stringing.tension;
      gripChoice = (item.stringing.gripChoice ?? null) as GripChoice | null;
      stringPrice = strResult.priceBreakdown?.totalAdditional ?? 0;

      // Fetch string variant for snapshot
      const sv = await prisma.productVariant.findUnique({
        where: { id: stringVariantId },
        include: { product: { include: { images: { where: { isMain: true }, take: 1 } } } },
      });
      stringName = sv?.product.name ?? null;
      stringImage = sv?.product.images[0]?.url ?? null;
    }

    result.push({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      unitPrice,
      stringVariantId,
      stringPrice,
      tension,
      gripChoice,
      productName: product.name,
      productImage: product.images[0]?.url ?? null,
      productCategory: product.category.slug,
      variantName: variant.name,
      variantAttrs: variant.attributes,
      stringName,
      stringImage,
    });
  }

  return result;
}

// ─── validateCheckout ─────────────────────────────────────────────────────────

export async function validateCheckout(input: CreateOrderInput, userId?: string) {
  if (input.itemsSource === 'cart' && !userId) {
    throw new BadRequestError('Cart checkout requires authentication');
  }

  const [address, customer, rawItems] = await Promise.all([
    resolveAddress(input, userId),
    resolveCustomer(input, userId),
    resolveItems(input, userId),
  ]);

  const validatedItems = await validateAndPriceItems(rawItems);

  const zone = getZoneForProvince(address.province);
  const shippingResult = calculateShippingFee(
    zone,
    input.shippingMethod,
    0,
    validatedItems.some((i) => i.stringVariantId !== null),
  );

  if (shippingResult.estimatedDays === null) {
    throw new BusinessRuleError('Express delivery not available in this zone', 'EXPRESS_NOT_AVAILABLE_IN_ZONE');
  }

  // Coupon + Points mutual exclusion
  if (input.couponCode && input.pointsToRedeem && input.pointsToRedeem > 0) {
    throw new BusinessRuleError(
      'Cannot combine coupon and loyalty points in the same order',
      'COUPON_AND_POINTS_NOT_COMBINABLE',
    );
  }

  let couponDiscount = 0;
  let couponCode: string | undefined;
  if (input.couponCode) {
    const itemSubtotal = validatedItems.reduce(
      (s, i) => s + (i.unitPrice + i.stringPrice) * i.quantity,
      0,
    );
    const cv = await verifyCouponRules(input.couponCode, itemSubtotal, userId);
    couponDiscount = cv.discount;
    couponCode = cv.code;
  }

  let pointsDiscount = 0;
  if (userId && input.pointsToRedeem && input.pointsToRedeem > 0) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User not found');
    const itemSubtotal = validatedItems.reduce(
      (s, i) => s + (i.unitPrice + i.stringPrice) * i.quantity,
      0,
    );
    const maxPoints = calculateMaxPointsRedeemable(itemSubtotal);
    if (input.pointsToRedeem > maxPoints) {
      throw new BusinessRuleError(`Maximum ${maxPoints} points can be redeemed for this order`, 'POINTS_EXCEED_LIMIT', { maxPoints });
    }
    if (input.pointsToRedeem > user.pointBalance) {
      throw new BusinessRuleError('Insufficient points balance', 'INSUFFICIENT_POINTS', { balance: user.pointBalance });
    }
    pointsDiscount = input.pointsToRedeem * 1000;
  }

  const totals = calculateOrderTotals({
    items: validatedItems.map((i) => ({ unitPrice: i.unitPrice, stringPrice: i.stringPrice, quantity: i.quantity })),
    shippingFee: shippingResult.fee,
    couponDiscount,
    pointsDiscount,
  });

  if (totals.subtotal < 1000) {
    throw new BusinessRuleError('Order subtotal is below minimum (1,000₫)', 'SUBTOTAL_TOO_LOW');
  }

  if (input.paymentMethod === 'COD' && totals.total > COD_MAX_ORDER_VALUE) {
    throw new BusinessRuleError(
      'Orders over 5,000,000₫ require online payment',
      'COD_LIMIT_EXCEEDED',
    );
  }

  return {
    customer,
    address,
    zone,
    items: validatedItems,
    estimatedDays: shippingResult.estimatedDays,
    couponCode,
    pointsToRedeem: input.pointsToRedeem ?? 0,
    ...totals,
  };
}

// ─── createOrder ──────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput, userId?: string) {
  const validated = await validateCheckout(input, userId);
  const {
    customer,
    address,
    zone,
    items,
    shippingFee,
    couponCode,
    couponDiscount,
    pointsToRedeem,
    pointsDiscount,
    subtotal,
    estimatedTax,
    total,
  } = validated;

  const orderCode = await generateOrderCode(async (code) => {
    const existing = await prisma.order.findUnique({ where: { orderCode: code } });
    return existing !== null;
  });

  // Payment expiry: 15 min for online methods, 24h for COD
  const expiresInMs =
    input.paymentMethod === 'COD' ? 24 * 60 * 60 * 1000 : 15 * 60 * 1000;
  const paymentExpiresAt = new Date(Date.now() + expiresInMs);

  let couponRow: Awaited<ReturnType<typeof getCouponByCode>> | null = null;
  if (couponCode) {
    couponRow = await getCouponByCode(couponCode);
  }

  // ── Atomic transaction ─────────────────────────────────────────────────────
  const order = await prisma.$transaction(async (tx) => {
    // 1. Row-level locks + stock validation
    for (const item of items) {
      const variant = await tx.$queryRaw<Array<{ id: string; stock: number }>>`
        SELECT id, stock FROM product_variants WHERE id = ${item.variantId}::uuid FOR UPDATE
      `;
      if (!variant[0] || variant[0].stock < item.quantity) {
        throw new BusinessRuleError(
          `Out of stock: ${item.productName} — ${item.variantName}`,
          'OUT_OF_STOCK',
        );
      }

      if (item.stringVariantId) {
        const sv = await tx.$queryRaw<Array<{ id: string; stock: number }>>`
          SELECT id, stock FROM product_variants WHERE id = ${item.stringVariantId}::uuid FOR UPDATE
        `;
        if (!sv[0] || sv[0].stock < item.quantity) {
          throw new BusinessRuleError(
            `String variant out of stock: ${item.stringVariantId}`,
            'OUT_OF_STOCK',
          );
        }
      }
    }

    // 2. Decrement stock
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
      if (item.stringVariantId) {
        await tx.productVariant.update({
          where: { id: item.stringVariantId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    // 3. Create Order
    const newOrder = await tx.order.create({
      data: {
        orderCode,
        userId: userId ?? null,
        customerEmail: customer.email,
        customerName: customer.fullName,
        customerPhone: customer.phone,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: input.paymentMethod,
        subtotal,
        shippingFee,
        shippingMethod: input.shippingMethod,
        couponCode: couponCode ?? null,
        couponDiscount,
        pointsRedeemed: pointsToRedeem,
        pointsDiscount,
        estimatedTax,
        total,
        shippingProvince: address.province,
        shippingDistrict: address.district,
        shippingWard: address.ward,
        shippingAddressLine: address.addressLine,
        shippingZone: zone,
        shippingNote: address.note ?? null,
        paymentExpiresAt,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            productImage: item.productImage,
            productCategory: item.productCategory,
            variantName: item.variantName,
            variantAttrs: item.variantAttrs ?? Prisma.JsonNull,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            lineSubtotal: (item.unitPrice + item.stringPrice) * item.quantity,
            stringVariantId: item.stringVariantId,
            stringName: item.stringName,
            stringImage: item.stringImage,
            tension: item.tension,
            gripChoice: item.gripChoice,
            stringPrice: item.stringPrice > 0 ? item.stringPrice : null,
          })),
        },
      },
      include: ORDER_INCLUDE,
    });

    // 4. Initial status history
    await tx.orderStatusHistory.create({
      data: {
        orderId: newOrder.id,
        fromStatus: null,
        toStatus: 'PENDING',
        changedBy: 'SYSTEM',
        reason: 'Order created',
      },
    });

    // 5. Coupon usage
    if (couponRow && couponCode) {
      await tx.coupon.update({
        where: { id: couponRow.id },
        data: { usedCount: { increment: 1 } },
      });
      await tx.couponUsage.create({
        data: {
          couponId: couponRow.id,
          userId: userId ?? null,
          orderId: newOrder.id,
          discount: couponDiscount,
        },
      });
    }

    // 6. Points deduction
    if (userId && pointsToRedeem > 0) {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { pointBalance: { decrement: pointsToRedeem } },
        select: { pointBalance: true },
      });
      await tx.pointTransaction.create({
        data: {
          userId,
          orderId: newOrder.id,
          type: 'REDEEM_ORDER',
          points: -pointsToRedeem,
          balance: updatedUser.pointBalance,
          description: `Points redeemed for order ${orderCode}`,
        },
      });
    }

    // 7. Clear cart (authenticated only)
    if (userId && input.itemsSource === 'cart') {
      const cart = await tx.cart.findUnique({ where: { userId } });
      if (cart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return newOrder;
  });

  // ── Post-commit: initiate payment ─────────────────────────────────────────
  const paymentInitiation = await initiatePayment({
    id: order.id,
    orderCode: order.orderCode,
    paymentMethod: order.paymentMethod,
    total: Number(order.total),
    customerEmail: order.customerEmail,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    ipAddress: input.ipAddress,
  });
  return { order, paymentInitiation };
}

// ─── Read operations ──────────────────────────────────────────────────────────

export async function getOrderById(orderId: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: ORDER_INCLUDE,
  });
  if (!order) throw new NotFoundError('Order not found');
  if (userId && order.userId !== userId) throw new NotFoundError('Order not found');
  return order;
}

export async function getOrderByCode(orderCode: string, email: string) {
  const order = await prisma.order.findUnique({
    where: { orderCode: orderCode.toUpperCase() },
    include: ORDER_INCLUDE,
  });
  if (!order || order.customerEmail.toLowerCase() !== email.toLowerCase()) {
    throw new NotFoundError('Order not found');
  }
  return order;
}

export async function listMyOrders(userId: string, params: {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const skip = (page - 1) * pageSize;
  const where = {
    userId,
    ...(params.status ? { status: params.status } : {}),
  };
  const [data, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize, include: ORDER_INCLUDE }),
    prisma.order.count({ where }),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function listAllOrders(params: {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = params.status ? { status: params.status } : {};
  const [data, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize, include: ORDER_INCLUDE }),
    prisma.order.count({ where }),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ─── updateOrderStatus ────────────────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  toStatus: OrderStatus,
  actor: OrderActor,
  options?: { reason?: string; note?: string; trackingNumber?: string },
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order not found');

  const lastHistoryEntry = await prisma.orderStatusHistory.findFirst({
    where: { orderId, toStatus: order.status },
    orderBy: { createdAt: 'desc' },
  });
  const hoursInCurrentState = lastHistoryEntry
    ? (Date.now() - lastHistoryEntry.createdAt.getTime()) / 3_600_000
    : 0;

  const { allowed, reason } = canTransition(order.status, toStatus, actor, hoursInCurrentState);
  if (!allowed) throw new BusinessRuleError(reason ?? 'Transition not allowed', 'INVALID_TRANSITION');

  const now = new Date();
  const updateData: Record<string, unknown> = { status: toStatus };

  if (toStatus === 'DELIVERED') updateData.deliveredAt = now;
  if (toStatus === 'COMPLETED') updateData.completedAt = now;
  if (toStatus === 'CANCELLED') {
    updateData.cancelledAt = now;
    updateData.cancelReason = options?.reason ?? null;
  }
  if (toStatus === 'SHIPPING' && options?.trackingNumber) {
    updateData.trackingNumber = options.trackingNumber;
    updateData.shippedAt = now;
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: orderId },
      data: updateData,
      include: ORDER_INCLUDE,
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus,
        changedBy: actor === 'CRON' ? 'CRON' : actor,
        reason: options?.reason ?? null,
        note: options?.note ?? null,
      },
    });

    // Side effects
    if (toStatus === 'CANCELLED') {
      // Stock rollback
      for (const item of await tx.orderItem.findMany({ where: { orderId } })) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
        if (item.stringVariantId) {
          await tx.productVariant.update({
            where: { id: item.stringVariantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Points refund
      if (updated.pointsRedeemed > 0 && updated.userId) {
        const updatedUser = await tx.user.update({
          where: { id: updated.userId },
          data: { pointBalance: { increment: updated.pointsRedeemed } },
          select: { pointBalance: true },
        });
        await tx.pointTransaction.create({
          data: {
            userId: updated.userId,
            orderId,
            type: 'REDEEM_ORDER',
            points: updated.pointsRedeemed,
            balance: updatedUser.pointBalance,
            description: `Points refunded for cancelled order ${updated.orderCode}`,
          },
        });
      }

      // Coupon usage rollback
      if (updated.couponCode) {
        const usage = await tx.couponUsage.findUnique({ where: { orderId } });
        if (usage) {
          await tx.coupon.update({
            where: { id: usage.couponId },
            data: { usedCount: { decrement: 1 } },
          });
          await tx.couponUsage.delete({ where: { orderId } });
        }
      }
    }

    if (toStatus === 'COMPLETED' && updated.userId) {
      // Idempotency: check if points already awarded
      const alreadyAwarded = await tx.pointTransaction.findFirst({
        where: {
          userId: updated.userId,
          description: { contains: updated.orderCode },
          type: 'PURCHASE_EARN',
        },
      });
      if (!alreadyAwarded) {
        const postDiscountSubtotal = Number(updated.subtotal) - Number(updated.couponDiscount) - Number(updated.pointsDiscount);
        const pointsEarned = calculatePointsEarned(postDiscountSubtotal);
        if (pointsEarned > 0) {
          const updatedUser = await tx.user.update({
            where: { id: updated.userId },
            data: { pointBalance: { increment: pointsEarned } },
            select: { pointBalance: true },
          });
          await tx.pointTransaction.create({
            data: {
              userId: updated.userId,
              orderId,
              type: 'PURCHASE_EARN',
              points: pointsEarned,
              balance: updatedUser.pointBalance,
              description: `Earned from order ${updated.orderCode}`,
            },
          });
        }
      }
    }

    return updated;
  });

  // ── Best-effort notification (outside transaction) ───────────────────────
  // `order` (pre-update plain fetch) has trackingNumber & cancelReason;
  // use `updatedOrder` for userId/orderCode/total, supplement from `order` for the new fields.
  if (updatedOrder.userId) {
    const notifInput = buildOrderNotificationInput(
      toStatus,
      updatedOrder.userId,
      updatedOrder.id,
      updatedOrder.orderCode,
      Number(updatedOrder.total),
      updatedOrder.items.length,
      options?.trackingNumber ?? order.trackingNumber ?? null,
      options?.reason ?? order.cancelReason ?? null,
    );
    if (notifInput) {
      sendNotification(notifInput)
        .catch((err) => console.error(`[order] notification failed for ${toStatus}:`, err));
    }
  }

  return updatedOrder;
}

// ── Notification input builder ────────────────────────────────────────────────

function buildOrderNotificationInput(
  toStatus: OrderStatus,
  userId: string,
  orderId: string,
  orderCode: string,
  total: number,
  itemCount: number,
  trackingNumber: string | null,
  cancelReason: string | null,
): Parameters<typeof sendNotification>[0] | null {
  if (toStatus === 'CONFIRMED') {
    return { type: 'ORDER_CONFIRMED', userId, payload: { orderCode, total, itemCount, orderId } };
  }
  if (toStatus === 'PROCESSING') {
    return { type: 'ORDER_PROCESSING', userId, payload: { orderCode, orderId } };
  }
  if (toStatus === 'SHIPPING') {
    return { type: 'ORDER_SHIPPED', userId, payload: { orderCode, trackingNumber: trackingNumber ?? undefined, orderId } };
  }
  if (toStatus === 'DELIVERED') {
    return { type: 'ORDER_DELIVERED', userId, payload: { orderCode, orderId } };
  }
  if (toStatus === 'CANCELLED') {
    return { type: 'ORDER_CANCELLED', userId, payload: { orderCode, reason: cancelReason ?? undefined, orderId } };
  }
  return null;
}

// ─── User cancel ──────────────────────────────────────────────────────────────

export async function cancelMyOrder(orderId: string, userId: string, reason?: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError('Order not found');
  if (order.userId !== userId) throw new NotFoundError('Order not found');

  const { allowed, reason: whyNot } = canTransition(order.status, 'CANCELLED', 'USER');
  if (!allowed) throw new BusinessRuleError(whyNot ?? 'Cannot cancel order in current status', 'INVALID_TRANSITION');

  return updateOrderStatus(orderId, 'CANCELLED', 'USER', { reason: reason ?? 'Cancelled by customer' });
}

// ─── Cron operations ──────────────────────────────────────────────────────────

export async function cancelTimedOutOrders() {
  const now = new Date();
  const timedOut = await prisma.order.findMany({
    where: { status: 'PENDING', paymentExpiresAt: { lt: now } },
    select: { id: true, orderCode: true },
  });

  let cancelled = 0;
  for (const o of timedOut) {
    try {
      await updateOrderStatus(o.id, 'CANCELLED', 'CRON', { reason: 'Payment timeout' });
      console.log(`[cron] Cancelled timed-out order ${o.orderCode}`);
      cancelled++;
    } catch (err) {
      console.error(`[cron] Failed to cancel ${o.orderCode}:`, err);
    }
  }
  return cancelled;
}

export async function autoCompleteDelivered() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const toComplete = await prisma.order.findMany({
    where: {
      status: 'DELIVERED',
      deliveredAt: { lt: sevenDaysAgo },
      // Exclude orders with an active return request (one-to-one relation)
      OR: [
        { returnRequest: { is: null } },
        { returnRequest: { status: { notIn: ['REQUESTED', 'APPROVED', 'RECEIVED'] } } },
      ],
    },
    select: { id: true, orderCode: true },
  });

  let completed = 0;
  for (const o of toComplete) {
    try {
      await updateOrderStatus(o.id, 'COMPLETED', 'CRON', { reason: '7 days after delivery' });
      console.log(`[cron] Auto-completed order ${o.orderCode}`);
      completed++;
    } catch (err) {
      console.error(`[cron] Failed to complete ${o.orderCode}:`, err);
    }
  }
  return completed;
}
