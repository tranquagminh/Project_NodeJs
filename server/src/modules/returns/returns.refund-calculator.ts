import { ReturnReason } from '@prisma/client';

export interface ReturnableItem {
  lineSubtotal: number;
  stringPrice: number;
  hasStringing: boolean;
}

export interface RefundCalculatorInput {
  items: ReturnableItem[];
  reason: ReturnReason;
  originalShippingFee: number;
  originalPointsDiscount: number;
}

export interface RefundCalculationResult {
  itemRefund: number;
  shippingRefund: number;
  pointsToReturn: number;
  total: number;
  userPaysReturnShipping: boolean;
}

export function calculateRefundAmount(input: RefundCalculatorInput): RefundCalculationResult {
  let itemRefund = 0;

  for (const item of input.items) {
    if (
      item.hasStringing &&
      input.reason !== 'DEFECTIVE'
    ) {
      // Strung racket non-defective return: exclude string price
      itemRefund += item.lineSubtotal - item.stringPrice;
    } else {
      itemRefund += item.lineSubtotal;
    }
  }

  itemRefund = Math.floor(itemRefund);

  const refundsShipping = (
    input.reason === 'WRONG_ITEM' ||
    input.reason === 'DEFECTIVE' ||
    input.reason === 'DAMAGED_SHIPPING'
  );
  const shippingRefund = refundsShipping ? Math.floor(input.originalShippingFee) : 0;

  const userPaysReturnShipping = input.reason === 'CHANGED_MIND';

  // Points are returned at 1 VND per point discount unit (we return the same VND value)
  // The caller must convert to integer points: pointsToReturn / 1000
  const pointsToReturn = Math.floor(input.originalPointsDiscount);

  const total = itemRefund + shippingRefund;

  return {
    itemRefund,
    shippingRefund,
    pointsToReturn,
    total,
    userPaysReturnShipping,
  };
}

export function pointsDiscountToPoints(pointsDiscount: number): number {
  // 1 point = 1000 VND → points = discount / 1000
  return Math.floor(pointsDiscount / 1000);
}
