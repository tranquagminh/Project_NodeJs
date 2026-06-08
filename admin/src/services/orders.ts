import { api } from './api';
import type { PaginatedResponse, ApiResponse, Order, OrderStatus } from '../types';

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  search?: string;
}

export const ordersService = {
  list: (params: OrderListParams = {}) =>
    api.get<PaginatedResponse<Order>>('/admin/orders', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/admin/orders/${id}`).then((r) => r.data.data),

  updateStatus: (id: string, status: OrderStatus, note?: string) =>
    api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status, note }).then((r) => r.data.data),
};
