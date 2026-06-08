import { api } from './api';
import type { PaginatedResponse, ApiResponse, ReturnRequest } from '../types';

export interface ReturnListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const returnsService = {
  list: (params: ReturnListParams = {}) =>
    api.get<PaginatedResponse<ReturnRequest>>('/admin/returns', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<ReturnRequest>>(`/admin/returns/${id}`).then((r) => r.data.data),

  approve: (id: string, note?: string) =>
    api.put<ApiResponse<ReturnRequest>>(`/admin/returns/${id}/approve`, { note }).then((r) => r.data.data),

  reject: (id: string, reason: string) =>
    api.put<ApiResponse<ReturnRequest>>(`/admin/returns/${id}/reject`, { reason }).then((r) => r.data.data),

  markReceived: (id: string) =>
    api.put<ApiResponse<ReturnRequest>>(`/admin/returns/${id}/received`).then((r) => r.data.data),

  processRefund: (id: string, refundAmount: number) =>
    api.post<ApiResponse<ReturnRequest>>(`/admin/returns/${id}/refund`, { refundAmount }).then((r) => r.data.data),
};
