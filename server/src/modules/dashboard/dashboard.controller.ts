import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import * as dashboardService from './dashboard.service';

// GET /api/admin/dashboard/summary
export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getSummary();
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/revenue?days=30
export async function getRevenueSeries(req: Request, res: Response, next: NextFunction) {
  try {
    const days = Math.min(Number(req.query.days) || 30, 365);
    const data = await dashboardService.getRevenueSeries(days);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/orders-by-status
export async function getOrdersByStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const period = typeof req.query.period === 'string' ? req.query.period : undefined;
    const data = await dashboardService.getOrdersByStatus(period);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/top-products?period=month&limit=10
export async function getTopProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const period = typeof req.query.period === 'string' ? req.query.period : 'month';
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await dashboardService.getTopProducts(period, limit);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/top-customers?limit=5
export async function getTopCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 50);
    const data = await dashboardService.getTopCustomers(limit);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/stringing-queue
export async function getStringQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getStringQueue();
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/low-stock-alerts?threshold=5
export async function getLowStockAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const threshold = Number(req.query.threshold) || 5;
    const data = await dashboardService.getLowStockAlerts(threshold);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/dashboard/aov?period=month
export async function getAOV(req: Request, res: Response, next: NextFunction) {
  try {
    const period = typeof req.query.period === 'string' ? req.query.period : undefined;
    const data = await dashboardService.getAOV(period);
    return sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
}
