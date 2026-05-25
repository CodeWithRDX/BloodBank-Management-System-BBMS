// Mock communication service simulating SMS, WhatsApp, and Telegram deliveries for BBMS

export const sendWhatsAppMessage = async (phone, message) => {
  console.log(`[MOCK WHATSAPP] Sending message to ${phone}: ${message}`);
  // Log message content and status for audit logs
  return { success: true, channel: 'whatsapp', recipient: phone, timestamp: new Date() };
};

export const sendTelegramMessage = async (chatId, message) => {
  console.log(`[MOCK TELEGRAM] Sending message to ${chatId}: ${message}`);
  return { success: true, channel: 'telegram', recipient: chatId, timestamp: new Date() };
};

export const sendSMS = async (phone, message) => {
  console.log(`[MOCK SMS] Sending OTP SMS to ${phone}: ${message}`);
  return { success: true, channel: 'sms', recipient: phone, timestamp: new Date() };
};
