export type CartItemKey = {
  variantId: string;
  stringVariantId: string | null;
  tension: number | null;
  gripChoice: string | null;
};

export function getCartItemKey(item: CartItemKey): string {
  return [
    item.variantId,
    item.stringVariantId ?? '__null__',
    item.tension !== null ? item.tension.toString() : '__null__',
    item.gripChoice ?? '__null__',
  ].join('|');
}

export function findMatchingItem<T extends CartItemKey>(items: T[], input: CartItemKey): T | null {
  const key = getCartItemKey(input);
  return items.find((i) => getCartItemKey(i) === key) ?? null;
}

export type MergeItemEntry = CartItemKey & { quantity: number };

export interface MergeConstraints {
  maxQty: number;
  getStock: (variantId: string) => number;
}

export interface MergeItemsResult {
  result: Array<MergeItemEntry & { wasMerged: boolean; wasCreated: boolean }>;
  capped: Array<{ key: CartItemKey; requestedQty: number; appliedQty: number; reason: string }>;
}

export function mergeItemsList(
  existing: MergeItemEntry[],
  incoming: MergeItemEntry[],
  constraints: MergeConstraints,
): MergeItemsResult {
  const result = existing.map((e) => ({ ...e, wasMerged: false, wasCreated: false }));
  const capped: MergeItemsResult['capped'] = [];

  for (const item of incoming) {
    const match = findMatchingItem(result, item);
    const stock = constraints.getStock(item.variantId);

    if (match) {
      const wantedTotal = match.quantity + item.quantity;
      let appliedQty = item.quantity;
      let cappedReason: string | null = null;

      if (wantedTotal > constraints.maxQty) {
        appliedQty = Math.max(0, constraints.maxQty - match.quantity);
        cappedReason = 'MAX_QTY_EXCEEDED';
      }
      // Stock check after maxQty cap
      if (match.quantity + appliedQty > stock) {
        appliedQty = Math.max(0, stock - match.quantity);
        cappedReason = 'OUT_OF_STOCK';
      }

      if (cappedReason !== null && appliedQty < item.quantity) {
        capped.push({ key: item, requestedQty: item.quantity, appliedQty, reason: cappedReason });
      }

      match.quantity += appliedQty;
      match.wasMerged = true;
    } else {
      let qty = item.quantity;
      let cappedReason: string | null = null;

      if (qty > constraints.maxQty) {
        cappedReason = 'MAX_QTY_EXCEEDED';
        qty = constraints.maxQty;
      }
      if (qty > stock) {
        cappedReason = 'OUT_OF_STOCK';
        qty = stock;
      }

      if (cappedReason !== null && qty < item.quantity) {
        capped.push({ key: item, requestedQty: item.quantity, appliedQty: qty, reason: cappedReason });
      }

      result.push({ ...item, quantity: qty, wasMerged: false, wasCreated: true });
    }
  }

  return { result, capped };
}
