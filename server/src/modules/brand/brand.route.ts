import { Router } from 'express';
import * as brandController from './brand.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize } from '../../middlewares/auth';
import { createBrandSchema, updateBrandSchema, brandIdSchema } from './brand.validation';

const router = Router();

// Public
router.get('/', brandController.getBrands);

// Admin
router.get('/admin', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), brandController.getAllBrands);
router.get('/:id', validate(brandIdSchema), brandController.getBrandById);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createBrandSchema), brandController.createBrand);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(updateBrandSchema), brandController.updateBrand);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(brandIdSchema), brandController.deleteBrand);

export default router;
