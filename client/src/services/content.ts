import { api } from './api';
import type { ApiResponse, Athlete } from '@/types/api';

export async function getAthletes() {
  const { data } = await api.get<ApiResponse<Athlete[]>>('/athletes');
  return data.data;
}
