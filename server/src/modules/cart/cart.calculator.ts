import { FREE_SHIPPING_THRESHOLD, VAT_RATE } from './cart.constants';

export function calculateItemSubtotal(input: {
  variantEffectivePrice: number;
  stringEffectivePrice?: number;
  quantity: number;
}): number {
  const unitPrice = input.variantEffectivePrice + (input.stringEffectivePrice ?? 0);
  return unitPrice * input.quantity;
}

export function calculateCartTotals(items: Array<{ lineSubtotal: number; unavailable: boolean; quantity: number }>) {
  const available = items.filter((i) => !i.unavailable);
  const itemCount = available.length;
  const totalQuantity = available.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = available.reduce((sum, i) => sum + i.lineSubtotal, 0);

  // VAT is inclusive — extract: tax = subtotal × rate / (1 + rate)
  const estimatedTax = Math.round((subtotal * VAT_RATE) / (1 + VAT_RATE));

  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  return {
    itemCount,
    totalQuantity,
    subtotal,
    estimatedTax,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    qualifiesForFreeShipping,
    amountToFreeShipping,
  };
}
