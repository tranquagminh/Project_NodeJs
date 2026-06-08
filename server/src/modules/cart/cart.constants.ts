export const MIN_QTY_PER_ITEM = 1;
export const MAX_QTY_PER_ITEM = 5;

/** Free standard shipping if subtotal >= this (§4.3). VND, integer arithmetic. */
export const FREE_SHIPPING_THRESHOLD = 1_500_000;

/** VAT rate — price already includes VAT; this extracts the tax component for display. */
export const VAT_RATE = 0.10;
