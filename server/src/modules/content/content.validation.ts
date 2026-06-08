import { z } from 'zod';

export const createBannerSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    image: z.string().min(1),
    link: z.string().optional(),
    ctaPrimary: z.string().optional(),
    ctaSecondary: z.string().optional(),
    position: z.enum(['HOME_HERO', 'HOME_BANNER', 'CATEGORY_HERO']),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
  }),
});

export const updateBannerSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createBannerSchema.shape.body.partial(),
});

export const bannerIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const createAthleteSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    title: z.string().optional(),
    image: z.string().min(1),
    profileLink: z.string().optional(),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateAthleteSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createAthleteSchema.shape.body.partial(),
});

export const athleteIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const createTechnologySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    shortDescription: z.string().optional(),
    fullDescription: z.string().optional(),
    image: z.string().optional(),
    icon: z.string().optional(),
    statLabel: z.string().optional(),
    statValue: z.string().optional(),
    sortOrder: z.number().int().default(0),
    isActive: z.boolean().default(true),
  }),
});

export const updateTechnologySchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: createTechnologySchema.shape.body.partial(),
});

export const technologyIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
