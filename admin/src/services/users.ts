import { api } from './api';
import type { PaginatedResponse, ApiResponse, User, UserRole } from '../types';

export interface UserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}

export const usersService = {
  list: (params: UserListParams = {}) =>
    api.get<PaginatedResponse<User>>('/admin/users', { params }).then((r) => r.data),

  updateRole: (id: string, role: UserRole) =>
    api.put<ApiResponse<User>>(`/admin/users/${id}/role`, { role }).then((r) => r.data.data),

  ban: (id: string) =>
    api.put<ApiResponse<User>>(`/admin/users/${id}/ban`).then((r) => r.data.data),
};
