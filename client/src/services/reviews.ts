import { api } from './api';
import type { ApiResponse, ApiListResponse, Review } from '@/types/api';

export async function getProductReviews(productId: string, page = 1) {
  const { data } = await api.get<ApiListResponse<Review>>(`/reviews/products/${productId}`, { params: { page, limit: 10 } });
  return data;
}

export async function createReview(payload: { productId: string; rating: number; comment: string }) {
  const { data } = await api.post<ApiResponse<Review>>('/reviews', payload);
  return data.data;
}
