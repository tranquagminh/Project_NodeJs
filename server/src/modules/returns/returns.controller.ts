import { Request, Response, NextFunction } from 'express';
import * as returnsService from './returns.service';
import { sendSuccess, sendPaginated } from '../../utils/response';

// ─── User endpoints ───────────────────────────────────────────────────────────

export async function submitReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await returnsService.submitReturn(
      req.body,
      req.params.orderId as string,
      req.user!.id,
    );
    sendSuccess(res, result, 'Return request submitted', 201);
  } catch (e) { next(e); }
}

export async function submitGuestReturn(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await returnsService.submitGuestReturn(
      req.body,
      req.params.orderCode as string,
      req.body.email,
    );
    sendSuccess(res, result, 'Return request submitted', 201);
  } catch (e) { next(e); }
}

export async function cancelReturn(req: Request, res: Response, next: NextFunction) {
  try {
    await returnsService.cancelReturn(req.params.id as string, req.user!.id);
    sendSuccess(res, null, 'Return request cancelled');
  } catch (e) { next(e); }
}

export async function submitReturnTracking(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await returnsService.submitReturnTracking(
      req.params.id as string,
      req.user!.id,
      req.body,
    );
    sendSuccess(res, result, 'Tracking info submitted');
  } catch (e) { next(e); }
}

export async function listMyReturns(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query as Record<string, string | undefined>;
    const result = await returnsService.listMyReturns(req.user!.id, {
      page: Number(page) || 1,
      pageSize: Number(limit) || 10,
    });
    sendPaginated(res, result.data, { page: result.page, limit: result.pageSize, total: result.total });
  } catch (e) { next(e); }
}

export async function getMyReturn(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await returnsService.getMyReturn(req.params.id as string, req.user!.id));
  } catch (e) { next(e); }
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export async function listAdminReturns(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit, status } = req.query as Record<string, string | undefined>;
    const result = await returnsService.listAdminReturns({
      page: Number(page) || 1,
      pageSize: Number(limit) || 20,
      status: status as Parameters<typeof returnsService.listAdminReturns>[0]['status'],
    });
    sendPaginated(res, result.data, { page: result.page, limit: result.pageSize, total: result.total });
  } catch (e) { next(e); }
}

export async function getAdminReturn(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await returnsService.getAdminReturn(req.params.id as string));
  } catch (e) { next(e); }
}

export async function approveReturn(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await returnsService.approveReturn(req.params.id as string, req.body), 'Return approved');
  } catch (e) { next(e); }
}

export async function rejectReturn(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await returnsService.rejectReturn(req.params.id as string, req.body), 'Return rejected');
  } catch (e) { next(e); }
}

export async function markReturnReceived(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await returnsService.markReturnReceived(req.params.id as string, req.body), 'Return marked as received');
  } catch (e) { next(e); }
}

export async function processRefund(req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await returnsService.processRefund(req.params.id as string), 'Refund processed');
  } catch (e) { next(e); }
}
