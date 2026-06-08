import { Router } from 'express';
import * as wishlistController from './wishlist.controller';
import { validate } from '../../middlewares/validate';
import { authenticate } from '../../middlewares/auth';
import { addWishlistSchema, removeWishlistSchema } from './wishlist.validation';

const router = Router();

router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/', validate(addWishlistSchema), wishlistController.addToWishlist);
router.delete('/:productId', validate(removeWishlistSchema), wishlistController.removeFromWishlist);

export default router;
