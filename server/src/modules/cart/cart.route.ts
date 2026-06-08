import { Router } from 'express';
import * as cartController from './cart.controller';
import { validate } from '../../middlewares/validate';
import { requireAuth, optionalAuth } from '../../middlewares/auth';
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemIdSchema,
  mergeGuestCartSchema,
  cartPayloadSchema,
} from './cart.validation';

const router = Router();

// ── Stateless public endpoints (no auth) ─────────────────────────────────────
router.post('/validate', validate(cartPayloadSchema), cartController.validatePayload);
router.post('/calculate', validate(cartPayloadSchema), cartController.calculatePayload);

// ── Authenticated endpoints ───────────────────────────────────────────────────
router.get('/', requireAuth, cartController.getCart);
router.post('/items', requireAuth, validate(addCartItemSchema), cartController.addItem);
router.put('/items/:itemId', requireAuth, validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:itemId', requireAuth, validate(cartItemIdSchema), cartController.removeItem);
router.delete('/', requireAuth, cartController.clearCart);
router.post('/merge', requireAuth, validate(mergeGuestCartSchema), cartController.mergeGuestCart);

export default router;
