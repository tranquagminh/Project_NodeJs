import { FREE_SHIPPING_THRESHOLD } from '../shipping/shipping.constants';

export const VAT_RATE = 0.10;

export interface OrderItemInput {
  unitPrice: number;
  stringPrice: number;
  quantity: number;
}

export interface OrderTotalsInput {
  items: OrderItemInput[];
  shippingFee: number;
  couponDiscount: number;
  pointsDiscount: number;
}

export interface OrderTotals {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  shippingFee: number;
  couponDiscount: number;
  pointsDiscount: number;
  totalDiscount: number;
  estimatedTax: number;
  total: number;
}

export function calculateOrderTotals(input: OrderTotalsInput): OrderTotals {
  let subtotal = 0;
  for (const item of input.items) {
    subtotal += (item.unitPrice + item.stringPrice) * item.quantity;
  }
  subtotal = Math.floor(subtotal);

  // Cap discounts so total never goes negative
  const couponDiscount = Math.min(input.couponDiscount, subtotal);
  const remaining = subtotal - couponDiscount;
  const pointsDiscount = Math.min(input.pointsDiscount, remaining);
  const totalDiscount = couponDiscount + pointsDiscount;

  // VAT-inclusive tax (informational — VAT already baked into prices)
  const estimatedTax = Math.round((subtotal * VAT_RATE) / (1 + VAT_RATE));

  const total = Math.max(0, subtotal + input.shippingFee - totalDiscount);

  return {
    itemCount: input.items.length,
    totalQuantity: input.items.reduce((s, i) => s + i.quantity, 0),
    subtotal,
    shippingFee: input.shippingFee,
    couponDiscount,
    pointsDiscount,
    totalDiscount,
    estimatedTax,
    total,
  };
}

export function calculateMaxPointsRedeemable(subtotal: number): number {
  // Max 50% of subtotal. 1 point = 1000 VND → max points = subtotal / 2000
  return Math.floor(subtotal / 2000);
}

export function calculatePointsEarned(subtotalAfterDiscount: number): number {
  // 1 point per 10,000 VND, floored
  return Math.floor(subtotalAfterDiscount / 10_000);
}

export function qualifiesForFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}
