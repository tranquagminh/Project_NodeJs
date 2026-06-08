import { api } from './api';
import type { ApiResponse, DashboardSummary, RevenuePoint, TopProduct, LowStockVariant, StringQueueItem } from '../types';

export const dashboardService = {
  getSummary: () =>
    api.get<ApiResponse<DashboardSummary>>('/admin/dashboard/summary').then((r) => r.data.data),

  getRevenueSeries: (days = 30) =>
    api.get<ApiResponse<RevenuePoint[]>>(`/admin/dashboard/revenue?days=${days}`).then((r) => r.data.data),

  getTopProducts: (period?: string, limit = 10) =>
    api.get<ApiResponse<TopProduct[]>>('/admin/dashboard/top-products', { params: { period, limit } }).then((r) => r.data.data),

  getLowStock: (threshold = 5) =>
    api.get<ApiResponse<LowStockVariant[]>>('/admin/dashboard/low-stock', { params: { threshold } }).then((r) => r.data.data),

  getStringQueue: () =>
    api.get<ApiResponse<StringQueueItem[]>>('/admin/dashboard/string-queue').then((r) => r.data.data),

  getAOV: (period?: string) =>
    api.get<ApiResponse<{ aov: number; orderCount: number; revenue: number }>>('/admin/dashboard/aov', { params: { period } }).then((r) => r.data.data),
};
