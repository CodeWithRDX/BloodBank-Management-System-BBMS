import mongoose from 'mongoose';

const testReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    testedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    hiv: {
      type: Boolean,
      default: false,
    },
    hepatitisB: {
      type: Boolean,
      default: false,
    },
    hepatitisC: {
      type: Boolean,
      default: false,
    },
    malaria: {
      type: Boolean,
      default: false,
    },
    syphilis: {
      type: Boolean,
      default: false,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    hemoglobin: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'safe', 'unsafe'],
      default: 'pending',
    },
    remarks: String,
    testedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
testReportSchema.index({ donationId: 1 });
testReportSchema.index({ status: 1 });

// Auto-generate report ID
testReportSchema.pre('save', async function (next) {
  if (!this.reportId) {
    const count = await mongoose.model('TestReport').countDocuments();
    this.reportId = `TR-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Determine safety based on test results
testReportSchema.methods.determineSafety = function () {
  if (this.hiv || this.hepatitisB || this.hepatitisC || this.malaria || this.syphilis) {
    this.status = 'unsafe';
  } else {
    this.status = 'safe';
  }
  return this.status;
};

const TestReport = mongoose.model('TestReport', testReportSchema);
export default TestReport;
