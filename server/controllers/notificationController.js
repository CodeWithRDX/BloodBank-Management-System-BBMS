import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendTelegramMessage, sendWhatsAppMessage } from '../services/externalNotificationService.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort('-createdAt').limit(50);
    const unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false });
    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error) { next(error); }
};

export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ success: true, data: notification });
  } catch (error) { next(error); }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) { next(error); }
};

export const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user.id });
    res.status(200).json({ success: true, message: 'All notifications cleared' });
  } catch (error) { next(error); }
};

// ─── Get user notification settings ───────────────────────────────────────────
export const getNotificationSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    res.status(200).json({
      success: true,
      data: user.notifications || {
        telegram: { enabled: false, chatId: '' },
        whatsapp: { enabled: false, phone: '' }
      }
    });
  } catch (error) { next(error); }
};

// ─── Update user notification settings ─────────────────────────────────────────
export const updateNotificationSettings = async (req, res, next) => {
  try {
    const { telegram, whatsapp } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.notifications) {
      user.notifications = {
        telegram: { enabled: false, chatId: '' },
        whatsapp: { enabled: false, phone: '' }
      };
    }

    if (telegram) {
      if (telegram.enabled !== undefined) user.notifications.telegram.enabled = telegram.enabled;
      if (telegram.chatId !== undefined) user.notifications.telegram.chatId = telegram.chatId;
    }

    if (whatsapp) {
      if (whatsapp.enabled !== undefined) user.notifications.whatsapp.enabled = whatsapp.enabled;
      if (whatsapp.phone !== undefined) user.notifications.whatsapp.phone = whatsapp.phone;
    }

    await user.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, data: user.notifications });
  } catch (error) { next(error); }
};

// ─── Test Telegram Settings ───────────────────────────────────────────────────
export const testTelegramSettings = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    if (!chatId) return res.status(400).json({ success: false, message: 'Chat ID is required' });

    const testMessage = `🎉 <b>BBMS Connection Successful!</b>\n\nYour Telegram account has been linked successfully to Blood Bank Management System. You will now receive real-time notifications here.`;

    await sendTelegramMessage(chatId, testMessage);
    res.status(200).json({ success: true, message: 'Test notification sent! Check your Telegram.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to dispatch test notification' });
  }
};

// ─── Test WhatsApp Settings ───────────────────────────────────────────────────
export const testWhatsAppSettings = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'WhatsApp phone number is required' });

    const testMessage = `🎉 *BBMS Connection Successful!*\n\nYour WhatsApp number has been linked successfully to Blood Bank Management System. You will now receive real-time notifications here.`;

    await sendWhatsAppMessage(phone, testMessage);
    res.status(200).json({ success: true, message: 'Test notification sent! Check your WhatsApp.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to dispatch test notification' });
  }
};
