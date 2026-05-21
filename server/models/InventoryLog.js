import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      unique: true,
    },
    operationType: {
      type: String,
      enum: [
        'addition',      // blood added (donation)
        'subtraction',   // blood issued (request approved)
        'expiry',        // blood marked expired
        'transfer_out',  // blood sent to another branch
        'transfer_in',   // blood received from another branch
        'discard',       // blood discarded (contaminated, etc.)
        'adjustment',    // manual admin correction
        'reservation',   // blood reserved for request
        'release',       // reservation released
      ],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    component: {
      type: String,
      enum: ['whole_blood', 'plasma', 'platelets', 'red_cells'],
      default: 'whole_blood',
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    updatedQuantity: {
      type: Number,
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: String,
    // Reference to source document
    referenceType: {
      type: String,
      enum: ['Donation', 'BloodRequest', 'BloodTransfer', 'Manual'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    inventoryItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory',
    },
    notes: String,
  },
  { timestamps: true }
);

inventoryLogSchema.index({ branchId: 1, createdAt: -1 });
inventoryLogSchema.index({ bloodGroup: 1 });
inventoryLogSchema.index({ operationType: 1 });
inventoryLogSchema.index({ performedBy: 1 });

inventoryLogSchema.pre('save', async function (next) {
  if (!this.logId) {
    const count = await mongoose.model('InventoryLog').countDocuments();
    this.logId = `INVLOG-${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
export default InventoryLog;
