import Appointment from '../models/Appointment.js';
import Donor from '../models/Donor.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import Donation from '../models/Donation.js';
import AuditLog from '../models/AuditLog.js';
import StaffLog from '../models/StaffLog.js';
import Staff from '../models/Staff.js';
import CampRegistration from '../models/CampRegistration.js';
import { addToInventory } from '../services/inventoryService.js';
import NotificationService from '../services/notificationService.js';
import Branch from '../models/Branch.js';

// Helper to log staff actions
const logStaffAction = async (actorUser, targetBranchId, operationType, previousData, updatedData, req, description = '') => {
  const staffProfile = await Staff.findOne({ userId: actorUser.id });
  if (staffProfile) {
    await StaffLog.create({
      staffId: staffProfile._id,
      branchId: targetBranchId || staffProfile.branchId,
      operationType,
      previousData,
      updatedData,
      ipAddress: req.clientIp || req.ip || '',
      description,
    });
  }
};

export const getAppointments = async (req, res, next) => {
  try {
    const baseQuery = {};
    // Staff and Branch Admins can only see appointments for their branch
    if (req.user.role !== 'admin') {
      baseQuery.branchId = req.user.branchId;
    } else if (req.query.branchId) {
      baseQuery.branchId = req.query.branchId;
    }

    const totalCount = await Appointment.countDocuments(baseQuery);
    const features = new ApiFeatures(
      Appointment.find(baseQuery).populate('donorId', 'fullName bloodGroup').populate('userId', 'name email').populate('branchId', 'name address.city'),
      req.query
    ).filter().sort().paginate();
    const appointments = await features.query;
    res.status(200).json({ success: true, count: appointments.length, total: totalCount, pagination: features.pagination, data: appointments });
  } catch (error) { next(error); }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate('branchId', 'name address')
      .sort('-date');
    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) { next(error); }
};

export const createAppointment = async (req, res, next) => {
  try {
    const { branchId, date, timeSlot, type, component, notes } = req.body;

    if (!branchId) {
      return res.status(400).json({ success: false, message: 'Please select a branch.' });
    }

    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found. Please complete your profile first.' });

    // 1. Check for single active appointment rule
    const activeAppointment = await Appointment.findOne({
      userId: req.user.id,
      status: { $in: ['Pending', 'Approved', 'Ongoing'] },
    });
    if (activeAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You already have a Pending, Approved, or Ongoing appointment. Please complete or cancel it first.',
      });
    }

    // 2. Check for pending camp registration conflict
    const pendingCamp = await CampRegistration.findOne({
      userId: req.user.id,
      status: 'Pending Approval',
    });
    if (pendingCamp) {
      return res.status(400).json({
        success: false,
        message: 'You have a pending camp registration. You cannot book an appointment until it is resolved.',
      });
    }

    // 3. Check donor cooldown / eligibility
    const eligibility = donor.checkEligibility(component || 'whole_blood');
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: `You are in a cooldown period. Remaining days: ${eligibility.daysRemaining}`,
      });
    }

    // 4. Check for conflicting appointment slot at this branch
    const existingSlot = await Appointment.findOne({
      branchId,
      date,
      timeSlot,
      status: { $in: ['Pending', 'Approved', 'Ongoing'] },
    });
    if (existingSlot) {
      return res.status(400).json({ success: false, message: 'This time slot is already booked at this branch' });
    }

    req.body.donorId = donor._id;
    req.body.userId = req.user.id;
    req.body.status = 'Pending';
    const appointment = await Appointment.create(req.body);

    // Send notifications to branch manager/staff
    await NotificationService.create({
      userId: req.user.id,
      title: '📅 Appointment Booked Successfully',
      message: `Your donation appointment has been booked for ${new Date(date).toLocaleDateString()} at ${timeSlot}. Pending approval.`,
      type: 'info',
      category: 'appointment',
      referenceType: 'Appointment',
      referenceId: appointment._id,
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};

export const updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });

    // Access control
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Branch isolation check for staff/branch manager
    if (req.user.role !== 'admin' && req.user.role === 'staff' && appointment.branchId.toString() !== req.user.branchId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage appointments for this branch' });
    }

    const previousStatus = appointment.status;
    const newStatus = req.body.status;

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // Handle Completed Donation
    if (newStatus === 'Completed' && previousStatus !== 'Completed') {
      const donor = await Donor.findById(appointment.donorId);
      if (donor) {
        const component = appointment.component || 'whole_blood';
        const quantity = 1; // 1 unit

        // Record donation on donor profile (updates dates, increments count, sets cooling_period)
        donor.recordDonation(component);
        await donor.save();

        const branchId = appointment.branchId;

        // Create donation document
        const donation = await Donation.create({
          donorId: donor._id,
          bloodGroup: donor.bloodGroup,
          quantity,
          donationDate: new Date(),
          component,
          collectedBy: req.user.id,
          branchId,
          status: 'approved',
          notes: `Created automatically from completed appointment ${appointment.appointmentId}`,
        });

        // Add to blood inventory
        const inventoryItem = await addToInventory({
          bloodGroup: donor.bloodGroup,
          component,
          quantity,
          branchId,
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
          branchId,
          targetType: 'Donation',
          targetId: donation._id,
          newData: { donorId: donor._id, bloodGroup: donor.bloodGroup, quantity: donation.quantity },
          ipAddress: req.clientIp || req.ip || '',
          description: `Donation recorded automatically for completed appointment ${appointment.appointmentId}`,
        });

        // Create Detailed Notification for user
        const eligibility = donor.checkEligibility(component);
        const coolingPeriod = component === 'platelets' ? 14 : component === 'plasma' ? 28 : 90;
        const messageText = `Thank you for your donation! Total donations: ${donor.totalDonations}. Cooldown period: ${coolingPeriod} days. Remaining days to donate again: ${eligibility.daysRemaining} days.`;

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
    } else {
      // Send notifications for normal updates
      if (newStatus === 'Approved' && previousStatus !== 'Approved') {
        await NotificationService.create({
          userId: appointment.userId,
          title: '✅ Appointment Approved',
          message: `Your donation appointment on ${new Date(appointment.date).toLocaleDateString()} has been approved.`,
          type: 'success',
          category: 'appointment',
          referenceType: 'Appointment',
          referenceId: appointment._id,
        });
      } else if (newStatus === 'Rejected' && previousStatus !== 'Rejected') {
        await NotificationService.create({
          userId: appointment.userId,
          title: '❌ Appointment Rejected',
          message: `Your donation appointment request has been rejected. Details: ${appointment.notes || 'None'}`,
          type: 'warning',
          category: 'appointment',
          referenceType: 'Appointment',
          referenceId: appointment._id,
        });
      }
    }

    // Log Staff Action if performed by staff/admin
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      await logStaffAction(req.user, appointment.branchId, 'appointment_update', { status: previousStatus }, { status: newStatus }, req, `Updated appointment ${appointment.appointmentId} status to ${newStatus}`);
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

    const prevStatus = appointment.status;
    appointment.status = 'Cancelled';
    await appointment.save();

    await NotificationService.create({
      userId: appointment.userId,
      title: '📅 Appointment Cancelled',
      message: `Your appointment scheduled for ${new Date(appointment.date).toLocaleDateString()} has been cancelled.`,
      type: 'warning',
      category: 'appointment',
      referenceType: 'Appointment',
      referenceId: appointment._id,
    });

    if (req.user.role === 'staff' || req.user.role === 'admin') {
      await logStaffAction(req.user, appointment.branchId, 'appointment_cancel', { status: prevStatus }, { status: 'Cancelled' }, req, `Cancelled appointment ${appointment.appointmentId}`);
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) { next(error); }
};
