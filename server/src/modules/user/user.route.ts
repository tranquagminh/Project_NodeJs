import { Router } from 'express';
import * as userController from './user.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  updateProfileSchema,
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
  addressIdSchema,
  adminChangeRoleSchema,
  adminUserIdSchema,
} from './user.validation';

const router = Router();

// ── Authenticated user routes ─────────────────────────────────────────────────
router.use(authenticate);

router.put('/profile', validate(updateProfileSchema), userController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), userController.changePassword);

// Address CRUD
router.get('/addresses', userController.getAddresses);
router.post('/addresses', validate(createAddressSchema), userController.createAddress);
router.put('/addresses/:id', validate(updateAddressSchema), userController.updateAddress);
router.delete('/addresses/:id', validate(addressIdSchema), userController.deleteAddress);

export default router;

// ── Admin user management ─────────────────────────────────────────────────────
export const userAdminRouter = Router();

userAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

userAdminRouter.get('/', userController.listUsers);
userAdminRouter.get('/:id', validate(adminUserIdSchema), userController.getUserById);
userAdminRouter.patch('/:id/suspend', validate(adminUserIdSchema), userController.suspendUser);
userAdminRouter.patch('/:id/activate', validate(adminUserIdSchema), userController.activateUser);
// Role changes restricted to SUPER_ADMIN
userAdminRouter.patch(
  '/:id/role',
  authorize('SUPER_ADMIN'),
  validate(adminChangeRoleSchema),
  userController.changeUserRole,
);
