import User from '../models/User.js';
import { sendWhatsAppMessage } from './externalNotificationService.js';
import { getIO } from '../utils/socketManager.js';

/**
 * Handles incoming simulated WhatsApp bot messages via Socket.IO
 */
export const registerWhatsAppSocketHandlers = (socket, io) => {
  socket.on('whatsapp:bot_message', async (data) => {
    try {
      const { text, phone } = data;
      if (!text || !phone) return;
      console.log(`💬 [WHATSAPP MOCK BOT] Socket message received: "${text}" from Phone: ${phone}`);
      
      // Parse the connection token: expected command is "start <token>" or "/start <token>"
      const textTrim = text.trim();
      if (textTrim.startsWith('start') || textTrim.startsWith('/start')) {
        const parts = textTrim.split(' ');
        if (parts.length > 1) {
          const token = parts[1];
          await linkWhatsAppAccount(token, phone);
        } else {
          // General greeting fallback
          await sendWhatsAppMessage(phone, `👋 *Welcome to BBMS!* \n\nTo link your WhatsApp notifications, click the *Enable WhatsApp* button inside your profile settings on the BBMS portal.`);
        }
      }
    } catch (error) {
      console.error('⚠️ [WHATSAPP SOCKET ERROR]:', error.message);
    }
  });
};

/**
 * Logic to link a WhatsApp account based on a connect token
 */
export const linkWhatsAppAccount = async (token, phone) => {
  try {
    const user = await User.findOne({
      whatsappConnectToken: token,
      whatsappConnectTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      console.log(`💬 [WHATSAPP BOT] No user found for token: ${token} or token expired.`);
      await sendWhatsAppMessage(phone, `❌ *Connection Failed:* The link token is invalid or has expired. Please try connecting again from the BBMS portal.`);
      return false;
    }

    // Clean phone number (remove leading '+' if any, or normalize for Twilio)
    const cleanPhone = phone.replace(/^\+/, '').trim();

    // Link phone number and enable WhatsApp notifications
    user.notifications.whatsapp.phone = cleanPhone;
    user.notifications.whatsapp.enabled = true;
    user.whatsappConnectToken = null;
    user.whatsappConnectTokenExpires = null;
    await user.save();

    console.log(`💬 [WHATSAPP BOT] Successfully paired User: ${user.name} with WhatsApp phone: +${cleanPhone}`);

    // Send confirmation back to WhatsApp
    try {
      const welcomeMsg = `🎉 *BBMS Connected Successfully!*\n\nHi ${user.name}, your account is now successfully linked to the Blood Bank Management System (BBMS). You will receive all critical updates here!`;
      await sendWhatsAppMessage(cleanPhone, welcomeMsg);
    } catch (msgErr) {
      console.error('⚠️ Failed to send WhatsApp welcome confirmation message:', msgErr.message);
    }

    // Emit real-time Socket.IO event to user so the frontend settings refresh instantly
    try {
      const io = getIO();
      io.to(`room:user:${user._id}`).emit('whatsapp:connected', {
        enabled: true,
        phone: cleanPhone
      });
    } catch (socketErr) {
      console.error('Socket notification emit failed (WhatsApp pair):', socketErr.message);
    }

    return true;
  } catch (error) {
    console.error('💬 [WHATSAPP BOT] Account linkage failed:', error);
    return false;
  }
};
