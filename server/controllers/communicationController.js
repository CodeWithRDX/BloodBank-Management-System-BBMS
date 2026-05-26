import User from '../models/User.js';
import crypto from 'crypto';
import { sendWhatsAppMessage } from '../services/externalNotificationService.js';
import { linkTelegramAccount, handleTelegramUpdate } from '../services/telegramBotService.js';
import { linkWhatsAppAccount } from '../services/whatsappBotService.js';

/**
 * Generate a secure Telegram connect token and deep-link
 */
export const getTelegramConnectLink = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Generate 16-hex character token
    const token = crypto.randomBytes(8).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.telegramConnectToken = token;
    user.telegramConnectTokenExpires = expires;
    await user.save({ validateBeforeSave: false });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'SmartBBMSBot';
    const link = `https://t.me/${botUsername}?start=${token}`;

    res.status(200).json({
      success: true,
      token,
      botUsername,
      link
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect Telegram notifications
 */
export const disconnectTelegram = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.notifications.telegram.enabled = false;
    user.notifications.telegram.chatId = '';
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Telegram integration disconnected successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a secure WhatsApp connect token and deep-link
 */
export const getWhatsAppConnectLink = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Generate 16-hex character token
    const token = crypto.randomBytes(8).toString('hex');
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.whatsappConnectToken = token;
    user.whatsappConnectTokenExpires = expires;
    await user.save({ validateBeforeSave: false });

    const botPhone = (process.env.TWILIO_WHATSAPP_FROM || '14155238886').replace(/[^\d+]/g, '');
    const link = `https://wa.me/${botPhone.replace(/^\+/, '')}?text=start%20${token}`;

    res.status(200).json({
      success: true,
      token,
      botPhone,
      link
    });
  } catch (error) {
    next(error);
  }
};

/**
 * MOCK/SIMULATION ENDPOINT: Link WhatsApp account locally for tests
 */
export const simulateWhatsAppWebhook = async (req, res, next) => {
  try {
    const { token, phone } = req.body;
    if (!token || !phone) return res.status(400).json({ success: false, message: 'Token and Phone are required' });

    const linked = await linkWhatsAppAccount(token, phone);
    if (linked) {
      res.status(200).json({ success: true, message: 'Simulated connection successful! Account linked.' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to simulate connection. Token invalid or expired.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Disconnect WhatsApp notifications
 */
export const disconnectWhatsApp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.notifications.whatsapp.enabled = false;
    user.notifications.whatsapp.phone = '';
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'WhatsApp alerts disconnected successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle user preferences for AI assistant and floating widget
 */
export const toggleAIPerferences = async (req, res, next) => {
  try {
    const { aiAssistantEnabled, floatingBotWidgetEnabled } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (aiAssistantEnabled !== undefined) {
      user.aiAssistantEnabled = aiAssistantEnabled;
    }
    if (floatingBotWidgetEnabled !== undefined) {
      user.floatingBotWidgetEnabled = floatingBotWidgetEnabled;
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: {
        aiAssistantEnabled: user.aiAssistantEnabled,
        floatingBotWidgetEnabled: user.floatingBotWidgetEnabled
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * MOCK/SIMULATION ENDPOINT: Link Telegram account locally for tests
 */
export const simulateTelegramWebhook = async (req, res, next) => {
  try {
    const { token, chatId } = req.body;
    if (!token || !chatId) return res.status(400).json({ success: false, message: 'Token and Chat ID are required' });

    const linked = await linkTelegramAccount(token, chatId);
    if (linked) {
      res.status(200).json({ success: true, message: 'Simulated connection successful! Account linked.' });
    } else {
      res.status(400).json({ success: false, message: 'Failed to simulate connection. Token invalid or expired.' });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Event-driven Telegram webhook listener to receive real updates from Telegram
 */
export const handleTelegramWebhook = async (req, res, next) => {
  try {
    const update = req.body;
    if (update) {
      console.log(`🤖 [TELEGRAM BOT WEBHOOK] Received webhook event:`, JSON.stringify(update));
      await handleTelegramUpdate(update);
    }
    // Telegram expects a 200 OK response immediately
    res.status(200).json({ success: true });
  } catch (error) {
    // Log the error but don't fail the response to Telegram to prevent retry loops
    console.error('⚠️ [TELEGRAM BOT WEBHOOK ERROR]:', error.message);
    res.status(200).json({ success: true, error: error.message });
  }
};
