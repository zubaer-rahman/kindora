import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getNotificationHistory,
} from '../controllers/notification.controller.js';

const router = Router();

router.use(requireAuth);

router.get('/', getUserNotifications);
router.get('/history', getNotificationHistory);
router.get('/unread-count', getUnreadCount);
router.post('/read-all', markAllAsRead);
router.patch('/read/:notificationId', markAsRead);

export default router;