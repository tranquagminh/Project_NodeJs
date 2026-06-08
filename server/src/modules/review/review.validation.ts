import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().uuid(),
    orderId: z.string().uuid().optional(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
    images: z.array(z.string().url()).optional(),
  }),
});

export const productReviewsSchema = z.object({
  params: z.object({ productId: z.string().uuid() }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
  }),
});

export const reviewIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
