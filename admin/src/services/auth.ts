import { api } from './api';
import type { ApiResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<ApiResponse<AuthData>>('/auth/login', payload).then((r) => r.data.data),

  me: () =>
    api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),
};
