import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  getSummary,
  getRevenueSeries,
  getOrdersByStatus,
  getTopProducts,
  getTopCustomers,
  getStringQueue,
  getLowStockAlerts,
  getAOV,
} from './dashboard.controller';

export const dashboardAdminRouter = Router();

dashboardAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

dashboardAdminRouter.get('/summary', getSummary);
dashboardAdminRouter.get('/revenue', getRevenueSeries);
dashboardAdminRouter.get('/orders-by-status', getOrdersByStatus);
dashboardAdminRouter.get('/top-products', getTopProducts);
dashboardAdminRouter.get('/top-customers', getTopCustomers);
dashboardAdminRouter.get('/stringing-queue', getStringQueue);
dashboardAdminRouter.get('/low-stock-alerts', getLowStockAlerts);
dashboardAdminRouter.get('/aov', getAOV);
