// AI Support Chatbot Service supporting smart FAQ matching and native Gemini API fallback

const FAQ_RESPONSES = [
  {
    keywords: ['eligibility', 'eligible', 'criteria', 'who can donate', 'age', 'weight'],
    response: '🩸 **Donor Eligibility Criteria**:\n- **Age**: Minimum 18 years old mandatory.\n- **Weight**: Minimum 45 kg (99 lbs).\n- **Cooldowns**: Whole blood (90 days), Platelets (14 days), Plasma (28 days).\n- **Health**: No active infections, chronic diseases, or recent major surgeries.'
  },
  {
    keywords: ['appointment', 'schedule', 'book', 'how to donate', 'reserve'],
    response: '📅 **Booking an Appointment**:\n1. Log in to your **Donor Dashboard**.\n2. Go to **My Appointments** -> **Schedule Appointment**.\n3. Select a registered Branch center, select a date & slot, and confirm.'
  },
  {
    keywords: ['emergency', 'urgent', 'need blood', 'needy', 'patient'],
    response: '🚨 **Emergency Blood Requests**:\nIf you need blood immediately, go to the **Homepage** and fill out the **Emergency Blood Request Form**. This will upload your medical reports, notify admins, and broadcast emergency alerts to nearby eligible donors.'
  },
  {
    keywords: ['cooldown', 'cooldowns', 'days', 'wait', 'next donation'],
    response: '⏳ **Donation Cooldown Periods**:\n- **Whole Blood**: 90 days wait between donations.\n- **Platelets**: 14 days wait.\n- **Plasma**: 28 days wait.\nThis helps ensure donor safety and recovery!'
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings', 'help'],
    response: '👋 Hello! I am your Crimson Code AI assistant. I can help you check donor eligibility criteria, direct you on booking appointments, explain cooldown periods, or guide you on how to submit emergency blood requests. What can I do for you today?'
  }
];

export const generateAIResponse = async (text) => {
  const query = text.toLowerCase().trim();

  // 1. Try FAQ matching first
  for (const faq of FAQ_RESPONSES) {
    if (faq.keywords.some(keyword => query.includes(keyword))) {
      return faq.response;
    }
  }

  // 2. Fallback to Gemini API if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemPrompt = `You are a professional, helpful healthcare AI assistant for the Blood Bank Management System (BBMS). 
      Your purpose is to guide users on donor eligibility, scheduling donation appointments, general FAQs, and emergency requests.
      Keep your answers concise, reassuring, and highly accurate. 
      If a user asks about an underage (<18) or underweight (<45kg) case, clearly state that they are not eligible to donate.
      If it is a critical emergency, tell them to submit the Emergency Request Form on the homepage to alert nearby donors.
      
      User message: ${text}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) return generatedText.trim();
      }
    } catch (err) {
      console.error('[AI SERVICE] Gemini API request failed:', err);
    }
  }

  // 3. General Fallback Response
  return "I understand your query, but I want to make sure I give you accurate advice. For donor eligibility, please note you must be 18+ years old and 45kg+. If you have a specific emergency, please use the Emergency Request Form on the homepage, or contact a staff member at your nearest branch.";
};
