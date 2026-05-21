import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    donationId: {
      type: String,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Minimum quantity is 1 unit'],
      default: 1,
    },
    donationDate: {
      type: Date,
      default: Date.now,
    },
    component: {
      type: String,
      enum: ['whole_blood', 'plasma', 'platelets', 'red_cells'],
      default: 'whole_blood',
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Multi-branch support
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    // Camp association
    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      default: null,
    },
    campRegistrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampRegistration',
      default: null,
    },
    // Link to created inventory record
    inventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory',
      default: null,
    },
    notes: String,
    status: {
      type: String,
      enum: ['collected', 'testing', 'approved', 'rejected', 'stored'],
      default: 'collected',
    },
  },
  { timestamps: true }
);

// Index
donationSchema.index({ donorId: 1 });
donationSchema.index({ donationDate: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ branchId: 1 });
donationSchema.index({ campId: 1 });

// Auto-generate donation ID
donationSchema.pre('save', async function (next) {
  if (!this.donationId) {
    const count = await mongoose.model('Donation').countDocuments();
    this.donationId = `DON-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
