import { z } from 'zod';

export const addWishlistSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
  }),
});

export const removeWishlistSchema = z.object({
  params: z.object({ productId: z.string().uuid() }),
});
