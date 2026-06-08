import { ReturnStatus, PaymentMethod } from '@prisma/client';
import prisma from '../../config/database';
import { NotFoundError, BadRequestError, BusinessRuleError, ForbiddenError } from '../../utils/errors';
import { updateOrderStatus } from '../order/order.service';
import { getPaymentProvider } from '../payment/payment.factory';
import { awardPoints } from '../points/points.service';
import { canItemBeReturned } from './returns.eligibility';
import { calculateRefundAmount, pointsDiscountToPoints } from './returns.refund-calculator';
import { sendNotification } from '../notification/notification.service';
import {
  SubmitReturnInput,
  ApproveReturnInput,
  RejectReturnInput,
  MarkReceivedInput,
  SubmitTrackingInput,
  ReturnActor,
  canTransitionReturn,
} from './returns.types';

const RETURN_INCLUDE = {
  items: { include: { orderItem: true } },
  order: { include: { items: true } },
  user: { select: { id: true, fullName: true, email: true } },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function assertTransition(fromStatus: ReturnStatus, toStatus: ReturnStatus, actor: ReturnActor) {
  const { allowed, reason } = canTransitionReturn(fromStatus, toStatus, actor);
  if (!allowed) throw new BusinessRuleError(reason ?? 'Transition not allowed', 'INVALID_RETURN_TRANSITION');
}

function daysSince(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
}

// ─── User: Submit return ──────────────────────────────────────────────────────

export async function submitReturn(
  input: SubmitReturnInput,
  orderId: string,
  userId: string,
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || order.userId !== userId) throw new NotFoundError('Order not found');
  if (order.status !== 'DELIVERED') {
    throw new BusinessRuleError('Order must be DELIVERED to request a return', 'ORDER_NOT_DELIVERED');
  }

  const days = daysSince(order.deliveredAt!);
  if (days > 7) {
    throw new BusinessRuleError('Return window (7 days) has expired', 'RETURN_WINDOW_EXPIRED');
  }

  // R3: one active return per order
  const existing = await prisma.returnRequest.findUnique({ where: { orderId } });
  if (existing && !['REJECTED', 'CANCELLED'].includes(existing.status)) {
    throw new BusinessRuleError('A return request is already in progress for this order', 'RETURN_ALREADY_IN_PROGRESS');
  }

  // R4: must include all items (MVP: full-order returns only)
  const allItemIds = new Set(order.items.map((i) => i.id));
  const submittedIds = new Set(input.items.map((i) => i.orderItemId));
  const totalOrderQty = order.items.reduce((s, i) => s + i.quantity, 0);
  const totalReturnQty = input.items.reduce((s, i) => s + i.quantity, 0);

  if (
    submittedIds.size !== allItemIds.size ||
    [...submittedIds].some((id) => !allItemIds.has(id)) ||
    totalReturnQty !== totalOrderQty
  ) {
    throw new BusinessRuleError(
      'Partial returns are not supported. Please include all order items.',
      'MUST_RETURN_ALL_ITEMS',
    );
  }

  // R5: per-item eligibility
  for (const returnItem of input.items) {
    const orderItem = order.items.find((i) => i.id === returnItem.orderItemId)!;
    const result = canItemBeReturned({
      productCategory: orderItem.productCategory,
      hasStringing: orderItem.stringVariantId !== null,
      sealOpened: false, // user declares; MVP: trust user
      reason: input.reason,
      daysSinceDelivery: days,
    });
    if (!result.eligible) {
      throw new BusinessRuleError(
        result.message ?? 'Item is not eligible for return',
        result.ruleCode ?? 'ITEM_NOT_RETURNABLE',
        { orderItemId: returnItem.orderItemId, productCategory: orderItem.productCategory },
      );
    }
  }

  // R6: image required for DEFECTIVE/DAMAGED_SHIPPING
  if (['DEFECTIVE', 'DAMAGED_SHIPPING'].includes(input.reason)) {
    if (!input.customerImages || input.customerImages.length === 0) {
      throw new BusinessRuleError(
        'At least 1 image is required for defective/damaged returns',
        'IMAGES_REQUIRED',
      );
    }
  }

  // R7: bank info required for COD
  if (order.paymentMethod === 'COD' || order.paymentMethod === 'BANK_TRANSFER') {
    if (!input.refundBankName || !input.refundBankAccount || !input.refundBankHolder) {
      throw new BadRequestError('Bank account details are required for COD/bank-transfer refunds');
    }
  }

  // Create ReturnRequest
  const returnRequest = await prisma.returnRequest.create({
    data: {
      orderId,
      userId,
      reason: input.reason,
      reasonNote: input.reasonNote,
      customerImages: input.customerImages ?? [],
      refundBankName: input.refundBankName,
      refundBankAccount: input.refundBankAccount,
      refundBankHolder: input.refundBankHolder,
      items: {
        create: input.items.map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
        })),
      },
    },
    include: RETURN_INCLUDE,
  });

  return returnRequest;
}

// ─── Guest return (lookup by orderCode + email) ───────────────────────────────

export async function submitGuestReturn(
  input: SubmitReturnInput,
  orderCode: string,
  email: string,
) {
  const order = await prisma.order.findUnique({
    where: { orderCode: orderCode.toUpperCase() },
  });
  if (!order || order.customerEmail.toLowerCase() !== email.toLowerCase()) {
    throw new NotFoundError('Order not found');
  }
  return submitReturn(input, order.id, order.userId ?? '');
}

// ─── User: cancel / tracking ──────────────────────────────────────────────────

export async function cancelReturn(returnRequestId: string, userId: string) {
  const req = await prisma.returnRequest.findUnique({ where: { id: returnRequestId } });
  if (!req || req.userId !== userId) throw new NotFoundError('Return request not found');
  assertTransition(req.status, 'CANCELLED', 'USER');
  return prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: { status: 'CANCELLED' },
    include: RETURN_INCLUDE,
  });
}

export async function submitReturnTracking(
  returnRequestId: string,
  userId: string,
  input: SubmitTrackingInput,
) {
  const req = await prisma.returnRequest.findUnique({ where: { id: returnRequestId } });
  if (!req || req.userId !== userId) throw new NotFoundError('Return request not found');
  if (req.status !== 'APPROVED') {
    throw new BusinessRuleError(
      'Can only submit tracking after the return is approved',
      'INVALID_RETURN_TRANSITION',
    );
  }
  return prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: {
      returnTrackingNumber: input.returnTrackingNumber,
      returnTrackingCarrier: input.returnTrackingCarrier,
    },
    include: RETURN_INCLUDE,
  });
}

// ─── User: list / detail ─────────────────────────────────────────────────────

export async function listMyReturns(userId: string, params: { page?: number; pageSize?: number } = {}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const [data, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: RETURN_INCLUDE,
    }),
    prisma.returnRequest.count({ where: { userId } }),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getMyReturn(returnRequestId: string, userId: string) {
  const req = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: RETURN_INCLUDE,
  });
  if (!req || req.userId !== userId) throw new NotFoundError('Return request not found');
  return req;
}

// ─── Admin: list / detail ─────────────────────────────────────────────────────

export async function listAdminReturns(params: {
  status?: ReturnStatus;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const where = params.status ? { status: params.status } : {};
  const [data, total] = await Promise.all([
    prisma.returnRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: RETURN_INCLUDE,
    }),
    prisma.returnRequest.count({ where }),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getAdminReturn(returnRequestId: string) {
  const req = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: RETURN_INCLUDE,
  });
  if (!req) throw new NotFoundError('Return request not found');
  return req;
}

// ─── Admin: approve ──────────────────────────────────────────────────────────

export async function approveReturn(returnRequestId: string, input: ApproveReturnInput) {
  const req = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: { order: { include: { items: true } }, items: { include: { orderItem: true } } },
  });
  if (!req) throw new NotFoundError('Return request not found');
  assertTransition(req.status, 'APPROVED', 'ADMIN');

  // Calculate refund amounts
  const refundItems = req.items.map((ri) => ({
    lineSubtotal: Number(ri.orderItem.lineSubtotal),
    stringPrice: Number(ri.orderItem.stringPrice ?? 0),
    hasStringing: ri.orderItem.stringVariantId !== null,
  }));

  const calc = calculateRefundAmount({
    items: refundItems,
    reason: req.reason,
    originalShippingFee: Number(req.order.shippingFee),
    originalPointsDiscount: Number(req.order.pointsDiscount),
  });

  const updated = await prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: {
      status: 'APPROVED',
      adminNote: input.adminNote,
      reviewedByUserId: input.adminUserId,
      reviewedAt: new Date(),
      refundItemAmount: calc.itemRefund,
      refundShippingAmount: calc.shippingRefund,
      refundTotal: calc.total,
    },
    include: RETURN_INCLUDE,
  });

  // Best-effort notification
  if (updated.userId) {
    sendNotification({
      type: 'RETURN_APPROVED',
      userId: updated.userId,
      payload: { orderCode: updated.order.orderCode, returnId: returnRequestId },
    }).catch((err) => console.error('[returns] RETURN_APPROVED notification failed:', err));
  }

  return updated;
}

// ─── Admin: reject ───────────────────────────────────────────────────────────

export async function rejectReturn(returnRequestId: string, input: RejectReturnInput) {
  const req = await prisma.returnRequest.findUnique({ where: { id: returnRequestId } });
  if (!req) throw new NotFoundError('Return request not found');
  assertTransition(req.status, 'REJECTED', 'ADMIN');

  const updated = await prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: {
      status: 'REJECTED',
      rejectionReason: input.rejectionReason,
      reviewedByUserId: input.adminUserId,
      reviewedAt: new Date(),
    },
    include: RETURN_INCLUDE,
  });

  // Best-effort notification
  if (updated.userId) {
    sendNotification({
      type: 'RETURN_REJECTED',
      userId: updated.userId,
      payload: { orderCode: updated.order.orderCode, reason: input.rejectionReason ?? undefined, returnId: returnRequestId },
    }).catch((err) => console.error('[returns] RETURN_REJECTED notification failed:', err));
  }

  return updated;
}

// ─── Admin: mark received ─────────────────────────────────────────────────────

export async function markReturnReceived(returnRequestId: string, input: MarkReceivedInput) {
  const req = await prisma.returnRequest.findUnique({ where: { id: returnRequestId } });
  if (!req) throw new NotFoundError('Return request not found');
  assertTransition(req.status, 'RECEIVED', 'ADMIN');

  return prisma.returnRequest.update({
    where: { id: returnRequestId },
    data: {
      status: 'RECEIVED',
      receivedAt: new Date(),
      receivedByUserId: input.adminUserId,
    },
    include: RETURN_INCLUDE,
  });
}

// ─── Admin: process refund (RECEIVED → REFUNDED) ──────────────────────────────

export async function processRefund(returnRequestId: string) {
  const req = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: {
      order: { include: { items: true } },
      items: { include: { orderItem: true } },
    },
  });
  if (!req) throw new NotFoundError('Return request not found');
  assertTransition(req.status, 'REFUNDED', 'SYSTEM');

  const order = req.order;
  const pointsToReturn = pointsDiscountToPoints(Number(order.pointsDiscount));

  // ── Atomic DB updates ─────────────────────────────────────────────────────
  await prisma.$transaction(async (tx) => {
    // 1. Mark return as refunded
    await tx.returnRequest.update({
      where: { id: returnRequestId },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    });

    // 2. Refund points (if any were redeemed)
    if (pointsToReturn > 0 && order.userId) {
      const user = await tx.user.update({
        where: { id: order.userId },
        data: { pointBalance: { increment: pointsToReturn } },
        select: { pointBalance: true },
      });
      await tx.pointTransaction.create({
        data: {
          userId: order.userId,
          orderId: order.id,
          type: 'REFUNDED',
          points: pointsToReturn,
          balance: user.pointBalance,
          description: `Points refunded for return ${order.orderCode}`,
        },
      });
    }

    // 3. Decrement coupon usage (if coupon was applied)
    if (order.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: order.couponCode } });
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { decrement: 1 } },
        });
        await tx.couponUsage.deleteMany({ where: { orderId: order.id } });
      }
    }
  });

  // ── Update order status (outside main tx) ────────────────────────────────
  await updateOrderStatus(order.id, 'REFUNDED', 'SYSTEM', {
    reason: `Return processed — refund total: ${Number(req.refundTotal).toLocaleString()}₫`,
  });

  // ── Gateway refund (best-effort, after DB committed) ─────────────────────
  const method = order.paymentMethod as PaymentMethod;
  const isManualRefund = method === 'COD' || method === 'BANK_TRANSFER';

  if (!isManualRefund) {
    const successfulTxn = await prisma.orderPaymentTransaction.findFirst({
      where: { orderId: order.id, status: 'SUCCESS' },
      orderBy: { createdAt: 'desc' },
    });

    if (successfulTxn) {
      const provider = getPaymentProvider(method);
      if (provider.refund) {
        try {
          const result = await provider.refund({
            orderId: order.id,
            orderCode: order.orderCode,
            gatewayTxnRef: successfulTxn.gatewayTxnRef,
            amount: Number(req.refundTotal),
            reason: `Return: ${req.reason}`,
          });

          if (result.success) {
            await prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: 'REFUNDED' },
            });
            await prisma.returnRequest.update({
              where: { id: returnRequestId },
              data: { refundTransactionId: result.refundId },
            });
          } else {
            console.error(`[refund] Gateway refund failed for ${order.orderCode}: ${result.message}`);
            // ReturnRequest stays REFUNDED; paymentStatus stays PAID; admin must handle manually
          }
        } catch (err) {
          console.error(`[refund] Gateway error for ${order.orderCode}:`, err);
        }
      }
    }
  } else {
    // COD/BankTransfer: mark as REFUNDED manually (admin transfers via banking app)
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'REFUNDED' },
    });
  }

  const finalReq = await prisma.returnRequest.findUnique({
    where: { id: returnRequestId },
    include: RETURN_INCLUDE,
  });

  // Best-effort notifications
  if (order.userId) {
    sendNotification({
      type: 'RETURN_COMPLETED',
      userId: order.userId,
      payload: { orderCode: order.orderCode, amount: Number(req.refundTotal), returnId: returnRequestId },
    }).catch((err) => console.error('[returns] RETURN_COMPLETED notification failed:', err));

    sendNotification({
      type: 'PAYMENT_REFUNDED',
      userId: order.userId,
      payload: { orderCode: order.orderCode, amount: Number(req.refundTotal), orderId: order.id },
    }).catch((err) => console.error('[returns] PAYMENT_REFUNDED notification failed:', err));
  }

  return finalReq;
}
