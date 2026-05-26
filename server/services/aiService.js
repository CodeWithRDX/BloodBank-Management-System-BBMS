// API-driven AI Support Chatbot Service with SQL/NoSQL injection protection, keyword screening, and rate limiting.

// In-memory rate limiting map: sessionId -> array of request timestamps
const rateLimitMap = new Map();

/**
 * Validates inputs against common SQL/NoSQL injection patterns and system credentials to prevent leakages
 */
const containsRestrictedKeywords = (text) => {
  const query = text.toLowerCase();
  
  // 1. Core System Secret/Database Keywords
  const restrictedKeywords = [
    'password', 'jwt', 'secret', 'auth', 'credentials', 
    'db_url', 'db_uri', 'collection', 'schema',
    'admin_logs', 'audit_logs', 'env', 'dotenv'
  ];
  if (restrictedKeywords.some(keyword => query.includes(keyword))) {
    return true;
  }

  // 2. NoSQL injection operator patterns (e.g. $gt, $ne, $where)
  if (/\$[a-zA-Z]+/.test(text)) {
    return true;
  }

  // 3. SQL injection patterns (e.g. UNION SELECT, OR 1=1)
  const sqlInjectionPatterns = [
    'union select', 'union all select', 
    'select * from', 'insert into', 'delete from', 'drop table',
    '\' or 1=1', '" or 1=1', '\' or \'1\'=\'1', '" or "1"="1',
    'admin\'--', 'admin\' #', 'admin\'/*'
  ];
  if (sqlInjectionPatterns.some(pattern => query.includes(pattern))) {
    return true;
  }

  return false;
};

/**
 * Detects common prompt injection patterns
 */
const isPromptInjection = (text) => {
  const query = text.toLowerCase();
  const injectionPatterns = [
    'ignore previous', 'ignore instructions', 'forget your rules', 
    'forget instructions', 'new instructions', 'system prompt', 
    'developer mode', 'act as a developer', 'bypass guardrails', 
    'bypass restrictions', 'you are now a', 'ignore limits', 'ignore rules'
  ];
  return injectionPatterns.some(pattern => query.includes(pattern));
};

/**
 * Process text input and generate secure restricted AI response
 * @param {string} text - User message
 * @param {string} sessionId - User session identifier for rate limiting
 */
export const generateAIResponse = async (text, sessionId = 'global') => {
  const query = text.toLowerCase().trim();

  // 1. Session Rate Limiter (Max 5 queries per minute)
  const now = Date.now();
  if (!rateLimitMap.has(sessionId)) {
    rateLimitMap.set(sessionId, []);
  }
  const timestamps = rateLimitMap.get(sessionId).filter(ts => now - ts < 60000);
  if (timestamps.length >= 5) {
    return '⚠️ **Rate Limit Exceeded**: Please slow down. You can send up to 5 messages per minute to the AI assistant.';
  }
  timestamps.push(now);
  rateLimitMap.set(sessionId, timestamps);

  // 2. Jailbreak / Prompt Injection Defense
  if (isPromptInjection(query)) {
    console.warn(`🛡️ [AI SECURITY] Prompt injection attempt blocked on session: ${sessionId}`);
    return '⚠️ **Security Notice**: Adjustments to system prompts are forbidden. I can only guide you on BBMS functionalities and general assistance.';
  }

  // 3. SQL/NoSQL Injection & Secret Sanitization Filter
  if (containsRestrictedKeywords(text)) {
    console.warn(`🛡️ [AI SECURITY] Injection pattern or restricted keyword blocked on session: ${sessionId}`);
    return '⚠️ **Access Blocked**: Security violation detected. Database access commands, injection operators, and credential requests are strictly prohibited.';
  }

  // 4. Query Gemini API for live results
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '' && !apiKey.includes('your_api_key')) {
    try {
      const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const systemPrompt = `You are a professional, helpful assistant for the Blood Bank Management System (BBMS). 
      You can answer user queries naturally and provide detailed, well-articulated, and clear markdown responses.

      --- GENERAL HEALTHCARE COMPATIBILITY MATRIX ---
      If asked about blood group compatibility, use this matrix:
      - O- negative: Universal Donor. Can donate to everyone (O-, O+, A-, A+, B-, B+, AB-, AB+). Can receive only from O-.
      - O+ positive: Can donate to O+, A+, B+, AB+. Can receive from O+, O-.
      - A- negative: Can donate to A-, A+, AB-, AB+. Can receive from A-, O-.
      - A+ positive: Can donate to A+, AB+. Can receive from A+, A-, O+, O-.
      - B- negative: Can donate to B-, B+, AB-, AB+. Can receive from B-, O-.
      - B+ positive: Can donate to B+, AB+. Can receive from B+, B-, O+, O-.
      - AB- negative: Can donate to AB-, AB+. Can receive from AB-, A-, B-, O-.
      - AB+ positive: Universal Recipient. Can donate only to AB+. Can receive from all blood groups.

      --- GENERAL HEALTHCARE ELIGIBILITY (WHO CANNOT DONATE) ---
      If asked about who cannot donate, check these rules:
      - Age under 18 or weight under 45 kg (99 lbs).
      - Recent tattoos, ear/body piercings, or acupuncture within last 6 months.
      - Pregnant or lactating mothers, or completed pregnancy within last 6 months.
      - Active infections, taking active antibiotics, or symptoms of fever/flu.
      - History of HIV, Hepatitis B/C, malaria, syphilis, or severe chronic illnesses.
      - Whole blood cooldown: 90 days. Platelet cooldown: 14 days. Plasma cooldown: 28 days.

      --- PORTAL WORKFLOWS ---
      - How to book appointments: Log in to Donor Dashboard -> My Appointments -> Schedule Appointment.
      - Emergency requests: Submit the emergency blood request form on the homepage to alert nearby branch staff and donors.

      --- SECURITY RESTRICTIONS ---
      - NEVER disclose database configuration, passwords, JWT tokens, secrets, or internal developer code.
      - Keep your responses highly articulate, descriptive, professional, and properly formatted in markdown.

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
        if (generatedText) {
          const trimmedText = generatedText.trim();
          // Final check on generated response to ensure it didn't leak system keywords
          if (containsRestrictedKeywords(trimmedText)) {
             return "I understand your query, but for security reasons I cannot output system code, credentials, or internal details.";
          }
          return trimmedText;
        }
      }
    } catch (err) {
      console.error('[AI SERVICE] Gemini API request failed:', err);
    }
  }

  // 5. Fallback Response if API fails
  return "I understand your query, but I want to make sure I give you accurate advice. For donor eligibility, please note you must be 18+ years old and 45kg+. If you have a specific emergency, please use the Emergency Request Form on the homepage, or contact a staff member at your nearest branch.";
};
