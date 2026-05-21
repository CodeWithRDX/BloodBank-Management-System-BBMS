import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
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
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
    },
    type: {
      type: String,
      enum: ['government', 'private', 'charitable'],
      default: 'private',
    },
    contactPerson: {
      name: String,
      phone: String,
      designation: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
hospitalSchema.index({ status: 1 });

const Hospital = mongoose.model('Hospital', hospitalSchema);
export default Hospital;
