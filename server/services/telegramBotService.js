import User from '../models/User.js';
import { sendTelegramMessage } from './externalNotificationService.js';
import { getIO } from '../utils/socketManager.js';

let pollingInterval = null;
let lastUpdateId = 0;

/**
 * Initializes the Telegram Bot service in event-driven webhook/socket mode
 */
export const startTelegramBot = () => {
  console.log(`🤖 [TELEGRAM BOT] Initialized in event-driven mode. Long poller disabled. Webhooks & Socket.IO active.`);
};

/**
 * Stops the Telegram Bot service (no-op now)
 */
export const stopTelegramBot = () => {
  console.log(`🤖 [TELEGRAM BOT] Stopped service.`);
};

/**
 * Socket.IO handler to process incoming simulated Telegram bot messages
 */
export const registerTelegramSocketHandlers = (socket, io) => {
  socket.on('telegram:bot_message', async (data) => {
    try {
      const { text, chatId } = data;
      if (!text || !chatId) return;
      console.log(`🤖 [TELEGRAM MOCK BOT] Socket message received: "${text}" from Chat ID: ${chatId}`);
      await handleTelegramUpdate({
        update_id: Date.now(),
        message: {
          chat: { id: chatId },
          text: text
        }
      });
    } catch (error) {
      console.error('⚠️ [TELEGRAM SOCKET ERROR]:', error.message);
    }
  });
};

/**
 * Handles incoming bot updates (webhook or Socket.IO events)
 */
export const handleTelegramUpdate = async (update) => {
  if (!update.message || !update.message.text) return;

  const chatId = update.message.chat.id.toString();
  const text = update.message.text.trim();

  // Check for start command with parameter: /start <token>
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    if (parts.length > 1) {
      const token = parts[1];
      await linkTelegramAccount(token, chatId);
    } else {
      // General greeting
      await sendTelegramMessage(chatId, `👋 <b>Welcome to BBMS!</b>\n\nTo link your account, please click the <b>Enable Telegram Notifications</b> button inside your profile settings on the BBMS portal.`);
    }
  }
};

/**
 * Logic to link a Telegram account based on a connect token
 */
export const linkTelegramAccount = async (token, chatId) => {
  try {
    const user = await User.findOne({
      telegramConnectToken: token,
      telegramConnectTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      console.log(`🤖 [TELEGRAM BOT] No user found for token: ${token} or token expired.`);
      await sendTelegramMessage(chatId, `❌ <b>Connection Failed:</b> The link token is invalid or has expired. Please try connecting again from the BBMS portal.`);
      return false;
    }

    // Link the chat ID and enable telegram notifications
    user.notifications.telegram.chatId = chatId;
    user.notifications.telegram.enabled = true;
    user.telegramConnectToken = null;
    user.telegramConnectTokenExpires = null;
    await user.save();

    console.log(`🤖 [TELEGRAM BOT] Successfully paired User: ${user.name} with Telegram Chat ID: ${chatId}`);

    // Send confirmation back to Telegram
    try {
      const welcomeMsg = `🎉 <b>BBMS Connected Successfully!</b>\n\nHi ${user.name}, your account is now successfully linked to the Blood Bank Management System (BBMS). You will receive all critical updates here!`;
      await sendTelegramMessage(chatId, welcomeMsg);
    } catch (msgErr) {
      console.error('⚠️ Failed to send Telegram welcome confirmation message:', msgErr.message);
    }

    // Emit real-time Socket.IO event to user so the frontend settings refresh instantly
    try {
      const io = getIO();
      io.to(`room:user:${user._id}`).emit('telegram:connected', {
        enabled: true,
        chatId: chatId
      });
    } catch (socketErr) {
      console.error('Socket notification emit failed (Telegram pair):', socketErr.message);
    }

    return true;
  } catch (error) {
    console.error('🤖 [TELEGRAM BOT] Account linkage failed:', error);
    return false;
  }
};
