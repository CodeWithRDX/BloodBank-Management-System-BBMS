import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
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
      required: [true, 'Phone is required'],
    },
    staffRole: {
      type: String,
      enum: ['inventory_staff', 'camp_staff', 'lab_staff', 'branch_manager', 'reception_staff'],
      required: [true, 'Staff role is required'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch assignment is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  },
  { timestamps: true }
);

// Indexes
staffSchema.index({ branchId: 1 });
staffSchema.index({ staffRole: 1 });
staffSchema.index({ isActive: 1 });

// Auto-generate IDs
staffSchema.pre('save', async function (next) {
  if (!this.staffId) {
    const count = await mongoose.model('Staff').countDocuments();
    this.staffId = `STF-${String(count + 1).padStart(5, '0')}`;
  }
  if (!this.employeeId) {
    this.employeeId = `EMP-${Date.now()}`;
  }
  next();
});

const Staff = mongoose.model('Staff', staffSchema);
export default Staff;
