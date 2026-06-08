import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

// Module routes
import authRoutes from '../modules/auth/auth.route';
import userRoutes, { userAdminRouter } from '../modules/user/user.route';
import notificationRoutes, { notificationPrefsRouter } from '../modules/notification/notification.route';
import { dashboardAdminRouter } from '../modules/dashboard/dashboard.route';
import categoryRoutes from '../modules/category/category.route';
import brandRoutes from '../modules/brand/brand.route';
import productRoutes, { productAdminRouter } from '../modules/product/product.route';
import stringingRoutes from '../modules/stringing/stringing.route';
import cartRoutes from '../modules/cart/cart.route';
import orderRoutes, { orderAdminRouter, checkoutRouter } from '../modules/order/order.route';
import shippingRoutes from '../modules/shipping/shipping.route';
import reviewRoutes, { reviewAdminRouter } from '../modules/review/review.route';
import couponRoutes, { couponAdminRouter } from '../modules/coupon/coupon.route';
import wishlistRoutes from '../modules/wishlist/wishlist.route';
import {
  bannerPublicRouter, athletePublicRouter, technologyPublicRouter,
  bannerAdminRouter, athleteAdminRouter, technologyAdminRouter,
} from '../modules/content/content.route';
import locationRoutes from '../modules/location/location.route';
import paymentRoutes from '../modules/payment/payment.route';
import returnsRoutes, { returnsAdminRouter } from '../modules/returns/returns.route';

const router = Router();

// Health check
router.get('/health', healthCheck);

// Auth & User
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Public catalog
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/stringing', stringingRoutes);

// Notifications
router.use('/notifications', notificationRoutes);
router.use('/users/me', notificationPrefsRouter);

// Authenticated user features + checkout
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/checkout', checkoutRouter);
router.use('/shipping', shippingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/wishlist', wishlistRoutes);

// Location (VN administrative divisions)
router.use('/location', locationRoutes);

// Payment webhooks & return URLs
router.use('/payment', paymentRoutes);

// Returns & refunds
router.use('/returns', returnsRoutes);

// Public content
router.use('/banners', bannerPublicRouter);
router.use('/athletes', athletePublicRouter);
router.use('/technologies', technologyPublicRouter);

// Admin routes
router.use('/admin/users', userAdminRouter);
router.use('/admin/products', productAdminRouter);
router.use('/admin/orders', orderAdminRouter);
router.use('/admin/reviews', reviewAdminRouter);
router.use('/admin/coupons', couponAdminRouter);
router.use('/admin/banners', bannerAdminRouter);
router.use('/admin/athletes', athleteAdminRouter);
router.use('/admin/technologies', technologyAdminRouter);
router.use('/admin/returns', returnsAdminRouter);
router.use('/admin/dashboard', dashboardAdminRouter);

export default router;
