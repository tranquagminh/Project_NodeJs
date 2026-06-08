import { api } from './api';
import type { PaginatedResponse, ApiResponse, Product } from '../types';

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  brandId?: string;
}

export const productsService = {
  list: (params: ProductListParams = {}) =>
    api.get<PaginatedResponse<Product>>('/admin/products', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/admin/products/${id}`).then((r) => r.data.data),

  updateStatus: (id: string, status: string) =>
    api.put<ApiResponse<Product>>(`/admin/products/${id}/status`, { status }).then((r) => r.data.data),
};
