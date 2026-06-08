import { describe, it, expect } from 'vitest';
import { calculateItemSubtotal, calculateCartTotals } from '../cart.calculator';
import { FREE_SHIPPING_THRESHOLD, VAT_RATE } from '../cart.constants';

describe('calculateItemSubtotal', () => {
  it('returns variantPrice × qty when no stringing', () => {
    expect(calculateItemSubtotal({ variantEffectivePrice: 2_350_000, quantity: 2 }))
      .toBe(4_700_000);
  });

  it('includes string price when stringing is provided', () => {
    expect(calculateItemSubtotal({ variantEffectivePrice: 2_350_000, stringEffectivePrice: 180_000, quantity: 1 }))
      .toBe(2_530_000);
  });

  it('sums racket + string then multiplies by quantity', () => {
    expect(calculateItemSubtotal({ variantEffectivePrice: 2_000_000, stringEffectivePrice: 150_000, quantity: 2 }))
      .toBe(4_300_000);
  });

  it('returns 0 for quantity 0', () => {
    expect(calculateItemSubtotal({ variantEffectivePrice: 2_000_000, quantity: 0 })).toBe(0);
  });
});

describe('calculateCartTotals', () => {
  it('returns all zeros for empty items list', () => {
    const t = calculateCartTotals([]);
    expect(t.itemCount).toBe(0);
    expect(t.totalQuantity).toBe(0);
    expect(t.subtotal).toBe(0);
    expect(t.qualifiesForFreeShipping).toBe(false);
  });

  it('amountToFreeShipping > 0 when subtotal < threshold', () => {
    const t = calculateCartTotals([{ lineSubtotal: 1_000_000, unavailable: false, quantity: 1 }]);
    expect(t.subtotal).toBe(1_000_000);
    expect(t.qualifiesForFreeShipping).toBe(false);
    expect(t.amountToFreeShipping).toBe(FREE_SHIPPING_THRESHOLD - 1_000_000);
  });

  it('qualifies for free shipping when subtotal exactly equals threshold', () => {
    const t = calculateCartTotals([{ lineSubtotal: FREE_SHIPPING_THRESHOLD, unavailable: false, quantity: 1 }]);
    expect(t.qualifiesForFreeShipping).toBe(true);
    expect(t.amountToFreeShipping).toBe(0);
  });

  it('qualifies for free shipping when subtotal exceeds threshold', () => {
    const t = calculateCartTotals([{ lineSubtotal: 2_000_000, unavailable: false, quantity: 3 }]);
    expect(t.qualifiesForFreeShipping).toBe(true);
    expect(t.amountToFreeShipping).toBe(0);
    expect(t.totalQuantity).toBe(3);
  });

  it('excludes unavailable items from all totals', () => {
    const t = calculateCartTotals([
      { lineSubtotal: 2_000_000, unavailable: false, quantity: 1 },
      { lineSubtotal: 500_000, unavailable: true, quantity: 2 },
    ]);
    expect(t.itemCount).toBe(1);
    expect(t.totalQuantity).toBe(1);
    expect(t.subtotal).toBe(2_000_000);
  });

  it('estimatedTax: subtotal 1_100_000 with 10% VAT-inclusive → tax = 100_000', () => {
    // subtotal = 1_100_000 (10% VAT inclusive → tax = 1_100_000 × 0.1/1.1 ≈ 100_000)
    const t = calculateCartTotals([{ lineSubtotal: 1_100_000, unavailable: false, quantity: 1 }]);
    expect(t.estimatedTax).toBe(Math.round((1_100_000 * VAT_RATE) / (1 + VAT_RATE)));
    expect(t.estimatedTax).toBe(100_000);
  });

  it('sums multiple available items for subtotal', () => {
    const t = calculateCartTotals([
      { lineSubtotal: 800_000, unavailable: false, quantity: 2 },
      { lineSubtotal: 400_000, unavailable: false, quantity: 1 },
    ]);
    expect(t.subtotal).toBe(1_200_000);
    expect(t.totalQuantity).toBe(3);
    expect(t.itemCount).toBe(2);
  });
});
