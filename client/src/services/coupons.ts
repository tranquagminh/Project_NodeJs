import { api } from './api';
import type { ApiResponse } from '@/types/api';

export interface CouponResult {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: string;
  discountAmount: number;
}

export async function verifyCoupon(code: string, orderAmount: number): Promise<CouponResult> {
  const { data } = await api.post<ApiResponse<CouponResult>>('/coupons/verify', { code, orderAmount });
  return data.data;
}
