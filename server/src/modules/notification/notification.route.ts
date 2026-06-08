import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import {
  listMyNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
} from './notification.controller';

const router = Router();
router.use(authenticate);

router.get('/', listMyNotifications);
router.get('/unread-count', getUnreadCount);
router.post('/mark-all-read', markAllRead);
router.post('/:id/mark-read', markRead);
router.delete('/:id', deleteNotification);

export default router;

// Notification preferences — mounted under /users/me
export const notificationPrefsRouter = Router();
notificationPrefsRouter.use(authenticate);
notificationPrefsRouter.get('/notification-preferences', getPreferences);
notificationPrefsRouter.put('/notification-preferences', updatePreferences);
