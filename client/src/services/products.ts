import { api } from './api';
import type { ApiResponse, ApiListResponse, ProductListItem, ProductDetail } from '@/types/api';

export interface ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
  categoryId?: string;
  brandId?: string;
  skillLevel?: string;
  playStyle?: string;
  series?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== ''),
  );
  const { data } = await api.get<ApiListResponse<ProductListItem>>('/products', { params });
  return data;
}

export async function getFeaturedProducts() {
  const { data } = await api.get<ApiResponse<ProductListItem[]>>('/products/featured');
  return data.data;
}

export async function getNewArrivals() {
  const { data } = await api.get<ApiResponse<ProductListItem[]>>('/products/new-arrivals');
  return data.data;
}

export async function getProductBySlug(slug: string) {
  const { data } = await api.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
  return data.data;
}

export async function searchProducts(q: string, page = 1, limit = 12) {
  const { data } = await api.get<ApiListResponse<ProductListItem>>('/products/search', {
    params: { q, page, limit },
  });
  return data;
}
