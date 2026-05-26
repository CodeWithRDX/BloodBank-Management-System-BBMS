import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Allow guest users
    },
    sessionId: {
      type: String,
      required: true,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ['user', 'ai', 'system', 'agent'],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        readAt: {
          type: Date,
          default: null,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['ai', 'agent', 'closed'],
      default: 'ai',
    },
    resolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

chatLogSchema.index({ sessionId: 1 });
chatLogSchema.index({ userId: 1 });

const ChatLog = mongoose.model('ChatLog', chatLogSchema);
export default ChatLog;
