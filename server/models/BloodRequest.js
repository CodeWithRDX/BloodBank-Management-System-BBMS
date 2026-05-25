import mongoose from 'mongoose';

const bloodRequestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    // Target branch (geo-resolved or user-selected)
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
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
      min: [1, 'Minimum 1 unit required'],
    },
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'emergency'],
      default: 'normal',
    },
    reason: {
      type: String,
      required: [true, 'Reason for request is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled', 'fulfilled'],
      default: 'pending',
    },
    // Geo-location of requester for nearby branch detection
    requestLocation: {
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
    requestLatitude: Number,
    requestLongitude: Number,

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: Date,
    rejectionReason: String,
    fulfilledAt: Date,
    // Inventory item issued
    issuedInventoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodInventory',
    },
    medicalReportUrl: {
      type: String,
      default: null,
    },
    governmentIdUrl: {
      type: String,
      default: null,
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    notes: String,

  },
  { timestamps: true }
);

// Indexes
bloodRequestSchema.index({ status: 1 });
bloodRequestSchema.index({ bloodGroup: 1 });
bloodRequestSchema.index({ requestedBy: 1 });
bloodRequestSchema.index({ urgency: 1 });
bloodRequestSchema.index({ branchId: 1 });
bloodRequestSchema.index({ requestLocation: '2dsphere' });

// Auto-generate request ID
bloodRequestSchema.pre('save', async function (next) {
  if (!this.requestId) {
    const count = await mongoose.model('BloodRequest').countDocuments();
    this.requestId = `REQ-${String(count + 1).padStart(6, '0')}`;
  }
  // Sync geo fields
  if (this.requestLatitude && this.requestLongitude) {
    this.requestLocation = {
      type: 'Point',
      coordinates: [this.requestLongitude, this.requestLatitude],
    };
  }
  next();
});

const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
