import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    // null = global/broadcast notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Branch-specific notification (null = all branches)
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      default: null,
    },
    // If true, shown to all users (system broadcast)
    isGlobal: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'emergency'],
      default: 'info',
    },
    category: {
      type: String,
      enum: [
        'appointment',
        'request',
        'donation',
        'inventory',
        'system',
        'general',
        'camp',
        'branch',
        'transfer',
        'emergency',
        'low_stock',
      ],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: String,
    // Reference to source document
    referenceType: String,
    referenceId: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true }
);

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ branchId: 1, isRead: 1 });
notificationSchema.index({ isGlobal: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
