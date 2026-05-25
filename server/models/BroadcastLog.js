import mongoose from 'mongoose';

const broadcastLogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    channels: {
      type: [String], // ['email', 'whatsapp', 'telegram']
      required: true,
    },
    recipientsCount: {
      type: Number,
      default: 0,
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

broadcastLogSchema.index({ sentBy: 1 });

const BroadcastLog = mongoose.model('BroadcastLog', broadcastLogSchema);
export default BroadcastLog;
