import { Router } from 'express';
import * as categoryController from './category.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize } from '../../middlewares/auth';
import { createCategorySchema, updateCategorySchema, categoryIdSchema } from './category.validation';

const router = Router();

// Public
router.get('/', categoryController.getCategories);

// Admin
router.get('/admin', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), categoryController.getAllCategories);
router.get('/:id', validate(categoryIdSchema), categoryController.getCategoryById);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createCategorySchema), categoryController.createCategory);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(categoryIdSchema), categoryController.deleteCategory);

export default router;
