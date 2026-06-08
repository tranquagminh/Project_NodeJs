import { NotificationType } from '@prisma/client';
import type { NotificationPrefs } from './notification.service';

export type EmailBehavior = 'ALWAYS' | 'RESPECTS_PREFERENCE' | 'NEVER';

export interface NotificationTypeConfig {
  category: 'TRANSACTIONAL' | 'WISHLIST' | 'LOYALTY' | 'REVIEW' | 'MARKETING';
  inApp: boolean;
  email: EmailBehavior;
  preferenceKey?: keyof NotificationPrefs;
}

export const NOTIFICATION_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  // Order lifecycle — transactional, always email
  ORDER_CONFIRMED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },
  ORDER_PROCESSING: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },
  ORDER_SHIPPED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },
  ORDER_DELIVERED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },
  ORDER_CANCELLED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },

  // Payment — transactional, always email
  PAYMENT_SUCCESS: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },
  PAYMENT_FAILED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },
  PAYMENT_REFUNDED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },

  // Returns — transactional, always email
  RETURN_APPROVED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },
  RETURN_REJECTED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },
  RETURN_COMPLETED: { category: 'TRANSACTIONAL', inApp: true, email: 'ALWAYS' },

  // Wishlist — respects preference
  BACK_IN_STOCK: { category: 'WISHLIST', inApp: true, email: 'RESPECTS_PREFERENCE', preferenceKey: 'backInStockEmails' },
  PRICE_DROP: { category: 'WISHLIST', inApp: true, email: 'RESPECTS_PREFERENCE', preferenceKey: 'priceDropEmails' },

  // In-app only
  LOW_STOCK_WISHLIST: { category: 'WISHLIST', inApp: true, email: 'NEVER' },
  REVIEW_APPROVED: { category: 'REVIEW', inApp: true, email: 'NEVER' },
  REVIEW_REJECTED: { category: 'REVIEW', inApp: true, email: 'NEVER' },

  // Loyalty
  POINTS_EARNED: { category: 'LOYALTY', inApp: true, email: 'RESPECTS_PREFERENCE', preferenceKey: 'pointsEarnedEmails' },
  POINTS_EXPIRING: { category: 'LOYALTY', inApp: true, email: 'RESPECTS_PREFERENCE', preferenceKey: 'pointsExpiringEmails' },

  // Marketing
  PROMOTION: { category: 'MARKETING', inApp: true, email: 'RESPECTS_PREFERENCE', preferenceKey: 'promotionEmails' },
};
