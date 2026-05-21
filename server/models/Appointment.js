import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
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
    date: {
      type: Date,
      required: [true, 'Appointment date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Time slot is required'],
      enum: [
        '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '12:00-13:00', '14:00-15:00', '15:00-16:00',
        '16:00-17:00',
      ],
    },
    type: {
      type: String,
      enum: ['donation', 'camp', 'checkup'],
      default: 'donation',
    },
    component: {
      type: String,
      enum: ['whole_blood', 'plasma', 'platelets', 'red_cells'],
      default: 'whole_blood',
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },
    notes: String,
    location: {
      type: String,
      default: 'Main Blood Bank Center',
    },
  },
  { timestamps: true }
);

// Indexes
appointmentSchema.index({ date: 1, timeSlot: 1 });
appointmentSchema.index({ donorId: 1 });
appointmentSchema.index({ status: 1 });

// Auto-generate appointment ID
appointmentSchema.pre('save', async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.model('Appointment').countDocuments();
    this.appointmentId = `APT-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
