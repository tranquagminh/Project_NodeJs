import { z } from 'zod';

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50),
    subtotal: z.number().int().min(0),
  }),
});

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1).max(50),
    description: z.string().max(500).optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    value: z.number().positive(),
    minOrderAmount: z.number().int().min(0).default(0),
    maxDiscount: z.number().int().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    usagePerUser: z.number().int().min(1).default(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    isActive: z.boolean().default(true),
    applicableCategoryIds: z.array(z.string().uuid()).default([]),
    applicableProductIds: z.array(z.string().uuid()).default([]),
    excludeSaleItems: z.boolean().default(false),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    description: z.string().max(500).optional(),
    minOrderAmount: z.number().int().min(0).optional(),
    maxDiscount: z.number().int().positive().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    usagePerUser: z.number().int().min(1).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    isActive: z.boolean().optional(),
    applicableCategoryIds: z.array(z.string().uuid()).optional(),
    applicableProductIds: z.array(z.string().uuid()).optional(),
    excludeSaleItems: z.boolean().optional(),
  }),
});

export const couponIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
