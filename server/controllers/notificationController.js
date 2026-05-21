import Notification from '../models/Notification.js';

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
