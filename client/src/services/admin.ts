import { api } from './api';
import type { ApiListResponse } from '@/types/api';

export interface AdminOrder {
  id: string;
  orderCode: string;
  status: string;
  total: string;
  subtotal: string;
  createdAt: string;
  paymentMethod: string;
  shippingMethod: string;
  user: { id: string; email: string; fullName: string };
  items: { id: string; productName: string; productImage: string; quantity: number; price: string; total: string; variantName: string | null }[];
}

export interface AdminReview {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  user: { id: string; fullName: string; avatar: string | null };
  product: { id: string; name: string; slug: string };
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  status: string;
  basePrice: string;
  salePrice: string | null;
  avgRating: number;
  totalReviews: number;
  totalSold: number;
  brand: { name: string } | null;
  category: { name: string } | null;
  variants: { id: string; name: string; stock: number }[];
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: string;
  minOrderAmount: string | null;
  maxDiscount: string | null;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}

export async function getAdminOrders(page = 1, status?: string) {
  const { data } = await api.get<ApiListResponse<AdminOrder>>('/admin/orders', {
    params: { page, limit: 20, ...(status ? { status } : {}) },
  });
  return data;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { data } = await api.put(`/admin/orders/${orderId}/status`, { status });
  return data.data;
}

export async function getAdminReviews(page = 1) {
  const { data } = await api.get<ApiListResponse<AdminReview>>('/admin/reviews', {
    params: { page, limit: 20 },
  });
  return data;
}

export async function approveReview(reviewId: string, isApproved: boolean) {
  const { data } = await api.put(`/admin/reviews/${reviewId}/approve`, { isApproved });
  return data.data;
}

export async function getAdminProducts(page = 1) {
  const { data } = await api.get<ApiListResponse<AdminProduct>>('/admin/products', {
    params: { page, limit: 20 },
  });
  return data;
}

export async function updateProduct(productId: string, updates: Record<string, unknown>) {
  const { data } = await api.put(`/admin/products/${productId}`, updates);
  return data.data;
}

export async function getAdminCoupons() {
  const { data } = await api.get<{ data: AdminCoupon[] }>('/admin/coupons');
  return data.data;
}

export async function createCoupon(payload: {
  code: string; type: string; value: number;
  minOrderAmount?: number | null; maxDiscount?: number | null;
  usageLimit?: number; startDate: string; endDate: string;
}) {
  const { data } = await api.post('/admin/coupons', payload);
  return data.data;
}

export async function toggleCoupon(couponId: string, isActive: boolean) {
  const { data } = await api.put(`/admin/coupons/${couponId}`, { isActive });
  return data.data;
}

export async function deleteCoupon(couponId: string) {
  await api.delete(`/admin/coupons/${couponId}`);
}
