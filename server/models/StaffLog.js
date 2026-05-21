import mongoose from 'mongoose';

const staffLogSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    operationType: {
      type: String,
      required: true,
    },
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    updatedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: String,
    userAgent: String,
    description: String,
  },
  { timestamps: true }
);

staffLogSchema.index({ staffId: 1 });
staffLogSchema.index({ branchId: 1 });
staffLogSchema.index({ createdAt: -1 });

const StaffLog = mongoose.model('StaffLog', staffLogSchema);
export default StaffLog;
