export interface CartItemFlags {
  priceChanged: boolean;
  stringPriceChanged: boolean;
  stockChanged: boolean;
  unavailable: boolean;
}

export interface HydratedStringing {
  stringVariantId: string;
  stringProduct: { name: string; mainImageUrl: string | null };
  tension: number | null;
  gripChoice: string | null;
  stringPriceAtAdd: number;
  currentStringPrice: number;
}

export interface HydratedCartItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  displayQuantity: number;
  product: {
    name: string;
    slug: string;
    mainImageUrl: string | null;
    categorySlug: string;
  };
  variant: {
    name: string;
    attributes: unknown;
  };
  priceAtAdd: number;
  currentPrice: number;
  stringing: HydratedStringing | null;
  lineSubtotal: number;
  flags: CartItemFlags;
}

export interface CartTotals {
  itemCount: number;
  totalQuantity: number;
  subtotal: number;
  estimatedTax: number;
  freeShippingThreshold: number;
  qualifiesForFreeShipping: boolean;
  amountToFreeShipping: number;
}

export interface HydratedCart {
  items: HydratedCartItem[];
  totals: CartTotals;
}

export interface AddCartItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  stringing?: {
    stringVariantId: string;
    tension: number;
    gripChoice: string;
  };
}

export interface MergeResult {
  cart: HydratedCart;
  merged: number;
  skipped: Array<{ input: AddCartItemInput; reason: string; message: string }>;
  cappedItems: Array<{ variantId: string; requestedQty: number; appliedQty: number; reason: string }>;
}
