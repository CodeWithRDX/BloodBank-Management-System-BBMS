import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.oauthProvider || this.oauthProvider === 'local';
        },
        'Please provide a password',
      ],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'donor', 'hospital', 'staff', 'branch_admin', 'support_agent'],
      default: 'donor',
    },
    // Staff-specific fields
    staffRole: {
      type: String,
      enum: ['inventory_staff', 'camp_staff', 'lab_staff', 'branch_manager', 'reception_staff', null],
      default: null,
    },
    // Branch association for staff/branch_admin
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    phone: {
      type: String,
      maxlength: [15, 'Phone number cannot exceed 15 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorExpiry: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    oauthProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },
    oauthId: {
      type: String,
      default: null,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // For audit logging
    lastLoginAt: Date,
    lastLoginIp: String,

  },
  { timestamps: true }
);

// Role index for faster role-based queries
userSchema.index({ role: 1 });
userSchema.index({ branchId: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role, branchId: this.branchId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

const User = mongoose.model('User', userSchema);
export default User;
