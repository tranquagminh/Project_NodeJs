import { Router } from 'express';
import * as productController from './product.controller';
import { validate } from '../../middlewares/validate';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  productQuerySchema, productSlugSchema, searchQuerySchema,
  createProductSchema, updateProductSchema, productIdSchema,
  upsertSpecSchema, createVariantSchema, updateVariantSchema, variantIdSchema,
  createImageSchema, imageIdSchema,
} from './product.validation';

const router = Router();

// ==================== Public ====================
router.get('/', validate(productQuerySchema), productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/search', validate(searchQuerySchema), productController.searchProducts);
router.get('/:slug', validate(productSlugSchema), productController.getProductBySlug);

// ==================== Admin ====================
const admin = Router();
admin.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));

admin.get('/', productController.getAllProducts);
admin.post('/', validate(createProductSchema), productController.createProduct);
admin.put('/:id', validate(updateProductSchema), productController.updateProduct);
admin.delete('/:id', validate(productIdSchema), productController.deleteProduct);

// Spec
admin.put('/:id/specs', validate(upsertSpecSchema), productController.upsertSpec);

// Variants
admin.post('/:id/variants', validate(createVariantSchema), productController.createVariant);
admin.put('/:id/variants/:variantId', validate(updateVariantSchema), productController.updateVariant);
admin.delete('/:id/variants/:variantId', validate(variantIdSchema), productController.deleteVariant);

// Images
admin.post('/:id/images', validate(createImageSchema), productController.addImage);
admin.delete('/:id/images/:imageId', validate(imageIdSchema), productController.deleteImage);

export { admin as productAdminRouter };
export default router;
