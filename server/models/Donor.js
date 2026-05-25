import mongoose from 'mongoose';

const donorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: [true, 'Gender is required'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [45, 'Minimum weight for donation is 45 kg'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    governmentId: {
      idType: {
        type: String,
        enum: ['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID'],
      },
      idNumber: {
        type: String,
        trim: true,
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relation: {
        type: String,
        trim: true,
      },
    },
    medicalHistory: {
      type: String,
      default: '',
    },

    // Whole blood donation tracking
    lastDonationDate: { type: Date },
    // Platelet donation tracking (separate 14-day cooldown)
    lastPlateletDonationDate: { type: Date },
    // Plasma donation tracking
    lastPlasmaDonationDate: { type: Date },

    totalDonations: {
      type: Number,
      default: 0,
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    // Eligibility status per component
    eligibilityStatus: {
      type: String,
      enum: ['eligible', 'cooling_period', 'temporarily_blocked', 'permanently_restricted'],
      default: 'eligible',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Indexes
donorSchema.index({ bloodGroup: 1 });
donorSchema.index({ status: 1 });

// Enhanced eligibility check — supports component-based cooldowns
donorSchema.methods.checkEligibility = function (component = 'whole_blood') {
  const now = Date.now();

  if (component === 'platelets') {
    if (!this.lastPlateletDonationDate) return { eligible: true, daysRemaining: 0 };
    const days = Math.floor((now - this.lastPlateletDonationDate.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = 14 - days;
    return { eligible: days >= 14, daysRemaining: remaining > 0 ? remaining : 0 };
  }

  if (component === 'plasma') {
    if (!this.lastPlasmaDonationDate) return { eligible: true, daysRemaining: 0 };
    const days = Math.floor((now - this.lastPlasmaDonationDate.getTime()) / (1000 * 60 * 60 * 24));
    const remaining = 28 - days;
    return { eligible: days >= 28, daysRemaining: remaining > 0 ? remaining : 0 };
  }

  // Default: whole blood — 90 days
  if (!this.lastDonationDate) return { eligible: true, daysRemaining: 0 };
  const days = Math.floor((now - this.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
  const remaining = 90 - days;
  return { eligible: days >= 90, daysRemaining: remaining > 0 ? remaining : 0 };
};

// Update last donation date based on component
donorSchema.methods.recordDonation = function (component = 'whole_blood') {
  const now = new Date();
  if (component === 'platelets') {
    this.lastPlateletDonationDate = now;
  } else if (component === 'plasma') {
    this.lastPlasmaDonationDate = now;
  } else {
    this.lastDonationDate = now;
  }
  this.totalDonations += 1;
  this.eligibilityStatus = 'cooling_period';
};

const Donor = mongoose.model('Donor', donorSchema);
export default Donor;
