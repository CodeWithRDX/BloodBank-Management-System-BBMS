import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getTelegramConnectLink,
  disconnectTelegram,
  getWhatsAppConnectLink,
  simulateWhatsAppWebhook,
  disconnectWhatsApp,
  toggleAIPerferences,
  simulateTelegramWebhook,
  handleTelegramWebhook
} from '../controllers/communicationController.js';

const router = express.Router();

// Telegram
router.get('/telegram/token', protect, getTelegramConnectLink);
router.post('/telegram/disconnect', protect, disconnectTelegram);
router.post('/telegram/simulate', protect, simulateTelegramWebhook);
router.post('/telegram/webhook', handleTelegramWebhook);

// WhatsApp
router.get('/whatsapp/token', protect, getWhatsAppConnectLink);
router.post('/whatsapp/simulate', protect, simulateWhatsAppWebhook);
router.post('/whatsapp/disconnect', protect, disconnectWhatsApp);

// AI preferences toggle
router.post('/ai-toggle', protect, toggleAIPerferences);

export default router;
