import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      unique: true,
    },
    actionType: {
      type: String,
      enum: [
        'user_login',
        'user_logout',
        'user_register',
        'password_reset',
        'profile_update',
        'blood_request_create',
        'blood_request_approve',
        'blood_request_reject',
        'blood_request_cancel',
        'donation_create',
        'donation_update',
        'inventory_add',
        'inventory_update',
        'inventory_delete',
        'branch_register',
        'branch_approve',
        'branch_reject',
        'branch_suspend',
        'staff_add',
        'staff_remove',
        'staff_update',
        'camp_create',
        'camp_update',
        'camp_cancel',
        'camp_register',
        'transfer_initiate',
        'transfer_accept',
        'transfer_reject',
        'admin_action',
      ],
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    actorName: String,
    actorRole: String,
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    targetType: String, // e.g. 'User', 'Branch', 'BloodRequest'
    targetId: mongoose.Schema.Types.ObjectId,
    oldData: mongoose.Schema.Types.Mixed,
    newData: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String,
    description: String,
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
  },
  { timestamps: true }
);

auditLogSchema.index({ actor: 1 });
auditLogSchema.index({ actionType: 1 });
auditLogSchema.index({ branchId: 1 });
auditLogSchema.index({ createdAt: -1 });

auditLogSchema.pre('save', async function (next) {
  if (!this.logId) {
    const count = await mongoose.model('AuditLog').countDocuments();
    this.logId = `AUDIT-${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
