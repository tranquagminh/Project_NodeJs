import { z } from 'zod';

/**
 * Shape of a stringing configuration attached to a racket in cart/order.
 * Cart module will import this schema to validate incoming cart items.
 */
export const StringingConfigSchema = z.object({
  racketVariantId: z.string().uuid(),
  stringVariantId: z.string().uuid(),
  // Implements §2.2 — 0.5-step tension stepper
  tension: z.number().min(18).max(35).multipleOf(0.5),
  gripChoice: z.enum([
    'ORIGINAL', 'BLACK_OVERGRIP', 'WHITE_OVERGRIP', 'YELLOW_OVERGRIP', 'RED_OVERGRIP',
  ]).default('ORIGINAL'),
});

export type StringingConfig = z.infer<typeof StringingConfigSchema>;

export const getOptionsParamSchema = z.object({
  params: z.object({ racketProductId: z.string().uuid() }),
});

export const validateBodySchema = z.object({
  body: StringingConfigSchema,
});
