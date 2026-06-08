import { describe, it, expect } from 'vitest';
import { getCartItemKey, findMatchingItem, mergeItemsList } from '../cart.dedup';
import type { CartItemKey } from '../cart.dedup';

// ── Fixtures ──────────────────────────────────────────────────────────────────
const naked: CartItemKey = { variantId: 'v1', stringVariantId: null, tension: null, gripChoice: null };
const stringed: CartItemKey = { variantId: 'v1', stringVariantId: 'sv1', tension: 26, gripChoice: 'ORIGINAL' };
const stringedHighTension: CartItemKey = { variantId: 'v1', stringVariantId: 'sv1', tension: 28, gripChoice: 'ORIGINAL' };
const stringedDiffGrip: CartItemKey = { variantId: 'v1', stringVariantId: 'sv1', tension: 26, gripChoice: 'BLACK_OVERGRIP' };

describe('getCartItemKey', () => {
  it('produces the same key for identical inputs', () => {
    expect(getCartItemKey(naked)).toBe(getCartItemKey({ ...naked }));
  });

  it('produces different keys for naked vs stringed (same racket variant)', () => {
    expect(getCartItemKey(naked)).not.toBe(getCartItemKey(stringed));
  });

  it('produces different keys for different tensions', () => {
    expect(getCartItemKey(stringed)).not.toBe(getCartItemKey(stringedHighTension));
  });

  it('produces different keys for different grip choices', () => {
    expect(getCartItemKey(stringed)).not.toBe(getCartItemKey(stringedDiffGrip));
  });

  it('produces different keys for different variantIds', () => {
    const v2 = { ...naked, variantId: 'v2' };
    expect(getCartItemKey(naked)).not.toBe(getCartItemKey(v2));
  });
});

describe('findMatchingItem', () => {
  const items = [
    { ...naked, quantity: 2 },
    { ...stringed, quantity: 1 },
  ];

  it('returns null when no match in empty list', () => {
    expect(findMatchingItem([], naked)).toBeNull();
  });

  it('returns null when input key not present', () => {
    expect(findMatchingItem(items, stringedHighTension)).toBeNull();
  });

  it('returns the existing item when key matches naked', () => {
    const found = findMatchingItem(items, naked);
    expect(found?.quantity).toBe(2);
  });

  it('returns the existing item when key matches stringed', () => {
    const found = findMatchingItem(items, stringed);
    expect(found?.quantity).toBe(1);
  });
});

describe('mergeItemsList', () => {
  const constraints = {
    maxQty: 5,
    getStock: (_variantId: string) => 10,
  };

  it('incoming matches existing → quantity summed, wasMerged = true', () => {
    const { result } = mergeItemsList(
      [{ ...naked, quantity: 2 }],
      [{ ...naked, quantity: 1 }],
      constraints,
    );
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(3);
    expect(result[0].wasMerged).toBe(true);
  });

  it('incoming does not match → new entry with wasCreated = true', () => {
    const { result } = mergeItemsList(
      [{ ...naked, quantity: 1 }],
      [{ ...stringed, quantity: 2 }],
      constraints,
    );
    expect(result).toHaveLength(2);
    expect(result[1].wasCreated).toBe(true);
    expect(result[1].quantity).toBe(2);
  });

  it('incoming + existing exceeds maxQty → capped to maxQty, in capped[]', () => {
    const { result, capped } = mergeItemsList(
      [{ ...naked, quantity: 4 }],
      [{ ...naked, quantity: 3 }], // 4+3=7 > 5
      constraints,
    );
    expect(result[0].quantity).toBe(5); // capped at maxQty
    expect(capped).toHaveLength(1);
    expect(capped[0].reason).toBe('MAX_QTY_EXCEEDED');
    expect(capped[0].requestedQty).toBe(3);
    expect(capped[0].appliedQty).toBe(1); // could only add 1 more
  });

  it('incoming + existing exceeds stock → capped to stock, in capped[]', () => {
    const lowStockConstraints = { maxQty: 5, getStock: () => 3 };
    const { result, capped } = mergeItemsList(
      [{ ...naked, quantity: 2 }],
      [{ ...naked, quantity: 2 }], // 2+2=4 > stock(3)
      lowStockConstraints,
    );
    expect(result[0].quantity).toBe(3); // capped at stock
    expect(capped[0].reason).toBe('OUT_OF_STOCK');
  });

  it('0 stock available → quantity stays at existing, appliedQty=0', () => {
    const zeroStock = { maxQty: 5, getStock: () => 0 };
    const { result, capped } = mergeItemsList(
      [{ ...naked, quantity: 1 }],
      [{ ...naked, quantity: 1 }],
      zeroStock,
    );
    expect(result[0].quantity).toBe(1); // unchanged
    expect(capped[0].appliedQty).toBe(0);
    expect(capped[0].reason).toBe('OUT_OF_STOCK');
  });

  it('new item with qty > maxQty → capped to maxQty', () => {
    const { result, capped } = mergeItemsList(
      [],
      [{ ...naked, quantity: 8 }],
      constraints, // maxQty=5
    );
    expect(result[0].quantity).toBe(5);
    expect(capped[0].reason).toBe('MAX_QTY_EXCEEDED');
  });

  it('multiple incoming items: one match + one new', () => {
    const { result } = mergeItemsList(
      [{ ...naked, quantity: 1 }],
      [{ ...naked, quantity: 1 }, { ...stringed, quantity: 2 }],
      constraints,
    );
    expect(result).toHaveLength(2);
    expect(result[0].quantity).toBe(2); // merged
    expect(result[1].quantity).toBe(2); // created
  });

  it('same racket variant with different tension = different lines (not merged)', () => {
    const { result } = mergeItemsList(
      [{ ...stringed, quantity: 1 }],
      [{ ...stringedHighTension, quantity: 1 }],
      constraints,
    );
    expect(result).toHaveLength(2);
  });
});
