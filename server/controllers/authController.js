import User from '../models/User.js';
import Donor from '../models/Donor.js';
import Hospital from '../models/Hospital.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Staff from '../models/Staff.js';
import StaffLog from '../models/StaffLog.js';
import { sendPasswordResetEmail, sendOtpEmail } from '../services/emailService.js';
import { parseCookies } from '../middleware/csrf.js';


// Helper to sign refresh token
const getSignedRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_SECRET || 'superrefreshsecret', {
    expiresIn: process.env.REFRESH_EXPIRE || '7d',
  });
};


// Helper: send token response
const sendTokenResponse = async (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const refreshToken = getSignedRefreshToken(user._id);

  // Hash and save refresh token to user DB
  user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await user.save({ validateBeforeSave: false });

  // Set HTTP-only secure cookie for refresh token
  const cookieOptions = [
    `refreshToken=${refreshToken}`,
    'HttpOnly',
    'Path=/api/auth', // only send to auth endpoints
    `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
    'SameSite=Lax',
  ];
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure');
  }
  res.setHeader('Set-Cookie', cookieOptions.join('; '));

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    },
  });
};


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, role: role || 'donor', phone });

    // If donor, create donor profile
    if (user.role === 'donor') {
      await Donor.create({
        userId: user._id,
        fullName: name,
        email,
        phone: phone || '',
        gender: req.body.gender || 'male',
        bloodGroup: req.body.bloodGroup || 'O+',
        dateOfBirth: req.body.dateOfBirth || new Date('2000-01-01'),
        weight: req.body.weight || 50,
      });
    }

    // If hospital, create hospital profile
    if (user.role === 'hospital') {
      await Hospital.create({
        userId: user._id,
        name: req.body.hospitalName || name,
        email,
        phone: phone || '',
        registrationNumber: req.body.registrationNumber || `HOS-${Date.now()}`,
        type: req.body.hospitalType || 'private',
      });
    }

    await sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    // 2FA Verification check - Mandatory for Admins, Staff, and Branch Admins, optional for Donors
    const is2faRequired = user.isTwoFactorEnabled || ['admin', 'staff', 'branch_admin'].includes(user.role);
    if (is2faRequired) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

      user.twoFactorSecret = otpHash;
      user.twoFactorExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
      await user.save({ validateBeforeSave: false });

      // Send OTP via Email
      try {
        await sendOtpEmail(user.email, otp, user.name);
      } catch (err) {
        console.error('[2FA] Failed to send OTP email:', err);
      }


      // Generate a short-lived temp token containing the user ID
      const tempToken = jwt.sign({ id: user._id, is2faTemp: true }, process.env.JWT_SECRET, {
        expiresIn: '5m',
      });

      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        tempToken,
        message: 'A 2FA verification code has been sent to your email and phone.',
      });
    }

    if (user.role === 'staff' || user.role === 'branch_admin') {
      const staffProfile = await Staff.findOne({ userId: user._id });
      if (staffProfile) {
        await StaffLog.create({
          staffId: staffProfile._id,
          branchId: staffProfile.branchId,
          operationType: 'login',
          description: `Staff member logged in`,
          ipAddress: req.clientIp || req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        });
      }
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(
      (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you requested a password reset.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    try {
      await sendPasswordResetEmail(user, resetUrl);
      res.status(200).json({ success: true, message: 'Reset email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  try {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'branch_admin')) {
      const staffProfile = await Staff.findOne({ userId: req.user.id });
      if (staffProfile) {
        await StaffLog.create({
          staffId: staffProfile._id,
          branchId: staffProfile.branchId,
          operationType: 'logout',
          description: `Staff member logged out`,
          ipAddress: req.clientIp || req.ip || '',
          userAgent: req.headers['user-agent'] || '',
        });
      }
    }

    // Clear refresh token from DB and clear cookie
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }

    res.setHeader('Set-Cookie', 'refreshToken=; Path=/api/auth; HttpOnly; Max-Age=0; SameSite=Lax');
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 2FA OTP
// @route   POST /api/auth/verify-2fa
// @access  Public
export const verify2FA = async (req, res, next) => {
  try {
    const { otp, tempToken, code } = req.body;
    const actualOtp = otp || code;
    if (!actualOtp || !tempToken) {
      return res.status(400).json({ success: false, message: 'OTP and temporary token are required' });
    }

    // Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired temporary session' });
    }

    if (!decoded.is2faTemp) {
      return res.status(401).json({ success: false, message: 'Invalid temporary session type' });
    }

    const user = await User.findById(decoded.id).select('+twoFactorSecret +twoFactorExpiry');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.twoFactorSecret || !user.twoFactorExpiry) {
      return res.status(400).json({ success: false, message: '2FA session not active or expired' });
    }

    if (Date.now() > user.twoFactorExpiry.getTime()) {
      return res.status(400).json({ success: false, message: 'OTP code has expired' });
    }

    const otpHash = crypto.createHash('sha256').update(actualOtp).digest('hex');
    if (otpHash !== user.twoFactorSecret) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    // Clear 2FA properties
    user.twoFactorSecret = undefined;
    user.twoFactorExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    // Auditing staff logins after 2FA validation
    if (user.role === 'staff' || user.role === 'branch_admin') {
      const staffProfile = await Staff.findOne({ userId: user._id });
      if (staffProfile) {
        await StaffLog.create({
          staffId: staffProfile._id,
          branchId: staffProfile.branchId,
          operationType: 'login',
          description: `Staff member logged in (2FA Verified)`,
          ipAddress: req.clientIp || req.socket?.remoteAddress || '',
          userAgent: req.headers['user-agent'] || '',
        });
      }
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh JWT Access Token
// @route   POST /api/auth/refresh
// @access  Public
export const refresh = async (req, res, next) => {
  try {
    const cookies = req.headers.cookie ? parseCookies(req.headers.cookie) : {};
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findOne({ refreshToken: hashedToken });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token session' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || 'superrefreshsecret');
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Refresh token expired or corrupted' });
    }

    if (decoded.id !== user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Token ownership mismatch' });
    }

    const token = user.getSignedJwtToken();
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    OAuth Google login/signup
// @route   POST /api/auth/oauth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Google ID token is required' });
    }

    // Verify token with google api
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!response.ok) {
      return res.status(400).json({ success: false, message: 'Failed to verify Google ID token' });
    }
    const profile = await response.json();

    if (!profile.email) {
      return res.status(400).json({ success: false, message: 'Google account does not expose email' });
    }

    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = await User.create({
        name: profile.name || 'Google User',
        email: profile.email,
        role: 'donor',
        oauthProvider: 'google',
        oauthId: profile.sub,
        phone: '',
        isActive: true,
      });

      await Donor.create({
        userId: user._id,
        fullName: user.name,
        email: user.email,
        phone: '',
        gender: 'male',
        bloodGroup: 'O+',
        dateOfBirth: new Date('2000-01-01'),
        weight: 50,
      });
    } else {
      if (user.oauthProvider === 'local') {
        user.oauthProvider = 'google';
        user.oauthId = profile.sub;
        await user.save({ validateBeforeSave: false });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    OAuth GitHub login/signup
// @route   POST /api/auth/oauth/github
// @access  Public
export const githubLogin = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'GitHub authorization code is required' });
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(400).json({ success: false, message: 'Failed to retrieve GitHub access token' });
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = await userResponse.json();

    let email = profile.email;
    if (!email) {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const emails = await emailResponse.json();
      if (emails && emails.length > 0) {
        const primaryEmail = emails.find((e) => e.primary);
        email = primaryEmail ? primaryEmail.email : emails[0].email;
      }
    }

    if (!email) {
      return res.status(400).json({ success: false, message: 'GitHub account does not expose a valid email address' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.login || 'GitHub User',
        email,
        role: 'donor',
        oauthProvider: 'github',
        oauthId: profile.id.toString(),
        phone: '',
        isActive: true,
      });

      await Donor.create({
        userId: user._id,
        fullName: user.name,
        email: user.email,
        phone: '',
        gender: 'male',
        bloodGroup: 'O+',
        dateOfBirth: new Date('2000-01-01'),
        weight: 50,
      });
    } else {
      if (user.oauthProvider === 'local') {
        user.oauthProvider = 'github';
        user.oauthId = profile.id.toString();
        await user.save({ validateBeforeSave: false });
      }
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    await sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

