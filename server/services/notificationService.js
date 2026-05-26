import Notification from '../models/Notification.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';
import { emitNotification } from '../utils/socketManager.js';
import { sendTelegramMessage, sendWhatsAppMessage } from './externalNotificationService.js';

class NotificationService {
  // ─── Core: Create in-app notification ──────────────────────────────────────
  static async create({ userId = null, branchId = null, isGlobal = false, title, message, type = 'info', category = 'general', link = '', referenceType, referenceId }) {
    try {
      const notification = await Notification.create({
        userId,
        branchId,
        isGlobal,
        title,
        message,
        type,
        category,
        link,
        referenceType,
        referenceId,
      });

      // Emit real-time notification via Socket.IO
      if (userId) {
        emitNotification(userId.toString(), notification);

        // Dispatch external notifications asynchronously
        this.sendExternalNotifications(userId, title, message).catch((err) =>
          console.error('External notification dispatch failed:', err.message)
        );
      }

      return notification;
    } catch (error) {
      console.error('Notification creation failed:', error.message);
    }
  }

  // ─── Dispatch external notifications (Telegram, WhatsApp) ────────────────────
  static async sendExternalNotifications(userId, title, message) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      const htmlText = `<b>${title}</b>\n\n${message}`;
      const plainText = `*${title}*\n\n${message}`;

      // Telegram
      if (user.notifications?.telegram?.enabled && user.notifications.telegram.chatId) {
        await sendTelegramMessage(user.notifications.telegram.chatId, htmlText);
      }

      // WhatsApp
      if (user.notifications?.whatsapp?.enabled && user.notifications.whatsapp.phone) {
        await sendWhatsAppMessage(user.notifications.whatsapp.phone, plainText);
      }
    } catch (error) {
      console.error('External notifications dispatch failed:', error.message);
    }
  }

  // ─── Send email ─────────────────────────────────────────────────────────────
  static async sendEmail({ email, subject, html }) {
    try {
      await sendEmail({ email, subject, html });
    } catch (error) {
      console.error('Email sending failed:', error.message);
    }
  }

  // ─── Notify all admins ──────────────────────────────────────────────────────
  static async notifyAdmins({ title, message, type = 'info', category = 'general', link = '', referenceType, referenceId }) {
    try {
      const admins = await User.find({ role: 'admin', isActive: true }).select('_id');
      const promises = admins.map((admin) =>
        this.create({ userId: admin._id, title, message, type, category, link, referenceType, referenceId })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Notify admins failed:', error.message);
    }
  }

  // ─── Notify all staff in a branch ───────────────────────────────────────────
  static async notifyBranchStaff(branchId, { title, message, type = 'info', category = 'general', link = '' }) {
    try {
      const staff = await User.find({ branchId, isActive: true }).select('_id');
      const promises = staff.map((s) =>
        this.create({ userId: s._id, branchId, title, message, type, category, link })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error('Notify branch staff failed:', error.message);
    }
  }

  // ─── Blood request status update ─────────────────────────────────────────────
  static async notifyRequestUpdate(request, status) {
    const titles = {
      approved: 'Blood Request Approved',
      rejected: 'Blood Request Rejected',
      completed: 'Blood Request Completed',
      fulfilled: 'Blood Request Fulfilled',
    };

    await this.create({
      userId: request.requestedBy,
      title: titles[status] || 'Request Update',
      message: `Your blood request ${request.requestId} has been ${status}.`,
      type: status === 'rejected' ? 'warning' : 'success',
      category: 'request',
      referenceType: 'BloodRequest',
      referenceId: request._id,
    });

    // Also notify admins
    await this.notifyAdmins({
      title: `Request ${status}: ${request.requestId}`,
      message: `Blood request ${request.requestId} for ${request.bloodGroup} has been ${status}.`,
      type: 'info',
      category: 'request',
      referenceType: 'BloodRequest',
      referenceId: request._id,
    });
  }

  // ─── Low stock alert to admins ───────────────────────────────────────────────
  static async notifyAdminsLowStock(bloodGroup, quantity, branchId = null) {
    await this.notifyAdmins({
      title: '⚠️ Low Blood Stock Alert',
      message: `Blood group ${bloodGroup} is critically low. Current stock: ${quantity} units.${branchId ? ` Branch ID: ${branchId}` : ''}`,
      type: 'warning',
      category: 'low_stock',
      referenceType: 'Manual',
    });
  }

  // ─── Camp registration notification ─────────────────────────────────────────
  static async notifyCampRegistration(camp, donor, registration) {
    // Notify admin
    await this.notifyAdmins({
      title: 'New Camp Registration',
      message: `${donor.fullName} registered for camp: ${camp.name} on ${new Date(camp.date).toLocaleDateString()}.`,
      type: 'info',
      category: 'camp',
      referenceType: 'CampRegistration',
      referenceId: registration._id,
    });

    // Notify branch staff
    if (camp.branchId) {
      await this.notifyBranchStaff(camp.branchId, {
        title: 'New Camp Registration',
        message: `${donor.fullName} registered for ${camp.name}.`,
        type: 'info',
        category: 'camp',
        link: `/staff/camps/${camp._id}`,
      });
    }

    // Notify donor (confirmation)
    await this.create({
      userId: donor.userId,
      title: 'Camp Registration Confirmed',
      message: `You have successfully registered for ${camp.name} on ${new Date(camp.date).toLocaleDateString()}.`,
      type: 'success',
      category: 'camp',
      referenceType: 'CampRegistration',
      referenceId: registration._id,
    });
  }

  // ─── Branch approval notification ────────────────────────────────────────────
  static async notifyBranchApproval(branch, status, managerId) {
    if (managerId) {
      await this.create({
        userId: managerId,
        title: status === 'approved' ? '✅ Branch Approved' : '❌ Branch Rejected',
        message:
          status === 'approved'
            ? `Your blood bank branch "${branch.name}" has been approved and is now active.`
            : `Your blood bank branch "${branch.name}" has been rejected.`,
        type: status === 'approved' ? 'success' : 'error',
        category: 'branch',
        referenceType: 'Branch',
        referenceId: branch._id,
      });
    }
  }

  // ─── Appointment reminder ────────────────────────────────────────────────────
  static async notifyAppointmentReminder(appointment) {
    await this.create({
      userId: appointment.userId,
      title: 'Appointment Reminder',
      message: `You have a donation appointment on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.timeSlot}.`,
      type: 'info',
      category: 'appointment',
      referenceType: 'Appointment',
      referenceId: appointment._id,
    });
  }

  // ─── Blood transfer notifications ────────────────────────────────────────────
  static async notifyTransfer(transfer, event) {
    const messages = {
      initiated: `Blood transfer ${transfer.transferId} has been initiated from branch.`,
      accepted: `Blood transfer ${transfer.transferId} has been accepted.`,
      rejected: `Blood transfer ${transfer.transferId} has been rejected.`,
      completed: `Blood transfer ${transfer.transferId} has been completed.`,
    };
    await this.notifyAdmins({
      title: `Transfer ${event}: ${transfer.transferId}`,
      message: messages[event] || `Transfer ${transfer.transferId} status updated.`,
      type: 'info',
      category: 'transfer',
      referenceType: 'BloodTransfer',
      referenceId: transfer._id,
    });
  }
}

export default NotificationService;
