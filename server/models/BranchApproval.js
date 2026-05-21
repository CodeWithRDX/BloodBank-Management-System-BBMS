import mongoose from 'mongoose';

const branchApprovalSchema = new mongoose.Schema(
  {
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: String,
    ipAddress: String,
  },
  { timestamps: true }
);

branchApprovalSchema.index({ branchId: 1 });
branchApprovalSchema.index({ performedBy: 1 });
branchApprovalSchema.index({ createdAt: -1 });

const BranchApproval = mongoose.model('BranchApproval', branchApprovalSchema);
export default BranchApproval;
