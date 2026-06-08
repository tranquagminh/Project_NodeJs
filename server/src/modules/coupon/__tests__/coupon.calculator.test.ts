import { describe, it, expect } from 'vitest';
import { calculateCouponDiscount } from '../coupon.calculator';

describe('calculateCouponDiscount', () => {
  describe('PERCENTAGE type', () => {
    it('applies percentage to subtotal with no cap', () => {
      const discount = calculateCouponDiscount(
        { type: 'PERCENTAGE', value: 10, maxDiscount: null },
        1_000_000,
      );
      expect(discount).toBe(100_000);
    });

    it('applies cap when percentage would exceed maxDiscount', () => {
      const discount = calculateCouponDiscount(
        { type: 'PERCENTAGE', value: 10, maxDiscount: 50_000 },
        1_000_000,
      );
      expect(discount).toBe(50_000);
    });

    it('does NOT apply cap when percentage is under maxDiscount', () => {
      const discount = calculateCouponDiscount(
        { type: 'PERCENTAGE', value: 10, maxDiscount: 200_000 },
        1_000_000,
      );
      expect(discount).toBe(100_000);
    });

    it('exactly hits the cap when percentage equals maxDiscount', () => {
      const discount = calculateCouponDiscount(
        { type: 'PERCENTAGE', value: 10, maxDiscount: 100_000 },
        1_000_000,
      );
      expect(discount).toBe(100_000);
    });

    it('returns 0 for empty subtotal', () => {
      expect(calculateCouponDiscount({ type: 'PERCENTAGE', value: 20, maxDiscount: null }, 0)).toBe(0);
    });
  });

  describe('FIXED_AMOUNT type', () => {
    it('deducts the fixed value when smaller than subtotal', () => {
      const discount = calculateCouponDiscount(
        { type: 'FIXED_AMOUNT', value: 50_000, maxDiscount: null },
        500_000,
      );
      expect(discount).toBe(50_000);
    });

    it('caps at subtotal when fixed value is larger than subtotal', () => {
      const discount = calculateCouponDiscount(
        { type: 'FIXED_AMOUNT', value: 100_000, maxDiscount: null },
        80_000,
      );
      expect(discount).toBe(80_000);
    });

    it('returns full subtotal when fixed value exactly equals subtotal', () => {
      const discount = calculateCouponDiscount(
        { type: 'FIXED_AMOUNT', value: 200_000, maxDiscount: null },
        200_000,
      );
      expect(discount).toBe(200_000);
    });

    it('returns 0 for empty subtotal', () => {
      expect(calculateCouponDiscount({ type: 'FIXED_AMOUNT', value: 50_000, maxDiscount: null }, 0)).toBe(0);
    });
  });

  describe('Decimal / Prisma Decimal input', () => {
    it('accepts Prisma Decimal-like objects (toString)', () => {
      const discount = calculateCouponDiscount(
        { type: 'PERCENTAGE', value: { toString: () => '10' }, maxDiscount: { toString: () => '200000' } },
        1_000_000,
      );
      expect(discount).toBe(100_000);
    });
  });
});
