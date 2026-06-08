import { Router } from 'express';
import * as reviewController from './review.controller';
import { authenticate, authorize } from '../../middlewares/auth';

const router = Router();

// Public
router.get('/products/:productId', reviewController.getProductReviews);
router.get('/products/:productId/distribution', reviewController.getProductRatingDistribution);

// Authenticated user
router.post('/', authenticate, reviewController.createReview);
router.get('/my', authenticate, reviewController.listMyReviews);
router.put('/:id', authenticate, reviewController.editReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/helpful', authenticate, reviewController.voteHelpful);
router.delete('/:id/helpful', authenticate, reviewController.unvoteHelpful);

export default router;

// Admin
export const reviewAdminRouter = Router();
reviewAdminRouter.use(authenticate, authorize('ADMIN', 'SUPER_ADMIN'));
reviewAdminRouter.get('/', reviewController.listAdminReviews);
reviewAdminRouter.put('/:id/approve', reviewController.approveReview);
reviewAdminRouter.put('/:id/reject', reviewController.rejectReview);
reviewAdminRouter.delete('/:id', reviewController.adminDeleteReview);
