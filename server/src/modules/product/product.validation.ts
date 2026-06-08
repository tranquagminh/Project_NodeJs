import { z } from 'zod';

// ==================== Public Query ====================

export const productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(12).optional(),
    sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating', 'popular']).default('newest').optional(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().optional(),
    skillLevel: z.enum(['PROFESSIONAL', 'INTERMEDIATE', 'BEGINNER']).optional(),
    playStyle: z.enum(['POWER_HEAD_HEAVY', 'SPEED_HEAD_LIGHT', 'CONTROL_EVEN_BALANCE']).optional(),
    series: z.string().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    isFeatured: z.coerce.boolean().optional(),
    isNewArrival: z.coerce.boolean().optional(),
  }),
});

export const productSlugSchema = z.object({
  params: z.object({ slug: z.string().min(1) }),
});

export const searchQuerySchema = z.object({
  query: z.object({
    q: z.string().min(1, 'Search query is required'),
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(12).optional(),
  }),
});

// ==================== Admin CRUD ====================

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    description: z.string().optional(),
    shortDescription: z.string().optional(),
    categoryId: z.string().uuid(),
    brandId: z.string().uuid(),
    basePrice: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0).optional().nullable(),
    sku: z.string().min(1),
    status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED', 'ARCHIVED']).default('DRAFT'),
    isFeatured: z.boolean().default(false),
    isNewArrival: z.boolean().default(false),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    shortDescription: z.string().optional().nullable(),
    categoryId: z.string().uuid().optional(),
    brandId: z.string().uuid().optional(),
    basePrice: z.coerce.number().min(0).optional(),
    salePrice: z.coerce.number().min(0).optional().nullable(),
    sku: z.string().min(1).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED', 'ARCHIVED']).optional(),
    isFeatured: z.boolean().optional(),
    isNewArrival: z.boolean().optional(),
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
  }),
});

export const productIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

// ==================== Spec ====================

export const upsertSpecSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    flex: z.enum(['STIFF', 'MEDIUM', 'FLEXIBLE']).optional().nullable(),
    frameMaterial: z.string().optional().nullable(),
    shaftMaterial: z.string().optional().nullable(),
    jointType: z.string().optional().nullable(),
    weightGripDesc: z.string().optional().nullable(),
    recommendedTension: z.string().optional().nullable(),
    maxTensionByWeight: z.record(z.string(), z.number()).optional().nullable(),
    skillLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']).optional().nullable(),
    playStyle: z.enum(['POWER_HEAD_HEAVY', 'SPEED_HEAD_LIGHT', 'CONTROL_EVEN_BALANCE']).optional().nullable(),
    series: z.string().optional().nullable(),
    technologyIds: z.array(z.string().uuid()).optional(),
    recommendedStringIds: z.array(z.string().uuid()).optional(),
  }),
});

// ==================== Variant ====================

export const createVariantSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1),
    sku: z.string().min(1),
    price: z.coerce.number().min(0),
    salePrice: z.coerce.number().min(0).optional().nullable(),
    stock: z.number().int().min(0).default(0),
    attributes: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const updateVariantSchema = z.object({
  params: z.object({ id: z.string().uuid(), variantId: z.string().uuid() }),
  body: z.object({
    name: z.string().min(1).optional(),
    sku: z.string().min(1).optional(),
    price: z.coerce.number().min(0).optional(),
    salePrice: z.coerce.number().min(0).optional().nullable(),
    stock: z.number().int().min(0).optional(),
    attributes: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const variantIdSchema = z.object({
  params: z.object({ id: z.string().uuid(), variantId: z.string().uuid() }),
});

// ==================== Image ====================

export const createImageSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    url: z.string().url(),
    alt: z.string().optional(),
    sortOrder: z.number().int().default(0),
    isMain: z.boolean().default(false),
  }),
});

export const imageIdSchema = z.object({
  params: z.object({ id: z.string().uuid(), imageId: z.string().uuid() }),
});
