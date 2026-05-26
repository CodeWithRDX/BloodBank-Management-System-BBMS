/**
 * Send notification message to a Telegram Chat ID
 * @param {string} chatId - Target Telegram Chat ID
 * @param {string} text - Message text (HTML parsed)
 * @returns {Promise<boolean>}
 */
export const sendTelegramMessage = async (chatId, text) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token || token.trim() === '' || token.includes('your_telegram_bot_token')) {
    console.log(`\n📢 [TELEGRAM BOT MOCK] ChatID: ${chatId}\nMessage: ${text.replace(/<[^>]*>/g, '')}\n`);
    return true;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.description || 'Failed to dispatch Telegram message');
    }
    return true;
  } catch (error) {
    console.error('Telegram dispatch failed:', error.message);
    return false;
  }
};

/**
 * Send notification message to a WhatsApp number via Twilio API
 * @param {string} phone - Target WhatsApp Phone Number (with country code)
 * @param {string} text - Plain text message body
 * @returns {Promise<boolean>}
 */
export const sendWhatsAppMessage = async (phone, text) => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (
    !sid || sid.trim() === '' || sid.includes('your_twilio_sid') ||
    !token || token.trim() === '' || token.includes('your_twilio_token') ||
    !from || from.trim() === ''
  ) {
    console.log(`\n📢 [WHATSAPP TWILIO MOCK] To: ${phone}\nMessage: ${text}\n`);
    return true;
  }

  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
    const cleanFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
    const cleanTo = `whatsapp:${formattedPhone}`;

    const authString = Buffer.from(`${sid}:${token}`).toString('base64');
    const params = new URLSearchParams();
    params.append('From', cleanFrom);
    params.append('To', cleanTo);
    params.append('Body', text);

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to dispatch WhatsApp message via Twilio');
    }
    return true;
  } catch (error) {
    console.error('WhatsApp Twilio dispatch failed:', error.message);
    return false;
  }
};
