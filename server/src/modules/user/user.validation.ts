import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

const addressBodyBase = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone is required'),
  addressLine: z.string().min(1, 'Address is required'),
  wardCode: z.string().optional(),
  wardName: z.string().optional(),
  districtCode: z.string().optional(),
  districtName: z.string().optional(),
  provinceCode: z.string().optional(),
  provinceName: z.string().min(1, 'Province is required'),
  country: z.string().default('VN'),
  isDefault: z.boolean().default(false),
});

export const createAddressSchema = z.object({
  body: addressBodyBase,
});

export const updateAddressSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: addressBodyBase.partial(),
});

export const addressIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

// Admin
export const adminChangeRoleSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({ role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']) }),
});

export const adminUserIdSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});
