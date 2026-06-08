import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundError } from '../../../utils/errors';
import { BusinessRuleError } from '../../../utils/errors';

// ── Hoisted mocks ─────────────────────────────────────────────────────────────
const mockCart = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
}));

const mockCartItem = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
}));

const mockProduct = vi.hoisted(() => ({ findUnique: vi.fn() }));
const mockProductVariant = vi.hoisted(() => ({ findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn() }));

const mockTransaction = vi.hoisted(() =>
  vi.fn(async (fn: unknown) => {
    if (typeof fn === 'function') return fn({});
    return Promise.all(fn as Promise<unknown>[]);
  }),
);

vi.mock('../../../config/database', () => ({
  default: {
    cart: mockCart,
    cartItem: mockCartItem,
    product: mockProduct,
    productVariant: mockProductVariant,
    $transaction: mockTransaction,
  },
}));

// Mock stringing validator
const mockValidateStringingConfig = vi.hoisted(() => vi.fn());
vi.mock('../../stringing/stringing.service', () => ({
  validateStringingConfig: mockValidateStringingConfig,
}));

import * as cartService from '../cart.service';

// ── Fixtures ─────────────────────────────────────────────────────────────────
const userId = 'user-id-1';
const cartId = 'cart-id-1';

const testCart = { id: cartId, userId, createdAt: new Date(), updatedAt: new Date() };

const racketCategory = { slug: 'astrox-series', parent: { slug: 'rackets' } };
const nonRacketCategory = { slug: 'shoes', parent: null };

const testProduct = {
  id: 'product-id-1', name: 'ASTROX 88D', slug: 'astrox-88d',
  status: 'ACTIVE', basePrice: 2_350_000, salePrice: null,
  category: racketCategory,
  images: [{ url: '/img/astrox.jpg' }],
};

const testVariant = {
  id: 'variant-id-1', name: '4U G5',
  price: 2_350_000, salePrice: null,
  stock: 15, isActive: true,
  attributes: { weight: '4U', gripSize: 'G5' },
};

const testStringVariant = {
  id: 'sv-id-1', name: 'BG80 Roll',
  price: 180_000, salePrice: null,
  stock: 100, isActive: true,
  attributes: {},
};

const rawCartItem = {
  id: 'item-id-1', cartId, productId: testProduct.id, variantId: testVariant.id,
  quantity: 1, priceAtAdd: 2_350_000,
  stringVariantId: null, tension: null, gripChoice: null, stringPriceAtAdd: null,
  product: testProduct,
  variant: testVariant,
};

const rawStringedCartItem = {
  ...rawCartItem, id: 'item-id-2',
  stringVariantId: testStringVariant.id, tension: 26, gripChoice: 'ORIGINAL', stringPriceAtAdd: 180_000,
};

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeEach(() => {
  mockCart.findUnique.mockResolvedValue(testCart);
  mockCart.create.mockResolvedValue(testCart);
  mockCartItem.findMany.mockResolvedValue([]);
  mockCartItem.findFirst.mockResolvedValue(null);
  mockCartItem.create.mockResolvedValue(rawCartItem);
  mockCartItem.update.mockResolvedValue(rawCartItem);
  mockCartItem.delete.mockResolvedValue(rawCartItem);
  mockCartItem.deleteMany.mockResolvedValue({ count: 0 });
  mockProduct.findUnique.mockResolvedValue(testProduct);
  mockProductVariant.findFirst.mockResolvedValue(testVariant);
  mockProductVariant.findUnique.mockResolvedValue(testStringVariant);
  mockProductVariant.findMany.mockResolvedValue([]); // no string variants by default
  mockValidateStringingConfig.mockResolvedValue({ valid: true });
  mockTransaction.mockImplementation(async (fn: unknown) => {
    if (typeof fn === 'function') return fn({});
    return Promise.all((fn as Promise<unknown>[]));
  });
});

// ── getUserCart ───────────────────────────────────────────────────────────────
describe('getUserCart', () => {
  it('returns empty cart (no DB rows) when user has no cart', async () => {
    mockCart.findUnique.mockResolvedValue(null);
    const cart = await cartService.getUserCart(userId);
    expect(cart.items).toHaveLength(0);
    expect(cart.totals.subtotal).toBe(0);
    expect(cart.totals.itemCount).toBe(0);
  });

  it('returns hydrated cart items for existing cart', async () => {
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [rawCartItem] });
    const cart = await cartService.getUserCart(userId);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].currentPrice).toBe(2_350_000);
    expect(cart.items[0].stringing).toBeNull();
  });

  it('priceChanged: true when currentPrice !== priceAtAdd', async () => {
    const changedPriceVariant = { ...testVariant, salePrice: 2_000_000 };
    const item = { ...rawCartItem, priceAtAdd: 2_350_000, variant: changedPriceVariant };
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [item] });
    const cart = await cartService.getUserCart(userId);
    expect(cart.items[0].flags.priceChanged).toBe(true);
    expect(cart.items[0].priceAtAdd).toBe(2_350_000);
    expect(cart.items[0].currentPrice).toBe(2_000_000);
  });

  it('stockChanged: true and displayQuantity capped when qty > stock', async () => {
    const lowStockVariant = { ...testVariant, stock: 2 };
    const item = { ...rawCartItem, quantity: 5, variant: lowStockVariant };
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [item] });
    const cart = await cartService.getUserCart(userId);
    expect(cart.items[0].flags.stockChanged).toBe(true);
    expect(cart.items[0].displayQuantity).toBe(2);
    expect(cart.items[0].quantity).toBe(5); // DB value unchanged
  });

  it('unavailable: true when product is not ACTIVE, excluded from totals', async () => {
    const archivedProduct = { ...testProduct, status: 'ARCHIVED' };
    const item = { ...rawCartItem, product: archivedProduct };
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [item] });
    const cart = await cartService.getUserCart(userId);
    expect(cart.items[0].flags.unavailable).toBe(true);
    expect(cart.totals.subtotal).toBe(0);
    expect(cart.totals.itemCount).toBe(0);
  });

  it('unavailable: true when variant is inactive', async () => {
    const inactiveVariant = { ...testVariant, isActive: false };
    const item = { ...rawCartItem, variant: inactiveVariant };
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [item] });
    const cart = await cartService.getUserCart(userId);
    expect(cart.items[0].flags.unavailable).toBe(true);
  });

  it('returns stringing details when stringVariantId is set', async () => {
    const sv = { ...testStringVariant, product: { name: 'BG80', status: 'ACTIVE', images: [{ url: '/img/bg80.jpg' }] } };
    mockProductVariant.findMany.mockResolvedValue([sv]);
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [rawStringedCartItem] });
    const cart = await cartService.getUserCart(userId);
    expect(cart.items[0].stringing).not.toBeNull();
    expect(cart.items[0].stringing!.tension).toBe(26);
    expect(cart.items[0].stringing!.stringProduct.name).toBe('BG80');
  });

  it('unavailable: true when string variant is inactive', async () => {
    const inactiveSv = { ...testStringVariant, isActive: false, product: { name: 'BG80', status: 'ACTIVE', images: [] } };
    mockProductVariant.findMany.mockResolvedValue([inactiveSv]);
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [rawStringedCartItem] });
    const cart = await cartService.getUserCart(userId);
    expect(cart.items[0].flags.unavailable).toBe(true);
  });
});

// ── addItemToCart ──────────────────────────────────────────────────────────────
describe('addItemToCart', () => {
  const input = { productId: testProduct.id, variantId: testVariant.id, quantity: 1 };

  beforeEach(() => {
    // Reset call history on all mocks before each addItemToCart test
    vi.clearAllMocks();
    // Default: cart exists, no existing items
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [] });
    mockCartItem.findMany.mockResolvedValue([]);
    mockCartItem.create.mockResolvedValue(rawCartItem);
    mockCartItem.update.mockResolvedValue(rawCartItem);
    mockProduct.findUnique.mockResolvedValue(testProduct);
    mockProductVariant.findFirst.mockResolvedValue(testVariant);
    mockProductVariant.findUnique.mockResolvedValue(testStringVariant);
    mockValidateStringingConfig.mockResolvedValue({ valid: true });
  });

  it('happy path (no stringing): creates item with priceAtAdd snapshot', async () => {
    await cartService.addItemToCart(userId, input);
    expect(mockCartItem.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ priceAtAdd: 2_350_000 }) }),
    );
  });

  it('creates cart if user has none', async () => {
    mockCart.findUnique
      .mockResolvedValueOnce(null)  // getOrCreateCartId: findUnique
      .mockResolvedValueOnce(null)  // getUserCart: findUnique → no cart → empty
    mockCart.create.mockResolvedValue(testCart);
    mockCartItem.findMany.mockResolvedValue([]);
    await cartService.addItemToCart(userId, input);
    expect(mockCart.create).toHaveBeenCalled();
  });

  it('dedup: increments quantity when exact same item already in cart', async () => {
    const existingItem = {
      id: 'item-id-1', variantId: testVariant.id,
      stringVariantId: null, tension: null, gripChoice: null, quantity: 2,
    };
    mockCartItem.findMany.mockResolvedValue([existingItem]);
    await cartService.addItemToCart(userId, { ...input, quantity: 1 });
    expect(mockCartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantity: 3 } }),
    );
    expect(mockCartItem.create).not.toHaveBeenCalled();
  });

  it('happy path (with stringing): validateStringingConfig called, stringing fields saved', async () => {
    const strInput = {
      ...input,
      stringing: { stringVariantId: testStringVariant.id, tension: 26, gripChoice: 'ORIGINAL' },
    };
    await cartService.addItemToCart(userId, strInput);
    expect(mockValidateStringingConfig).toHaveBeenCalledWith(
      expect.objectContaining({ racketVariantId: testVariant.id, stringVariantId: testStringVariant.id }),
    );
    expect(mockCartItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ stringVariantId: testStringVariant.id, tension: 26 }),
      }),
    );
  });

  it('422 CART_STRINGING_VALIDATION_FAILED when validator rejects', async () => {
    mockValidateStringingConfig.mockResolvedValue({
      valid: false, rule: 'MAX_TENSION_EXCEEDED', message: 'Too high', details: {},
    });
    await expect(
      cartService.addItemToCart(userId, {
        ...input,
        stringing: { stringVariantId: testStringVariant.id, tension: 35, gripChoice: 'ORIGINAL' },
      }),
    ).rejects.toThrow(BusinessRuleError);
    const err = await cartService.addItemToCart(userId, {
      ...input,
      stringing: { stringVariantId: testStringVariant.id, tension: 35, gripChoice: 'ORIGINAL' },
    }).catch((e) => e);
    expect(err.ruleCode).toBe('CART_STRINGING_VALIDATION_FAILED');
  });

  it('422 CART_STRINGING_NOT_ALLOWED when stringing on a non-racket product', async () => {
    const shoeProduct = { ...testProduct, category: nonRacketCategory };
    mockProduct.findUnique.mockResolvedValue(shoeProduct);
    await expect(
      cartService.addItemToCart(userId, {
        ...input,
        stringing: { stringVariantId: testStringVariant.id, tension: 26, gripChoice: 'ORIGINAL' },
      }),
    ).rejects.toThrow(BusinessRuleError);
  });

  it('422 CART_ITEM_PRODUCT_INACTIVE for ARCHIVED product', async () => {
    mockProduct.findUnique.mockResolvedValue({ ...testProduct, status: 'ARCHIVED' });
    const err = await cartService.addItemToCart(userId, input).catch((e) => e);
    expect(err).toBeInstanceOf(BusinessRuleError);
    expect(err.ruleCode).toBe('CART_ITEM_PRODUCT_INACTIVE');
  });

  it('404 when product does not exist', async () => {
    mockProduct.findUnique.mockResolvedValue(null);
    await expect(cartService.addItemToCart(userId, input)).rejects.toThrow(NotFoundError);
  });

  it('422 CART_ITEM_OUT_OF_STOCK when qty > stock', async () => {
    mockProductVariant.findFirst.mockResolvedValue({ ...testVariant, stock: 2 });
    const err = await cartService.addItemToCart(userId, { ...input, quantity: 5 }).catch((e) => e);
    expect(err.ruleCode).toBe('CART_ITEM_OUT_OF_STOCK');
    expect(err.details.availableStock).toBe(2);
  });

  it('422 CART_ITEM_QUANTITY_EXCEEDED when qty > MAX (5)', async () => {
    const err = await cartService.addItemToCart(userId, { ...input, quantity: 6 }).catch((e) => e);
    expect(err.ruleCode).toBe('CART_ITEM_QUANTITY_EXCEEDED');
  });

  it('dedup limit: 422 CART_ITEM_QUANTITY_EXCEEDED when existing + new > MAX', async () => {
    const existingItem = {
      id: 'item-id-1', variantId: testVariant.id,
      stringVariantId: null, tension: null, gripChoice: null, quantity: 5,
    };
    mockCartItem.findMany.mockResolvedValue([existingItem]);
    const err = await cartService.addItemToCart(userId, { ...input, quantity: 1 }).catch((e) => e);
    expect(err.ruleCode).toBe('CART_ITEM_QUANTITY_EXCEEDED');
  });

  it('same racket + different tension = separate lines (no dedup)', async () => {
    const existingItem = {
      id: 'item-id-1', variantId: testVariant.id,
      stringVariantId: testStringVariant.id, tension: 26, gripChoice: 'ORIGINAL', quantity: 1,
    };
    mockCartItem.findMany.mockResolvedValue([existingItem]);
    await cartService.addItemToCart(userId, {
      ...input,
      stringing: { stringVariantId: testStringVariant.id, tension: 28, gripChoice: 'ORIGINAL' },
    });
    expect(mockCartItem.create).toHaveBeenCalled();  // new line, not update
    expect(mockCartItem.update).not.toHaveBeenCalled();
  });
});

// ── updateCartItem ─────────────────────────────────────────────────────────────
describe('updateCartItem', () => {
  beforeEach(() => {
    mockCartItem.findFirst.mockResolvedValue({ id: 'item-id-1', variantId: testVariant.id });
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [] });
  });

  it('updates quantity within bounds', async () => {
    await cartService.updateCartItem(userId, 'item-id-1', 3);
    expect(mockCartItem.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { quantity: 3 } }),
    );
  });

  it('422 CART_ITEM_OUT_OF_STOCK when new qty > stock', async () => {
    mockProductVariant.findUnique.mockResolvedValue({ ...testVariant, stock: 2 });
    const err = await cartService.updateCartItem(userId, 'item-id-1', 4).catch((e) => e);
    expect(err.ruleCode).toBe('CART_ITEM_OUT_OF_STOCK');
  });

  it('422 CART_ITEM_QUANTITY_EXCEEDED when new qty > MAX (5)', async () => {
    const err = await cartService.updateCartItem(userId, 'item-id-1', 6).catch((e) => e);
    expect(err.ruleCode).toBe('CART_ITEM_QUANTITY_EXCEEDED');
  });

  it('404 when item not in user cart', async () => {
    mockCartItem.findFirst.mockResolvedValue(null);
    await expect(cartService.updateCartItem(userId, 'bad-id', 2)).rejects.toThrow(NotFoundError);
  });

  it('404 when user has no cart', async () => {
    mockCart.findUnique.mockResolvedValue(null);
    await expect(cartService.updateCartItem(userId, 'item-id-1', 2)).rejects.toThrow(NotFoundError);
  });
});

// ── removeCartItem ─────────────────────────────────────────────────────────────
describe('removeCartItem', () => {
  beforeEach(() => {
    mockCartItem.findFirst.mockResolvedValue({ id: 'item-id-1' });
    mockCart.findUnique.mockResolvedValue({ ...testCart, items: [] });
  });

  it('deletes item and returns updated cart', async () => {
    await cartService.removeCartItem(userId, 'item-id-1');
    expect(mockCartItem.delete).toHaveBeenCalledWith({ where: { id: 'item-id-1' } });
  });

  it('404 when item not in user cart', async () => {
    mockCartItem.findFirst.mockResolvedValue(null);
    await expect(cartService.removeCartItem(userId, 'bad-id')).rejects.toThrow(NotFoundError);
  });

  it('404 when user has no cart (cross-user isolation)', async () => {
    mockCart.findUnique.mockResolvedValue(null);
    await expect(cartService.removeCartItem('other-user', 'item-id-1')).rejects.toThrow(NotFoundError);
  });
});

// ── clearCart ──────────────────────────────────────────────────────────────────
describe('clearCart', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deletes all items and keeps Cart row', async () => {
    const result = await cartService.clearCart(userId);
    expect(mockCartItem.deleteMany).toHaveBeenCalledWith({ where: { cartId } });
    expect(result.message).toMatch(/clear/i);
  });

  it('returns empty message when user has no cart', async () => {
    mockCart.findUnique.mockResolvedValue(null);
    const result = await cartService.clearCart(userId);
    expect(mockCartItem.deleteMany).not.toHaveBeenCalled();
    expect(result.message).toMatch(/empty/i);
  });
});

// ── mergeGuestCart ─────────────────────────────────────────────────────────────
describe('mergeGuestCart', () => {
  const guestItems = [
    { productId: testProduct.id, variantId: testVariant.id, quantity: 1 },
  ];

  beforeEach(() => {
    mockCartItem.findMany.mockResolvedValue([]);
    mockCart.findUnique
      .mockResolvedValueOnce(testCart)  // getOrCreateCartId
      .mockResolvedValueOnce({ ...testCart, items: [] }); // getUserCart
  });

  it('happy path: valid items are merged, result returned', async () => {
    const result = await cartService.mergeGuestCart(userId, guestItems);
    expect(result.merged).toBe(1);
    expect(result.skipped).toHaveLength(0);
  });

  it('invalid items go to skipped[], valid ones still merged', async () => {
    mockProduct.findUnique
      .mockResolvedValueOnce({ ...testProduct, status: 'ARCHIVED' })
      .mockResolvedValueOnce(testProduct);

    mockCart.findUnique
      .mockResolvedValueOnce(testCart)   // getOrCreateCartId
      .mockResolvedValueOnce({ ...testCart, items: [] }); // getUserCart

    const result = await cartService.mergeGuestCart(userId, [
      { productId: 'bad-product', variantId: testVariant.id, quantity: 1 },
      { productId: testProduct.id, variantId: testVariant.id, quantity: 1 },
    ]);
    expect(result.skipped).toHaveLength(1);
    expect(result.merged).toBe(1);
  });

  it('merge uses $transaction for atomicity', async () => {
    await cartService.mergeGuestCart(userId, guestItems);
    expect(mockTransaction).toHaveBeenCalled();
  });
});

// ── validateCartPayload ────────────────────────────────────────────────────────
describe('validateCartPayload', () => {
  it('allValid: true when all items pass validation', async () => {
    const result = await cartService.validateCartPayload([
      { productId: testProduct.id, variantId: testVariant.id, quantity: 1 },
    ]);
    expect(result.allValid).toBe(true);
    expect(result.items[0].valid).toBe(true);
  });

  it('allValid: false when any item fails', async () => {
    mockProduct.findUnique.mockResolvedValueOnce({ ...testProduct, status: 'ARCHIVED' });
    const result = await cartService.validateCartPayload([
      { productId: testProduct.id, variantId: testVariant.id, quantity: 1 },
    ]);
    expect(result.allValid).toBe(false);
    expect(result.items[0].valid).toBe(false);
    expect(result.items[0].rule).toBe('CART_ITEM_PRODUCT_INACTIVE');
  });
});
