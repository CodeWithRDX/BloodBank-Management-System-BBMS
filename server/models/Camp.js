import mongoose from 'mongoose';

const campSchema = new mongoose.Schema(
  {
    campId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Camp name is required'],
      trim: true,
    },
    organizer: {
      type: String,
      required: [true, 'Organizer name is required'],
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Associated branch is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Camp date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
    },
    // GeoJSON for map display
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },

    maxDonors: {
      type: Number,
      required: [true, 'Maximum donor capacity is required'],
      min: [1, 'Minimum 1 donor'],
    },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    description: String,
    contactPerson: {
      name: String,
      phone: String,
    },

    // Analytics
    totalRegistrations: { type: Number, default: 0 },
    totalAttendees: { type: Number, default: 0 },
    totalDonations: { type: Number, default: 0 },
    inventoryGenerated: { type: Number, default: 0 }, // units added to inventory
  },
  { timestamps: true }
);

campSchema.index({ location: '2dsphere' });
campSchema.index({ branchId: 1 });
campSchema.index({ date: 1 });
campSchema.index({ status: 1 });

campSchema.pre('save', function (next) {
  if (this.latitude !== undefined && this.longitude !== undefined) {
    this.location = { type: 'Point', coordinates: [this.longitude, this.latitude] };
  }
  next();
});

campSchema.pre('save', async function (next) {
  if (!this.campId) {
    const count = await mongoose.model('Camp').countDocuments();
    this.campId = `CMP-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

const Camp = mongoose.model('Camp', campSchema);
export default Camp;
