import BroadcastLog from '../models/BroadcastLog.js';
import Donor from '../models/Donor.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { sendWhatsAppMessage, sendTelegramMessage } from '../services/notificationChannels.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create Nodemailer transporter for broadcasts
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// @desc    Broadcast message to donors via multi-channel notification
// @route   POST /api/broadcasts
// @access  Private (Admin only)
export const createBroadcast = async (req, res, next) => {
  try {
    const { title, message, channels, filter } = req.body;

    if (!title || !message || !channels || !Array.isArray(channels) || channels.length === 0) {
      return res.status(400).json({ success: false, message: 'Title, message, and at least one channel are required' });
    }

    // Build donor search query based on filters
    const donorQuery = { status: 'active' };
    if (filter) {
      if (filter.bloodGroup) donorQuery.bloodGroup = filter.bloodGroup;
      if (filter.city) donorQuery['address.city'] = { $regex: new RegExp(filter.city, 'i') };
      if (filter.state) donorQuery['address.state'] = { $regex: new RegExp(filter.state, 'i') };
    }

    const donors = await Donor.find(donorQuery).populate('userId');
    if (donors.length === 0) {
      return res.status(400).json({ success: false, message: 'No active donors found matching the filters' });
    }

    let recipientsCount = donors.length;
    let emailSent = 0;
    let whatsappSent = 0;
    let telegramSent = 0;

    // Run broadcasts asynchronously to prevent blocking the response
    const runBroadcastTask = async () => {
      for (const donor of donors) {
        const email = donor.email || donor.userId?.email;
        const phone = donor.phone || donor.userId?.phone;

        // 1. Email Broadcast
        if (channels.includes('email') && email) {
          const htmlContent = `
            <div style="font-family: 'Space Grotesk', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #333; border-radius: 12px; background-color: #0f0f15; color: #f1f1f7; box-shadow: 0 0 20px rgba(239, 68, 68, 0.2);">
              <h2 style="color: #ef4444; text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-top: 0; font-weight: 800;">📢 SYSTEM BROADCAST ANNOUNCEMENT 📢</h2>
              <h3 style="color: #ffffff; font-weight: 700; margin-top: 20px;">${title}</h3>
              <p style="font-size: 15px; line-height: 1.6; color: #a1a1aa; white-space: pre-line;">${message}</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #ef4444; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);">Visit Dashboard</a>
              </div>
              <p style="color: #71717a; font-size: 11px; text-align: center; border-top: 1px solid #27272a; padding-top: 15px; margin-top: 30px;">You are receiving this because you are a registered donor on the BBMS platform. Thank you for saving lives.</p>
            </div>
          `;
          try {
            if (process.env.SMTP_USER && !process.env.SMTP_USER.includes('your_email')) {
              await transporter.sendMail({
                from: `"${process.env.FROM_NAME || 'BBMS'}" <${process.env.FROM_EMAIL || 'noreply@bbms.com'}>`,
                to: email,
                subject: `[BBMS Broadcast] ${title}`,
                html: htmlContent,
              });
            } else {
              console.log(`[MOCK BROADCAST EMAIL] Sent to ${email}: ${title}`);
            }
            emailSent++;
          } catch (err) {
            console.error(`Failed to send broadcast email to ${email}:`, err.message);
          }
        }

        // 2. WhatsApp Broadcast
        if (channels.includes('whatsapp') && phone) {
          try {
            await sendWhatsAppMessage(phone, `📢 *BBMS Broadcast: ${title}*\n\n${message}`);
            whatsappSent++;
          } catch (err) {
            console.error(`Failed to send broadcast WhatsApp to ${phone}:`, err.message);
          }
        }

        // 3. Telegram Broadcast
        if (channels.includes('telegram')) {
          // Send to simulated telegram chatId or log it
          try {
            const telegramChatId = donor.userId?.telegramChatId || `TG-${donor._id}`;
            await sendTelegramMessage(telegramChatId, `📢 *BBMS Broadcast: ${title}*\n\n${message}`);
            telegramSent++;
          } catch (err) {
            console.error(`Failed to send broadcast Telegram:`, err.message);
          }
        }
      }

      console.log(`[BROADCAST SUMMARY] Completed campaign "${title}". Recipients: ${recipientsCount}. Email sent: ${emailSent}. WhatsApp sent: ${whatsappSent}. Telegram sent: ${telegramSent}`);
    };

    // Trigger async task
    runBroadcastTask();

    // Create Broadcast Log
    const broadcastLog = await BroadcastLog.create({
      title,
      message,
      channels,
      recipientsCount,
      sentBy: req.user.id,
    });

    // Create Audit Log
    await AuditLog.create({
      actionType: 'broadcast_create',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'BroadcastLog',
      targetId: broadcastLog._id,
      newData: { title, channels, filter },
      ipAddress: req.clientIp || req.ip || '',
      description: `Broadcast campaign "${title}" sent via channels [${channels.join(', ')}]`,
    });

    res.status(201).json({
      success: true,
      message: `Broadcast campaign successfully initiated. Target recipients: ${recipientsCount}`,
      data: broadcastLog,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all broadcast logs
// @route   GET /api/broadcasts
// @access  Private (Admin only)
export const getBroadcasts = async (req, res, next) => {
  try {
    const logs = await BroadcastLog.find()
      .populate('sentBy', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};
