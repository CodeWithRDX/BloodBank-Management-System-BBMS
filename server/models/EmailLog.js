import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      unique: true,
    },
    recipient: {
      type: String,
      required: [true, 'Recipient email is required'],
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
    },
    body: {
      type: String,
      required: [true, 'Email body is required'],
    },
    triggerAction: {
      type: String,
      required: [true, 'Trigger action type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    errorMsg: {
      type: String,
    },
    retryAttempts: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes for performance
emailLogSchema.index({ recipient: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ createdAt: -1 });

emailLogSchema.pre('save', async function (next) {
  if (!this.logId) {
    const count = await mongoose.model('EmailLog').countDocuments();
    this.logId = `EMAIL-${String(count + 1).padStart(7, '0')}`;
  }
  next();
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
export default EmailLog;
