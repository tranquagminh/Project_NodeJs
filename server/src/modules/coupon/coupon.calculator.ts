import { CouponType } from '@prisma/client';

export interface CouponForCalc {
  type: CouponType;
  value: number | string | { toString(): string };
  maxDiscount: number | string | { toString(): string } | null;
}

export function calculateCouponDiscount(
  coupon: CouponForCalc,
  eligibleSubtotal: number,
): number {
  if (eligibleSubtotal <= 0) return 0;

  const val = Number(coupon.value.toString());

  let discount: number;
  if (coupon.type === 'PERCENTAGE') {
    discount = Math.floor((eligibleSubtotal * val) / 100);
    if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
      const cap = Number(coupon.maxDiscount.toString());
      if (discount > cap) discount = cap;
    }
  } else {
    // FIXED_AMOUNT — cannot exceed subtotal
    discount = Math.min(Math.floor(val), eligibleSubtotal);
  }

  return discount;
}
