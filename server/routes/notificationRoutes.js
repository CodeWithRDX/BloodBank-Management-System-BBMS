import express from 'express';
import { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  clearAllNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  testTelegramSettings,
  testWhatsAppSettings
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyNotifications);
router.put('/read-all', protect, markAllAsRead);
router.get('/settings', protect, getNotificationSettings);
router.put('/settings', protect, updateNotificationSettings);
router.post('/settings/test-telegram', protect, testTelegramSettings);
router.post('/settings/test-whatsapp', protect, testWhatsAppSettings);
router.put('/:id/read', protect, markAsRead);
router.delete('/clear-all', protect, clearAllNotifications);
router.delete('/:id', protect, deleteNotification);

export default router;
