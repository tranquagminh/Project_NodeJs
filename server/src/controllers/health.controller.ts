import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

export function healthCheck(_req: Request, res: Response) {
  sendSuccess(res, {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }, 'Server is running');
}
