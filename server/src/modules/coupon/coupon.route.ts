import { Router } from 'express';
import * as couponController from './coupon.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize, optionalAuth } from '../../middlewares/auth';
import { validateCouponSchema, createCouponSchema, updateCouponSchema, couponIdSchema } from './coupon.validation';

const router = Router();

// Public — with optional auth so per-user usage is checked when authenticated
router.post('/validate', optionalAuth, validate(validateCouponSchema), couponController.validateCoupon);

export default router;

export const couponAdminRouter = Router();
couponAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
couponAdminRouter.get('/', couponController.listCoupons);
couponAdminRouter.post('/', validate(createCouponSchema), couponController.createCoupon);
couponAdminRouter.put('/:id', validate(updateCouponSchema), couponController.updateCoupon);
couponAdminRouter.delete('/:id', validate(couponIdSchema), couponController.deactivateCoupon);
