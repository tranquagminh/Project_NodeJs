import { Router } from 'express';
import * as returnsController from './returns.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();
router.use(authenticate);

// User: browse own returns
router.get('/', returnsController.listMyReturns);
router.get('/:id', returnsController.getMyReturn);

// User: submit return for a delivered order
router.post('/orders/:orderId', returnsController.submitReturn);

// Guest return (no auth required — uses email verification inside service)
router.post('/guest/:orderCode', returnsController.submitGuestReturn);

// User: cancel or add tracking to their own return
router.patch('/:id/cancel', returnsController.cancelReturn);
router.patch('/:id/tracking', returnsController.submitReturnTracking);

export default router;

// Admin
export const returnsAdminRouter = Router();
returnsAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
returnsAdminRouter.get('/', returnsController.listAdminReturns);
returnsAdminRouter.get('/:id', returnsController.getAdminReturn);
returnsAdminRouter.post('/:id/approve', returnsController.approveReturn);
returnsAdminRouter.post('/:id/reject', returnsController.rejectReturn);
returnsAdminRouter.post('/:id/received', returnsController.markReturnReceived);
returnsAdminRouter.post('/:id/refund', returnsController.processRefund);
