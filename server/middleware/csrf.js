import crypto from 'crypto';

// Helper to manually parse cookies from headers without requiring cookie-parser
export const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, cookie) => {
    const parts = cookie.trim().split('=');
    if (parts.length >= 2) {
      const key = parts[0];
      const val = parts.slice(1).join('=');
      acc[key] = decodeURIComponent(val);
    }
    return acc;
  }, {});
};

// Stateless Double Submit Cookie CSRF protection middleware
export const csrfProtection = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie);
  
  // 1. Skip check for safe methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    if (!cookies.csrfToken) {
      const token = crypto.randomBytes(24).toString('hex');
      // Set non-HttpOnly cookie so React client can read it
      res.setHeader('Set-Cookie', `csrfToken=${token}; Path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
    }
    return next();
  }

  // 2. Validate token on state-changing requests
  const cookieToken = cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch or missing. Action denied.',
    });
  }

  next();
};
