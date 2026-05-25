// Middleware to recursively sanitize all string inputs against HTML/XSS injection
export const sanitizeInputs = (req, res, next) => {
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Escape critical characters to prevent XSS injections while preserving basic text
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        value[key] = sanitizeValue(value[key]);
      }
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query);
  }
  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};
