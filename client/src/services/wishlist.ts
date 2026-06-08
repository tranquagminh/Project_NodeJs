import { api } from './api';
import type { ApiResponse, ProductListItem } from '@/types/api';

export async function getWishlist(): Promise<ProductListItem[]> {
  const { data } = await api.get<ApiResponse<ProductListItem[]>>('/wishlist');
  return data.data;
}

export async function addToWishlist(productId: string) {
  const { data } = await api.post<ApiResponse<{ productId: string }>>('/wishlist', { productId });
  return data.data;
}

export async function removeFromWishlist(productId: string) {
  await api.delete(`/wishlist/${productId}`);
}
