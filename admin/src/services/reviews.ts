import { api } from './api';
import type { PaginatedResponse, ApiResponse, Review } from '../types';

export interface ReviewListParams {
  page?: number;
  limit?: number;
  status?: string;
  productId?: string;
}

export const reviewsService = {
  list: (params: ReviewListParams = {}) =>
    api.get<PaginatedResponse<Review>>('/admin/reviews', { params }).then((r) => r.data),

  approve: (id: string) =>
    api.put<ApiResponse<Review>>(`/admin/reviews/${id}/approve`).then((r) => r.data.data),

  reject: (id: string, reason: string) =>
    api.put<ApiResponse<Review>>(`/admin/reviews/${id}/reject`, { reason }).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete(`/admin/reviews/${id}`).then((r) => r.data),
};
