import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    logo: z.string().optional(),
    description: z.string().optional(),
    isActive: z.boolean().default(true),
  }),
});

export const updateBrandSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    logo: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const brandIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
