import Appointment from '../models/Appointment.js';
import Donor from '../models/Donor.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import Donation from '../models/Donation.js';
import AuditLog from '../models/AuditLog.js';
import { addToInventory } from '../services/inventoryService.js';
import NotificationService from '../services/notificationService.js';
import Branch from '../models/Branch.js';

export const getAppointments = async (req, res, next) => {
  try {
    const totalCount = await Appointment.countDocuments();
    const features = new ApiFeatures(
      Appointment.find().populate('donorId', 'fullName bloodGroup').populate('userId', 'name email'),
      req.query
    ).filter().sort().paginate();
    const appointments = await features.query;
    res.status(200).json({ success: true, count: appointments.length, total: totalCount, pagination: features.pagination, data: appointments });
  } catch (error) { next(error); }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).sort('-date');
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) { next(error); }
};

export const createAppointment = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found. Please complete your profile first.' });

    // Check for conflicting appointment
    const existing = await Appointment.findOne({
      date: req.body.date, timeSlot: req.body.timeSlot, status: { $in: ['scheduled', 'confirmed'] },
    });
    if (existing) return res.status(400).json({ success: false, message: 'Time slot already booked' });

    req.body.donorId = donor._id;
    req.body.userId = req.user.id;
    const appointment = await Appointment.create(req.body);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};

export const updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.user.role !== 'admin' && req.user.role !== 'staff' && appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const previousStatus = appointment.status;
    const newStatus = req.body.status;

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (newStatus === 'completed' && previousStatus !== 'completed') {
      const donor = await Donor.findById(appointment.donorId);
      if (donor) {
        const component = appointment.component || 'whole_blood';
        const quantity = 1; // 1 unit

        // Record donation on donor profile (updates dates, increment count, sets cooling_period)
        donor.recordDonation(component);
        await donor.save();

        let branchId = req.user.branchId;
        if (!branchId) {
          const defaultBranch = await Branch.findOne();
          if (defaultBranch) {
            branchId = defaultBranch._id;
          }
        }

        // Create donation document
        const donation = await Donation.create({
          donorId: donor._id,
          bloodGroup: donor.bloodGroup,
          quantity,
          donationDate: new Date(),
          component,
          collectedBy: req.user.id,
          branchId: branchId || null,
          status: 'approved',
          notes: `Created automatically from completed appointment ${appointment.appointmentId}`,
        });

        // Add to blood inventory
        const inventoryItem = await addToInventory({
          bloodGroup: donor.bloodGroup,
          component,
          quantity,
          branchId: donation.branchId,
          donationId: donation._id,
          performedBy: req.user.id,
          reason: `Blood donation via completed appointment (${appointment.appointmentId})`,
          referenceType: 'Donation',
          referenceId: donation._id,
        });

        // Link inventory item to donation
        donation.inventoryId = inventoryItem._id;
        await donation.save();

        // Create Audit Log
        await AuditLog.create({
          actionType: 'donation_create',
          actor: req.user.id,
          actorName: req.user.name,
          actorRole: req.user.role,
          branchId: donation.branchId,
          targetType: 'Donation',
          targetId: donation._id,
          newData: { donorId: donor._id, bloodGroup: donor.bloodGroup, quantity: donation.quantity },
          ipAddress: req.ip || '',
          description: `Donation ${donation.donationId} recorded automatically for completed appointment ${appointment.appointmentId}`,
        });

        // Create detailed Notification/Log for user
        const eligibility = donor.checkEligibility(component);
        const coolingPeriod = component === 'platelets' ? 14 : component === 'plasma' ? 28 : 90;
        const messageText = `Thank you for your donation! Total donations: ${donor.totalDonations}. Last donation date: ${new Date().toLocaleDateString()}. Cooling period: ${coolingPeriod} days. Remaining days to donate again: ${eligibility.daysRemaining} days.`;

        await NotificationService.create({
          userId: donor.userId,
          title: '🎉 Donation Completed & Logged',
          message: messageText,
          type: 'success',
          category: 'donation',
          referenceType: 'Appointment',
          referenceId: appointment._id,
        });
      }
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};

export const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    if (req.user.role !== 'admin' && appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();
    res.status(200).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};
