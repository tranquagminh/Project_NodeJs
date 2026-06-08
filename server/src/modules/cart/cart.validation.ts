import { z } from 'zod';
import { StringingConfigSchema } from '../stringing/stringing.validation';
import { MAX_QTY_PER_ITEM } from './cart.constants';

// Stringing input for cart — same as Module 2 but racketVariantId comes from the item's variantId
const CartStringingInput = StringingConfigSchema.omit({ racketVariantId: true });

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid(),
    quantity: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
    stringing: CartStringingInput.optional(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({ itemId: z.string().uuid() }),
  body: z.object({
    quantity: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
  }),
});

export const cartItemIdSchema = z.object({
  params: z.object({ itemId: z.string().uuid() }),
});

const cartItemPayload = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
  stringing: CartStringingInput.optional(),
});

export const mergeGuestCartSchema = z.object({
  body: z.object({
    items: z.array(cartItemPayload).max(50),
  }),
});

export const cartPayloadSchema = z.object({
  body: z.object({
    items: z.array(cartItemPayload).max(50),
  }),
});

export type CartItemPayload = z.infer<typeof cartItemPayload>;
