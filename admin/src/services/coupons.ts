import { api } from './api';
import type { PaginatedResponse, ApiResponse, Coupon, CouponType } from '../types';

export interface CouponListParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface CreateCouponPayload {
  code: string;
  type: CouponType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: string;
  endDate?: string;
}

export const couponsService = {
  list: (params: CouponListParams = {}) =>
    api.get<PaginatedResponse<Coupon>>('/admin/coupons', { params }).then((r) => r.data),

  create: (payload: CreateCouponPayload) =>
    api.post<ApiResponse<Coupon>>('/admin/coupons', payload).then((r) => r.data.data),

  update: (id: string, payload: Partial<CreateCouponPayload> & { isActive?: boolean }) =>
    api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, payload).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/admin/coupons/${id}`).then((r) => r.data),

  toggle: (id: string, isActive: boolean) =>
    api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, { isActive }).then((r) => r.data.data),
};
