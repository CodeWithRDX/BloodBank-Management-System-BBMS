import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    branchId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: 'India' },
      zipCode: String,
    },
    // GeoJSON for geo-queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    // Human-readable lat/lng
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },

    // Admin who approved/rejected
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectionReason: String,

    // Branch admin user
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // License documents (file paths)
    documents: [String],

    operatingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '20:00' },
    },

    isActive: { type: Boolean, default: true },
    description: String,
  },
  { timestamps: true }
);

// Geo index for nearby queries
branchSchema.index({ location: '2dsphere' });
branchSchema.index({ status: 1 });

// Sync coordinates to GeoJSON location
branchSchema.pre('save', function (next) {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  }
  next();
});

// Auto-generate branch ID
branchSchema.pre('save', async function (next) {
  if (!this.branchId) {
    const count = await mongoose.model('Branch').countDocuments();
    this.branchId = `BR-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
