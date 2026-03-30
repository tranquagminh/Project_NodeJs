import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  data: T,
  meta: { page: number; limit: number; total: number },
  message = 'Success'
) {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  };
  return res.status(200).json(response);
}

export function sendError(res: Response, message: string, statusCode = 500) {
  const response: ApiResponse<null> = {
    success: false,
    message,
  };
  return res.status(statusCode).json(response);
}
