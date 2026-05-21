import mongoose from 'mongoose';

const campRegistrationSchema = new mongoose.Schema(
  {
    registrationId: {
      type: String,
      unique: true,
    },
    campId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Camp',
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending Approval', 'Approved', 'Rejected', 'Attended', 'Missed'],
      default: 'Pending Approval',
    },
    isEligible: {
      type: Boolean,
      default: true,
    },
    // Set when marked as attended/donated
    attendanceTime: Date,
    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
    },
    notes: String,
  },
  { timestamps: true }
);

campRegistrationSchema.index({ campId: 1 });
campRegistrationSchema.index({ donorId: 1 });
campRegistrationSchema.index({ status: 1 });
// Prevent duplicate registration
campRegistrationSchema.index({ campId: 1, donorId: 1 }, { unique: true });

campRegistrationSchema.pre('save', async function (next) {
  if (!this.registrationId) {
    const count = await mongoose.model('CampRegistration').countDocuments();
    this.registrationId = `CREG-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const CampRegistration = mongoose.model('CampRegistration', campRegistrationSchema);
export default CampRegistration;
