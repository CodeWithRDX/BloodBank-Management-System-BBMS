import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    fileId: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['avatar', 'medical_report', 'government_id', 'other'],
      default: 'other',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    provider: {
      type: String,
      enum: ['imagekit', 'local'],
      default: 'local',
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for quick lookups by uploader and type
imageSchema.index({ uploadedBy: 1, fileType: 1 });

const Image = mongoose.model('Image', imageSchema);
export default Image;
