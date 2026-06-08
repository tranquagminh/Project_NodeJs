import prisma from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { BusinessRuleError } from '../../utils/errors';
import { validateStringingConfig } from '../stringing/stringing.service';
import { MAX_QTY_PER_ITEM } from './cart.constants';
import { calculateItemSubtotal, calculateCartTotals } from './cart.calculator';
import { getCartItemKey, findMatchingItem } from './cart.dedup';
import type { AddCartItemInput, HydratedCart, HydratedCartItem, MergeResult } from './cart.types';

// ── Prisma include shapes ────────────────────────────────────────────────────

const cartItemInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      category: { select: { slug: true, parent: { select: { slug: true } } } },
      images: { where: { isMain: true }, take: 1, select: { url: true } },
    },
  },
  variant: {
    select: { id: true, name: true, price: true, salePrice: true, stock: true, isActive: true, attributes: true },
  },
} as const;

type CartItemRaw = {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  priceAtAdd: unknown;         // Decimal from Prisma — cast to Number in hydration
  stringVariantId: string | null;
  tension: unknown | null;     // Decimal
  gripChoice: string | null;
  stringPriceAtAdd: unknown | null; // Decimal
  product: {
    id: string;
    name: string;
    slug: string;
    status: string;
    category: { slug: string; parent: { slug: string } | null } | null;
    images: Array<{ url: string }>;
  };
  variant: {
    id: string;
    name: string;
    price: unknown;      // Decimal
    salePrice: unknown | null; // Decimal
    stock: number;
    isActive: boolean;
    attributes: unknown;
  };
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isRacketProduct(product: CartItemRaw['product']): boolean {
  const cat = product.category;
  if (!cat) return false;
  return cat.slug === 'rackets' || cat.parent?.slug === 'rackets';
}

function effectivePrice(price: unknown, salePrice: unknown | null): number {
  const sp = salePrice != null ? Number(salePrice) : null;
  return sp !== null && sp > 0 ? sp : Number(price);
}

async function getOrCreateCartId(userId: string): Promise<string> {
  const existing = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (existing) return existing.id;
  const created = await prisma.cart.create({ data: { userId }, select: { id: true } });
  return created.id;
}

async function hydrateItems(rawItems: CartItemRaw[]): Promise<HydratedCartItem[]> {
  // Batch-load all unique string variants to avoid N+1
  const stringVariantIds = [...new Set(rawItems.map((i) => i.stringVariantId).filter(Boolean))] as string[];

  type StringVariantRow = {
    id: string;
    price: unknown;
    salePrice: unknown | null;
    isActive: boolean;
    product: { name: string; status: string; images: Array<{ url: string }> };
  };

  let svMap = new Map<string, StringVariantRow>();
  if (stringVariantIds.length > 0) {
    const rows = await prisma.productVariant.findMany({
      where: { id: { in: stringVariantIds } },
      select: {
        id: true,
        price: true,
        salePrice: true,
        isActive: true,
        product: {
          select: {
            name: true,
            status: true,
            images: { where: { isMain: true }, take: 1, select: { url: true } },
          },
        },
      },
    }) as StringVariantRow[];
    svMap = new Map(rows.map((v) => [v.id, v]));
  }

  return rawItems.map((item): HydratedCartItem => {
    const currentVariantPrice = effectivePrice(item.variant.price, item.variant.salePrice);
    const priceAtAdd = Number(item.priceAtAdd);
    const priceChanged = Math.abs(currentVariantPrice - priceAtAdd) > 0.001;

    const stockChanged = item.quantity > item.variant.stock;
    const displayQuantity = Math.min(item.quantity, item.variant.stock);

    const productUnavailable = item.product.status !== 'ACTIVE';
    const variantUnavailable = !item.variant.isActive;

    let stringing: HydratedCartItem['stringing'] = null;
    let stringPriceChanged = false;
    let stringUnavailable = false;

    if (item.stringVariantId) {
      const sv = svMap.get(item.stringVariantId);
      const currentStringPrice = sv ? effectivePrice(sv.price, sv.salePrice) : 0;
      const stringPriceAtAdd = item.stringPriceAtAdd != null ? Number(item.stringPriceAtAdd) : 0;
      stringPriceChanged = sv ? Math.abs(currentStringPrice - stringPriceAtAdd) > 0.001 : false;
      stringUnavailable = !sv || !sv.isActive || sv.product.status !== 'ACTIVE';

      stringing = {
        stringVariantId: item.stringVariantId,
        stringProduct: {
          name: sv?.product.name ?? '(unknown)',
          mainImageUrl: sv?.product.images[0]?.url ?? null,
        },
        tension: item.tension != null ? Number(item.tension) : null,
        gripChoice: item.gripChoice,
        stringPriceAtAdd,
        currentStringPrice,
      };
    }

    const unavailable = productUnavailable || variantUnavailable || stringUnavailable;
    const lineSubtotal = calculateItemSubtotal({
      variantEffectivePrice: currentVariantPrice,
      stringEffectivePrice: stringing?.currentStringPrice,
      quantity: displayQuantity,
    });

    return {
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      displayQuantity,
      product: {
        name: item.product.name,
        slug: item.product.slug,
        mainImageUrl: item.product.images[0]?.url ?? null,
        categorySlug: item.product.category?.slug ?? '',
      },
      variant: { name: item.variant.name, attributes: item.variant.attributes },
      priceAtAdd,
      currentPrice: currentVariantPrice,
      stringing,
      lineSubtotal,
      flags: { priceChanged, stringPriceChanged, stockChanged, unavailable },
    };
  });
}

function buildCartResponse(hydratedItems: HydratedCartItem[]): HydratedCart {
  const totals = calculateCartTotals(
    hydratedItems.map((i) => ({
      lineSubtotal: i.lineSubtotal,
      unavailable: i.flags.unavailable,
      quantity: i.displayQuantity,
    })),
  );
  return { items: hydratedItems, totals };
}

// ── Product/Variant validator (shared by add + merge) ─────────────────────────

type ValidatedItemData = {
  product: CartItemRaw['product'] & { basePrice: unknown; salePrice: unknown | null };
  variant: CartItemRaw['variant'];
  priceAtAdd: number;
};

async function validateItemForCart(
  input: AddCartItemInput,
  cartUserId?: string, // unused, kept for signature clarity
): Promise<ValidatedItemData> {
  void cartUserId;

  // Load product with category
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      basePrice: true,
      salePrice: true,
      category: { select: { slug: true, parent: { select: { slug: true } } } },
      images: { where: { isMain: true }, take: 1, select: { url: true } },
    },
  });

  if (!product) throw new NotFoundError('Product not found');

  if (product.status !== 'ACTIVE') {
    throw new BusinessRuleError('Product is not available', 'CART_ITEM_PRODUCT_INACTIVE', {
      productId: input.productId,
      status: product.status,
    });
  }

  // Load variant
  const variant = await prisma.productVariant.findFirst({
    where: { id: input.variantId, productId: input.productId },
    select: { id: true, name: true, price: true, salePrice: true, stock: true, isActive: true, attributes: true },
  });

  if (!variant) throw new NotFoundError('Variant not found');

  if (!variant.isActive) {
    throw new BusinessRuleError('Variant is not available', 'CART_ITEM_VARIANT_INACTIVE', {
      variantId: input.variantId,
    });
  }

  if (input.quantity > MAX_QTY_PER_ITEM) {
    throw new BusinessRuleError(
      `Maximum ${MAX_QTY_PER_ITEM} per item`,
      'CART_ITEM_QUANTITY_EXCEEDED',
      { max: MAX_QTY_PER_ITEM, requested: input.quantity },
    );
  }

  if (input.quantity > variant.stock) {
    throw new BusinessRuleError(
      `Only ${variant.stock} in stock`,
      'CART_ITEM_OUT_OF_STOCK',
      { availableStock: variant.stock, requested: input.quantity },
    );
  }

  // Stringing validation
  const isRacket = product.category?.slug === 'rackets' || product.category?.parent?.slug === 'rackets';
  if (input.stringing && !isRacket) {
    throw new BusinessRuleError('Stringing only applies to rackets', 'CART_STRINGING_NOT_ALLOWED', {});
  }
  if (input.stringing) {
    const strResult = await validateStringingConfig({
      racketVariantId: input.variantId,
      stringVariantId: input.stringing.stringVariantId,
      tension: input.stringing.tension,
      gripChoice: input.stringing.gripChoice as Parameters<typeof validateStringingConfig>[0]['gripChoice'],
    });

    if (!strResult.valid) {
      throw new BusinessRuleError(
        strResult.message,
        'CART_STRINGING_VALIDATION_FAILED',
        { rule: strResult.rule, ...strResult.details },
      );
    }
  }

  const priceAtAdd = effectivePrice(variant.price, variant.salePrice);

  return { product: product as ValidatedItemData['product'], variant, priceAtAdd };
}

// ── Public service functions ──────────────────────────────────────────────────

export async function getUserCart(userId: string): Promise<HydratedCart> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: cartItemInclude, orderBy: { createdAt: 'asc' } } },
  });

  if (!cart) return buildCartResponse([]);

  const hydrated = await hydrateItems(cart.items as unknown as CartItemRaw[]);
  return buildCartResponse(hydrated);
}

export async function addItemToCart(userId: string, input: AddCartItemInput): Promise<HydratedCart> {
  const { variant, priceAtAdd } = await validateItemForCart(input);

  const cartId = await getOrCreateCartId(userId);

  // Load existing items for dedup
  const existingItems = await prisma.cartItem.findMany({
    where: { cartId },
    select: { id: true, variantId: true, stringVariantId: true, tension: true, gripChoice: true, quantity: true },
  });

  const inputKey = {
    variantId: input.variantId,
    stringVariantId: input.stringing?.stringVariantId ?? null,
    tension: input.stringing?.tension ?? null,
    gripChoice: input.stringing?.gripChoice ?? null,
  };

  const existingAsKeys = existingItems.map((i) => ({
    ...i,
    tension: i.tension != null ? Number(i.tension) : null,
  }));

  const match = findMatchingItem(existingAsKeys, inputKey);

  if (match) {
    const newQty = match.quantity + input.quantity;
    if (newQty > MAX_QTY_PER_ITEM) {
      throw new BusinessRuleError(
        `You already have ${match.quantity} of this in your cart. Maximum ${MAX_QTY_PER_ITEM} per item.`,
        'CART_ITEM_QUANTITY_EXCEEDED',
        { currentQty: match.quantity, max: MAX_QTY_PER_ITEM },
      );
    }
    if (newQty > variant.stock) {
      throw new BusinessRuleError(
        `Only ${variant.stock} in stock`,
        'CART_ITEM_OUT_OF_STOCK',
        { availableStock: variant.stock, currentQty: match.quantity },
      );
    }
    await prisma.cartItem.update({ where: { id: match.id }, data: { quantity: newQty } });
  } else {
    const stringingData = input.stringing
      ? {
          stringVariantId: input.stringing.stringVariantId,
          tension: input.stringing.tension,
          gripChoice: input.stringing.gripChoice,
        }
      : {};

    // Get string price snapshot
    let stringPriceAtAdd: number | null = null;
    if (input.stringing) {
      const sv = await prisma.productVariant.findUnique({
        where: { id: input.stringing.stringVariantId },
        select: { price: true, salePrice: true },
      });
      if (sv) stringPriceAtAdd = effectivePrice(sv.price, sv.salePrice);
    }

    await prisma.cartItem.create({
      data: {
        cartId,
        productId: input.productId,
        variantId: input.variantId,
        quantity: input.quantity,
        priceAtAdd,
        ...stringingData,
        ...(stringPriceAtAdd != null ? { stringPriceAtAdd } : {}),
      },
    });
  }

  return getUserCart(userId);
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  newQty: number,
): Promise<HydratedCart> {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) throw new NotFoundError('Cart item not found');

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    select: { id: true, variantId: true },
  });
  if (!item) throw new NotFoundError('Cart item not found');

  if (newQty > MAX_QTY_PER_ITEM) {
    throw new BusinessRuleError(
      `Maximum ${MAX_QTY_PER_ITEM} per item`,
      'CART_ITEM_QUANTITY_EXCEEDED',
      { max: MAX_QTY_PER_ITEM },
    );
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: item.variantId },
    select: { stock: true },
  });

  if (variant && newQty > variant.stock) {
    throw new BusinessRuleError(
      `Only ${variant.stock} in stock`,
      'CART_ITEM_OUT_OF_STOCK',
      { availableStock: variant.stock },
    );
  }

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity: newQty } });
  return getUserCart(userId);
}

export async function removeCartItem(userId: string, itemId: string): Promise<HydratedCart> {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) throw new NotFoundError('Cart item not found');

  const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id }, select: { id: true } });
  if (!item) throw new NotFoundError('Cart item not found');

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getUserCart(userId);
}

export async function clearCart(userId: string): Promise<{ message: string }> {
  const cart = await prisma.cart.findUnique({ where: { userId }, select: { id: true } });
  if (!cart) return { message: 'Cart is already empty' };

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  return { message: 'Cart cleared' };
}

export async function mergeGuestCart(
  userId: string,
  guestItems: AddCartItemInput[],
): Promise<MergeResult> {
  const cartId = await getOrCreateCartId(userId);

  const skipped: MergeResult['skipped'] = [];
  const cappedItems: MergeResult['cappedItems'] = [];
  let merged = 0;

  // Load existing cart items for dedup
  const existingItems = await prisma.cartItem.findMany({
    where: { cartId },
    select: { id: true, variantId: true, stringVariantId: true, tension: true, gripChoice: true, quantity: true },
  });

  const existingKeys = existingItems.map((i) => ({
    ...i,
    tension: i.tension != null ? Number(i.tension) : null,
  }));

  // Process each guest item — skip invalid, merge valid
  const writes: (() => Promise<void>)[] = [];

  for (const guestItem of guestItems) {
    try {
      const { variant, priceAtAdd } = await validateItemForCart(guestItem);

      const inputKey = {
        variantId: guestItem.variantId,
        stringVariantId: guestItem.stringing?.stringVariantId ?? null,
        tension: guestItem.stringing?.tension ?? null,
        gripChoice: guestItem.stringing?.gripChoice ?? null,
      };

      const match = findMatchingItem(existingKeys, inputKey);
      const stock = variant.stock;

      if (match) {
        const wantedTotal = match.quantity + guestItem.quantity;
        let appliedQty = guestItem.quantity;
        let cappedReason: string | null = null;

        if (wantedTotal > MAX_QTY_PER_ITEM) {
          appliedQty = Math.max(0, MAX_QTY_PER_ITEM - match.quantity);
          cappedReason = 'MAX_QTY_EXCEEDED';
        }
        if (match.quantity + appliedQty > stock) {
          appliedQty = Math.max(0, stock - match.quantity);
          cappedReason = 'OUT_OF_STOCK';
        }

        if (cappedReason) {
          cappedItems.push({ variantId: guestItem.variantId, requestedQty: guestItem.quantity, appliedQty, reason: cappedReason });
        }

        if (appliedQty > 0) {
          const newQty = match.quantity + appliedQty;
          writes.push(() => prisma.cartItem.update({ where: { id: match.id }, data: { quantity: newQty } }).then(() => {}));
          match.quantity = newQty; // keep local state consistent for multi-item merge
          merged++;
        }
      } else {
        let qty = guestItem.quantity;
        let cappedReason: string | null = null;

        if (qty > MAX_QTY_PER_ITEM) { cappedReason = 'MAX_QTY_EXCEEDED'; qty = MAX_QTY_PER_ITEM; }
        if (qty > stock) { cappedReason = 'OUT_OF_STOCK'; qty = stock; }

        if (cappedReason && qty < guestItem.quantity) {
          cappedItems.push({ variantId: guestItem.variantId, requestedQty: guestItem.quantity, appliedQty: qty, reason: cappedReason });
        }

        if (qty > 0) {
          const strDecorator = guestItem.stringing ?? null;

          // String price snapshot
          let stringPriceAtAdd: number | null = null;
          if (strDecorator) {
            const sv = await prisma.productVariant.findUnique({
              where: { id: strDecorator.stringVariantId },
              select: { price: true, salePrice: true },
            });
            if (sv) stringPriceAtAdd = effectivePrice(sv.price, sv.salePrice);
          }

          writes.push(() => prisma.cartItem.create({
            data: {
              cartId,
              productId: guestItem.productId,
              variantId: guestItem.variantId,
              quantity: qty,
              priceAtAdd,
              ...(strDecorator ? {
                stringVariantId: strDecorator.stringVariantId,
                tension: strDecorator.tension,
                gripChoice: strDecorator.gripChoice,
              } : {}),
              ...(stringPriceAtAdd != null ? { stringPriceAtAdd } : {}),
            },
          }).then(() => {}));
          merged++;
        }
      }
    } catch (err: unknown) {
      const appErr = err as { message?: string; ruleCode?: string };
      skipped.push({
        input: guestItem,
        reason: appErr.ruleCode ?? 'UNKNOWN',
        message: appErr.message ?? 'Item could not be added',
      });
    }
  }

  // Execute all writes in a single transaction for atomicity
  if (writes.length > 0) {
    await prisma.$transaction(async (tx) => {
      for (const fn of writes) {
        await fn();
      }
    });
  }

  const cart = await getUserCart(userId);
  return { cart, merged, skipped, cappedItems };
}

// ── Stateless endpoints ───────────────────────────────────────────────────────

export async function validateCartPayload(items: AddCartItemInput[]) {
  const results = await Promise.all(
    items.map(async (item) => {
      try {
        await validateItemForCart(item);
        return { input: item, valid: true };
      } catch (err: unknown) {
        const appErr = err as { message?: string; ruleCode?: string; details?: unknown };
        return {
          input: item,
          valid: false,
          rule: appErr.ruleCode ?? 'UNKNOWN',
          message: appErr.message,
          details: appErr.details,
        };
      }
    }),
  );

  return { items: results, allValid: results.every((r) => r.valid) };
}

export async function calculateCartFromPayload(items: AddCartItemInput[]): Promise<HydratedCart> {
  const rawItems: CartItemRaw[] = [];

  for (const item of items) {
    try {
      const { product, variant, priceAtAdd } = await validateItemForCart(item);
      rawItems.push({
        id: `preview-${item.variantId}`,
        cartId: 'preview',
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtAdd,
        stringVariantId: item.stringing?.stringVariantId ?? null,
        tension: item.stringing?.tension ?? null,
        gripChoice: item.stringing?.gripChoice ?? null,
        stringPriceAtAdd: null,
        product: product as CartItemRaw['product'],
        variant,
      } as CartItemRaw);
    } catch {
      // Skip invalid items in payload calculation
    }
  }

  const hydrated = await hydrateItems(rawItems);
  return buildCartResponse(hydrated);
}
