import { Coupon } from '@prisma/client';
import prisma from '../../config/database';
import { NotFoundError, BadRequestError, ConflictError, BusinessRuleError } from '../../utils/errors';
import { calculateCouponDiscount } from './coupon.calculator';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  type: string;
  discount: number;
}

export async function validateCoupon(
  code: string,
  subtotal: number,
  userId?: string,
): Promise<CouponValidationResult> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) throw new NotFoundError('Coupon not found');
  if (!coupon.isActive) throw new BusinessRuleError('Coupon is inactive', 'COUPON_INACTIVE');

  const now = new Date();
  if (now < coupon.startDate || now > coupon.endDate) {
    throw new BusinessRuleError('Coupon has expired', 'COUPON_EXPIRED');
  }
  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new BusinessRuleError('Coupon usage limit reached', 'COUPON_EXHAUSTED');
  }
  if (subtotal < Number(coupon.minOrderAmount)) {
    throw new BusinessRuleError(
      `Minimum order amount is ${Number(coupon.minOrderAmount).toLocaleString()}₫ to use this coupon`,
      'COUPON_MIN_ORDER',
      { minOrderAmount: Number(coupon.minOrderAmount) },
    );
  }

  // Per-user usage check (authenticated only)
  if (userId) {
    const used = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId },
    });
    if (used >= coupon.usagePerUser) {
      throw new BusinessRuleError(
        `You have already used this coupon ${coupon.usagePerUser} time(s)`,
        'COUPON_USER_LIMIT',
        { usagePerUser: coupon.usagePerUser },
      );
    }
  }

  const discount = calculateCouponDiscount(coupon, subtotal);
  return { valid: true, code: coupon.code, type: coupon.type, discount };
}

export async function getCouponByCode(code: string): Promise<Coupon> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) throw new NotFoundError('Coupon not found');
  return coupon;
}

export async function listCoupons(params: {
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const skip = (page - 1) * pageSize;
  const where = params.isActive !== undefined ? { isActive: params.isActive } : {};
  const [data, total] = await Promise.all([
    prisma.coupon.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.coupon.count({ where }),
  ]);
  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function createCoupon(data: {
  code: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usagePerUser?: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
  applicableCategoryIds?: string[];
  applicableProductIds?: string[];
  excludeSaleItems?: boolean;
}) {
  const code = data.code.toUpperCase();
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) throw new ConflictError('Coupon code already exists');
  return prisma.coupon.create({
    data: { ...data, code, minOrderAmount: data.minOrderAmount ?? 0, usagePerUser: data.usagePerUser ?? 1 },
  });
}

export async function updateCoupon(
  id: string,
  data: Partial<{
    description: string;
    minOrderAmount: number;
    maxDiscount: number | null;
    usageLimit: number | null;
    usagePerUser: number;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    applicableCategoryIds: string[];
    applicableProductIds: string[];
    excludeSaleItems: boolean;
  }>,
) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new NotFoundError('Coupon not found');
  return prisma.coupon.update({ where: { id }, data });
}

export async function deactivateCoupon(id: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) throw new NotFoundError('Coupon not found');
  return prisma.coupon.update({ where: { id }, data: { isActive: false } });
}
