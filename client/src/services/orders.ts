import { api } from './api';
import type { ApiResponse, ApiListResponse, Order } from '@/types/api';

export interface CreateOrderPayload {
  items: { productId: string; variantId?: string; quantity: number; price: number }[];
  shippingAddress: { firstName: string; lastName: string; addressLine1: string; city: string; postalCode: string; country?: string };
  shippingMethod: 'STANDARD_DELIVERY' | 'EXPRESS_VELOCITY';
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'E_WALLET';
  couponCode?: string;
  note?: string;
}

export async function createOrder(payload: CreateOrderPayload) {
  const { data } = await api.post<ApiResponse<Order>>('/orders', payload);
  return data.data;
}

export async function getOrders(page = 1) {
  const { data } = await api.get<ApiListResponse<Order>>('/orders', { params: { page, limit: 10 } });
  return data;
}

export async function getOrderById(id: string) {
  const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return data.data;
}

export async function cancelOrder(id: string) {
  const { data } = await api.put<ApiResponse<Order>>(`/orders/${id}/cancel`);
  return data.data;
}
