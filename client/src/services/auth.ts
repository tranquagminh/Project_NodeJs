import { api } from './api';
import type { ApiResponse, AuthUser } from '@/types/api';

export async function login(email: string, password: string) {
  const { data } = await api.post<ApiResponse<{ user: AuthUser; accessToken: string }>>('/auth/login', { email, password });
  return data.data;
}

export async function register(fullName: string, email: string, password: string) {
  const { data } = await api.post<ApiResponse<{ user: AuthUser; accessToken: string }>>('/auth/register', { fullName, email, password });
  return data.data;
}

export async function logout() {
  await api.post('/auth/logout').catch(() => {});
}

export async function getMe() {
  const { data } = await api.get<ApiResponse<AuthUser>>('/auth/me');
  return data.data;
}
