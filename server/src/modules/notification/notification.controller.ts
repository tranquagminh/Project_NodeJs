import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendPaginated } from '../../utils/response';
import * as notificationService from './notification.service';

// GET /api/notifications?page&pageSize&unreadOnly
export async function listMyNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await notificationService.listUserNotifications(userId, { page, pageSize, unreadOnly });
    return sendPaginated(res, result.data, { page, limit: pageSize, total: result.total });
  } catch (err) {
    next(err);
  }
}

// GET /api/notifications/unread-count
export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const count = await notificationService.getUnreadCount(userId);
    return sendSuccess(res, { count });
  } catch (err) {
    next(err);
  }
}

// POST /api/notifications/:id/mark-read
export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const notifId = String(req.params.id);
    await notificationService.markAsRead(notifId, userId);
    return sendSuccess(res, null, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

// POST /api/notifications/mark-all-read
export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);
    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}

// DELETE /api/notifications/:id
export async function deleteNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const notifId = String(req.params.id);
    await notificationService.deleteNotification(notifId, userId);
    return sendSuccess(res, null, 'Notification deleted');
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/notification-preferences
export async function getPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const prefs = await notificationService.getOrCreatePreferences(userId);
    return sendSuccess(res, prefs);
  } catch (err) {
    next(err);
  }
}

// PUT /api/users/me/notification-preferences
export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const {
      promotionEmails,
      backInStockEmails,
      priceDropEmails,
      pointsExpiringEmails,
      pointsEarnedEmails,
    } = req.body as Partial<{
      promotionEmails: boolean;
      backInStockEmails: boolean;
      priceDropEmails: boolean;
      pointsExpiringEmails: boolean;
      pointsEarnedEmails: boolean;
    }>;

    const data: Partial<import('./notification.service').NotificationPrefs> = {};
    if (typeof promotionEmails === 'boolean') data.promotionEmails = promotionEmails;
    if (typeof backInStockEmails === 'boolean') data.backInStockEmails = backInStockEmails;
    if (typeof priceDropEmails === 'boolean') data.priceDropEmails = priceDropEmails;
    if (typeof pointsExpiringEmails === 'boolean') data.pointsExpiringEmails = pointsExpiringEmails;
    if (typeof pointsEarnedEmails === 'boolean') data.pointsEarnedEmails = pointsEarnedEmails;

    const updated = await notificationService.updatePreferences(userId, data);
    return sendSuccess(res, updated, 'Preferences updated');
  } catch (err) {
    next(err);
  }
}
