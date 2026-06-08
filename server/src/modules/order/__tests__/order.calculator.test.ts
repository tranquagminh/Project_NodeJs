import { describe, it, expect } from 'vitest';
import {
  calculateOrderTotals,
  calculateMaxPointsRedeemable,
  calculatePointsEarned,
  qualifiesForFreeShipping,
} from '../order.calculator';
import { FREE_SHIPPING_THRESHOLD } from '../../shipping/shipping.constants';

describe('calculateOrderTotals', () => {
  const item = (unitPrice: number, qty: number, stringPrice = 0) => ({
    unitPrice,
    stringPrice,
    quantity: qty,
  });

  it('sums item subtotal correctly with no discounts or shipping', () => {
    const result = calculateOrderTotals({
      items: [item(1_000_000, 1), item(200_000, 2)],
      shippingFee: 0,
      couponDiscount: 0,
      pointsDiscount: 0,
    });
    expect(result.subtotal).toBe(1_400_000);
    expect(result.total).toBe(1_400_000);
  });

  it('includes string price in item subtotal', () => {
    const result = calculateOrderTotals({
      items: [item(1_000_000, 1, 100_000)],
      shippingFee: 0,
      couponDiscount: 0,
      pointsDiscount: 0,
    });
    expect(result.subtotal).toBe(1_100_000);
    expect(result.total).toBe(1_100_000);
  });

  it('adds shipping fee to total', () => {
    const result = calculateOrderTotals({
      items: [item(1_000_000, 1)],
      shippingFee: 25_000,
      couponDiscount: 0,
      pointsDiscount: 0,
    });
    expect(result.total).toBe(1_025_000);
  });

  it('subtracts coupon discount from total', () => {
    const result = calculateOrderTotals({
      items: [item(1_000_000, 1)],
      shippingFee: 0,
      couponDiscount: 100_000,
      pointsDiscount: 0,
    });
    expect(result.total).toBe(900_000);
    expect(result.couponDiscount).toBe(100_000);
  });

  it('subtracts points discount from total', () => {
    const result = calculateOrderTotals({
      items: [item(1_000_000, 1)],
      shippingFee: 0,
      couponDiscount: 0,
      pointsDiscount: 50_000,
    });
    expect(result.total).toBe(950_000);
    expect(result.pointsDiscount).toBe(50_000);
  });

  it('caps coupon discount at subtotal — total never negative', () => {
    const result = calculateOrderTotals({
      items: [item(100_000, 1)],
      shippingFee: 0,
      couponDiscount: 200_000,
      pointsDiscount: 0,
    });
    expect(result.couponDiscount).toBe(100_000);
    expect(result.total).toBe(0);
  });

  it('caps combined discounts to not exceed subtotal', () => {
    const result = calculateOrderTotals({
      items: [item(100_000, 1)],
      shippingFee: 0,
      couponDiscount: 60_000,
      pointsDiscount: 80_000,
    });
    expect(result.couponDiscount).toBe(60_000);
    expect(result.pointsDiscount).toBe(40_000); // capped at remaining 40k
    expect(result.total).toBe(0);
  });

  it('calculates VAT-inclusive estimatedTax at 10%', () => {
    // subtotal = 1_100_000; VAT = 1_100_000 × 0.10 / 1.10 = 100_000
    const result = calculateOrderTotals({
      items: [item(1_100_000, 1)],
      shippingFee: 0,
      couponDiscount: 0,
      pointsDiscount: 0,
    });
    expect(result.estimatedTax).toBe(100_000);
  });

  it('returns correct itemCount and totalQuantity', () => {
    const result = calculateOrderTotals({
      items: [item(1_000_000, 2), item(500_000, 3)],
      shippingFee: 0,
      couponDiscount: 0,
      pointsDiscount: 0,
    });
    expect(result.itemCount).toBe(2);
    expect(result.totalQuantity).toBe(5);
  });
});

describe('calculateMaxPointsRedeemable', () => {
  it('returns floor(subtotal / 2000)', () => {
    expect(calculateMaxPointsRedeemable(1_000_000)).toBe(500);
  });

  it('floors fractional result', () => {
    expect(calculateMaxPointsRedeemable(1_001_000)).toBe(500);
  });

  it('returns 0 for zero subtotal', () => {
    expect(calculateMaxPointsRedeemable(0)).toBe(0);
  });
});

describe('calculatePointsEarned', () => {
  it('returns 1 point per 10,000 VND, floored', () => {
    expect(calculatePointsEarned(1_000_000)).toBe(100);
  });

  it('floors fractional result', () => {
    expect(calculatePointsEarned(1_009_999)).toBe(100);
  });

  it('returns 0 for subtotal below 10,000', () => {
    expect(calculatePointsEarned(9_999)).toBe(0);
  });
});

describe('qualifiesForFreeShipping', () => {
  it('returns true when subtotal >= threshold', () => {
    expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD)).toBe(true);
    expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD + 1)).toBe(true);
  });

  it('returns false when subtotal < threshold', () => {
    expect(qualifiesForFreeShipping(FREE_SHIPPING_THRESHOLD - 1)).toBe(false);
  });
});
