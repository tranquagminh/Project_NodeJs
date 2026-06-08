import { Router } from 'express';
import * as orderController from './order.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize, optionalAuth } from '../../middlewares/auth';
import {
  createOrderSchema,
  validateCheckoutSchema,
  orderIdSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
  trackingSchema,
} from './order.validation';

// ── Main router (mounted at /orders) ─────────────────────────────────────────
const router = Router();

// POST /orders (create — public or auth)
router.post('/', optionalAuth, validate(createOrderSchema), orderController.createOrder);

// GET /orders/lookup/:orderCode?email=... (guest lookup)
router.get('/lookup/:orderCode', orderController.lookupOrder);

// Authenticated: /orders/me/*
router.get('/me', authenticate, orderController.listMyOrders);
router.get('/me/:id', authenticate, validate(orderIdSchema), orderController.getMyOrder);
router.post('/me/:id/cancel', authenticate, validate(cancelOrderSchema), orderController.cancelMyOrder);

export default router;

// ── Checkout router (mounted at /checkout) ───────────────────────────────────
export const checkoutRouter = Router();
checkoutRouter.post('/validate', optionalAuth, validate(validateCheckoutSchema), orderController.validateCheckout);

// ── Admin endpoints (mounted at /admin/orders) ───────────────────────────────
export const orderAdminRouter = Router();
orderAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

orderAdminRouter.get('/', orderController.listAllOrders);
orderAdminRouter.get('/:id', validate(orderIdSchema), orderController.getAdminOrder);
orderAdminRouter.post('/:id/confirm', validate(orderIdSchema), orderController.adminConfirmCod);
orderAdminRouter.patch('/:id/status', validate(updateOrderStatusSchema), orderController.adminUpdateStatus);
orderAdminRouter.post('/:id/mark-paid', validate(orderIdSchema), orderController.adminMarkPaid);
orderAdminRouter.patch('/:id/tracking', validate(trackingSchema), orderController.adminUpdateTracking);
orderAdminRouter.post('/:id/cancel', validate(cancelOrderSchema), orderController.adminCancelOrder);
