import mongoose from 'mongoose';

const bloodInventorySchema = new mongoose.Schema(
  {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: [true, 'Blood group is required'],
    },
    component: {
      type: String,
      enum: ['whole_blood', 'plasma', 'platelets', 'red_cells'],
      default: 'whole_blood',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    unitNumber: {
      type: String,
      unique: true,
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
    },
    // Multi-branch support (optional — null = main/default branch)
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    collectedDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'issued', 'expired', 'discarded', 'transferred'],
      default: 'available',
    },
    storageLocation: {
      type: String,
      default: 'Main Storage',
    },
    // For tracking transfer history
    transferHistory: [
      {
        fromBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
        toBranch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
        transferredAt: Date,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
bloodInventorySchema.index({ bloodGroup: 1, status: 1 });
bloodInventorySchema.index({ branchId: 1, bloodGroup: 1, status: 1 });
bloodInventorySchema.index({ expiryDate: 1 });

// Auto-generate unit number
bloodInventorySchema.pre('save', async function (next) {
  if (!this.unitNumber) {
    const count = await mongoose.model('BloodInventory').countDocuments();
    this.unitNumber = `BU-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual: check if expired
bloodInventorySchema.virtual('isExpired').get(function () {
  return this.expiryDate < new Date();
});

const BloodInventory = mongoose.model('BloodInventory', bloodInventorySchema);
export default BloodInventory;
