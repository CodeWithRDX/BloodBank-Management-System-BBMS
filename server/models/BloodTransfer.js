import mongoose from 'mongoose';

const bloodTransferSchema = new mongoose.Schema(
  {
    transferId: {
      type: String,
      unique: true,
    },
    fromBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Source branch is required'],
    },
    toBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Destination branch is required'],
    },
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
      min: [1, 'Minimum 1 unit'],
    },
    // Inventory units being transferred
    inventoryItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodInventory',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_transit', 'completed', 'cancelled'],
      default: 'pending',
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: String,
    rejectionReason: String,
    requestedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    completedAt: Date,
    notes: String,
    // Linked blood request that triggered this transfer
    bloodRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
    },
  },
  { timestamps: true }
);

bloodTransferSchema.index({ fromBranch: 1 });
bloodTransferSchema.index({ toBranch: 1 });
bloodTransferSchema.index({ status: 1 });
bloodTransferSchema.index({ bloodGroup: 1 });

bloodTransferSchema.pre('save', async function (next) {
  if (!this.transferId) {
    const count = await mongoose.model('BloodTransfer').countDocuments();
    this.transferId = `TRF-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const BloodTransfer = mongoose.model('BloodTransfer', bloodTransferSchema);
export default BloodTransfer;
