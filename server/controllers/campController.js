import Camp from '../models/Camp.js';
import CampRegistration from '../models/CampRegistration.js';
import Donor from '../models/Donor.js';
import AuditLog from '../models/AuditLog.js';
import NotificationService from '../services/notificationService.js';
import { emitCampRegistration, emitToAdmins } from '../utils/socketManager.js';
import Appointment from '../models/Appointment.js';
import Staff from '../models/Staff.js';
import StaffLog from '../models/StaffLog.js';
import Donation from '../models/Donation.js';
import { addToInventory } from '../services/inventoryService.js';

// Helper to log staff actions
const logStaffAction = async (actorUser, targetBranchId, operationType, previousData, updatedData, req, description = '') => {
  if (!actorUser) return;
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

// ─── CAMP CRUD ────────────────────────────────────────────────────────────────

// @desc    Create donation camp
// @route   POST /api/camps
// @access  Private (Admin, Staff)
export const createCamp = async (req, res, next) => {
  try {
    const camp = await Camp.create({
      ...req.body,
      createdBy: req.user.id,
      branchId: req.body.branchId || req.user.branchId,
    });

    await AuditLog.create({
      actionType: 'camp_create',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Camp',
      targetId: camp._id,
      newData: { name: camp.name, date: camp.date, branchId: camp.branchId },
      ipAddress: req.clientIp,
      description: `Camp "${camp.name}" created`,
    });

    // Notify admins
    await NotificationService.notifyAdmins({
      title: '🩸 New Donation Camp Created',
      message: `Camp "${camp.name}" has been scheduled for ${new Date(camp.date).toLocaleDateString()}.`,
      type: 'info',
      category: 'camp',
      referenceType: 'Camp',
      referenceId: camp._id,
    });

    emitToAdmins('camp:created', { campId: camp._id, name: camp.name });

    await logStaffAction(req.user, camp.branchId, 'camp_create', null, { name: camp.name, date: camp.date }, req, `Camp "${camp.name}" created`);

    res.status(201).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all camps
// @route   GET /api/camps
// @access  Public
export const getCamps = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.upcoming) filter.date = { $gte: new Date() };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Camp.countDocuments(filter);
    const camps = await Camp.find(filter)
      .populate('branchId', 'name address.city')
      .populate('createdBy', 'name')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, count: camps.length, data: camps });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single camp with stats
// @route   GET /api/camps/:id
// @access  Public
export const getCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id)
      .populate('branchId', 'name address phone')
      .populate('createdBy', 'name');

    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });

    // Get registrations count
    const registrations = await CampRegistration.countDocuments({ campId: camp._id });
    const attended = await CampRegistration.countDocuments({ campId: camp._id, status: 'attended' });
    const donated = await CampRegistration.countDocuments({ campId: camp._id, status: 'donated' });

    res.status(200).json({
      success: true,
      data: {
        ...camp.toObject(),
        stats: { registrations, attended, donated, available: camp.maxDonors - registrations },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update camp
// @route   PUT /api/camps/:id
// @access  Private (Admin, Staff)
export const updateCamp = async (req, res, next) => {
  try {
    let camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });

    // Staff can only edit their branch's camps
    if (req.user.role === 'staff' && camp.branchId?.toString() !== req.user.branchId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this camp' });
    }

    camp = await Camp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    const prevData = { status: camp.status, name: camp.name, date: camp.date };

    await AuditLog.create({
      actionType: 'camp_update',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Camp',
      targetId: camp._id,
      newData: req.body,
      ipAddress: req.clientIp,
      description: `Camp "${camp.name}" updated`,
    });

    await logStaffAction(req.user, camp.branchId, 'camp_update', prevData, req.body, req, `Camp "${camp.name}" updated`);

    res.status(200).json({ success: true, data: camp });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel camp
// @route   PUT /api/camps/:id/cancel
// @access  Private (Admin, Staff)
export const cancelCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });

    const prevStatus = camp.status;

    await AuditLog.create({
      actionType: 'camp_cancel',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Camp',
      targetId: camp._id,
      ipAddress: req.clientIp,
      description: `Camp "${camp.name}" cancelled`,
    });

    await logStaffAction(req.user, camp.branchId, 'camp_cancel', { status: prevStatus }, { status: 'cancelled' }, req, `Camp "${camp.name}" cancelled`);

    // Notify registered donors
    const registrations = await CampRegistration.find({ campId: camp._id, status: 'registered' }).populate('userId');
    for (const reg of registrations) {
      await NotificationService.create({
        userId: reg.userId?._id,
        title: 'Camp Cancelled',
        message: `The donation camp "${camp.name}" scheduled for ${new Date(camp.date).toLocaleDateString()} has been cancelled.`,
        type: 'warning',
        category: 'camp',
      });
    }

    res.status(200).json({ success: true, data: camp, message: 'Camp cancelled' });
  } catch (error) {
    next(error);
  }
};

// ─── CAMP REGISTRATIONS ───────────────────────────────────────────────────────

// @desc    Register for a camp
// @route   POST /api/camps/:id/register
// @access  Private (Donor)


// Staff actions helper moved to top of file

export const registerForCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id).populate('branchId');
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    if (camp.status !== 'upcoming' && camp.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Camp is not accepting registrations' });
    }

    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });

    // Check capacity (exclude Rejected or cancelled)
    const regCount = await CampRegistration.countDocuments({ campId: camp._id, status: { $nin: ['Rejected', 'cancelled'] } });
    if (regCount >= camp.maxDonors) {
      return res.status(400).json({ success: false, message: 'Camp is fully booked' });
    }

    // 1. Check duplicate registration
    const existing = await CampRegistration.findOne({ campId: camp._id, donorId: donor._id });
    if (existing && existing.status !== 'Rejected') {
      return res.status(400).json({ success: false, message: 'You are already registered for this camp' });
    }

    // 2. Check duplicate/active appointment conflict
    const activeAppointment = await Appointment.findOne({
      userId: req.user.id,
      status: { $in: ['Pending', 'Approved', 'Ongoing'] },
    });
    if (activeAppointment) {
      return res.status(400).json({
        success: false,
        message: 'You have a Pending, Approved, or Ongoing appointment. Resolve it before registering for camps.',
      });
    }

    // 3. Check donor cooldown status
    const eligibility = donor.checkEligibility('whole_blood');
    if (!eligibility.eligible) {
      return res.status(400).json({
        success: false,
        message: `You are in a cooling period. Remaining days: ${eligibility.daysRemaining}`,
      });
    }

    const registration = await CampRegistration.create({
      campId: camp._id,
      donorId: donor._id,
      userId: req.user.id,
      isEligible: eligibility.eligible,
      status: 'Pending Approval',
    });

    // Update camp total
    await Camp.findByIdAndUpdate(camp._id, { $inc: { totalRegistrations: 1 } });

    // Send notifications
    await NotificationService.notifyCampRegistration(camp, donor, registration);

    // Real-time emit
    emitCampRegistration(camp.branchId?._id?.toString(), {
      campId: camp._id,
      campName: camp.name,
      donorName: donor.fullName,
      registrationId: registration._id,
    });

    await AuditLog.create({
      actionType: 'camp_register',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: 'donor',
      branchId: camp.branchId?._id,
      targetType: 'CampRegistration',
      targetId: registration._id,
      newData: { campId: camp._id, donorId: donor._id },
      ipAddress: req.clientIp || req.ip || '',
      description: `Donor "${donor.fullName}" registered for camp "${camp.name}"`,
    });

    res.status(201).json({ success: true, data: registration, eligibility });
  } catch (error) {
    next(error);
  }
};

// @desc    Get camp registrations
// @route   GET /api/camps/:id/registrations
// @access  Private (Admin, Staff)
export const getCampRegistrations = async (req, res, next) => {
  try {
    const registrations = await CampRegistration.find({ campId: req.params.id })
      .populate('donorId', 'fullName bloodGroup phone isEligible')
      .populate('userId', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all camp registrations (filtered by branch and status if needed)
// @route   GET /api/camps/registrations/all
// @access  Private (Admin, Staff, Branch Admin)
export const getAllRegistrations = async (req, res, next) => {
  try {
    const filter = {};
    
    // Non-admins can only see registrations for camps of their branch
    if (req.user.role !== 'admin') {
      const branchCamps = await Camp.find({ branchId: req.user.branchId }).select('_id');
      const campIds = branchCamps.map(c => c._id);
      filter.campId = { $in: campIds };
    } else if (req.query.branchId) {
      const branchCamps = await Camp.find({ branchId: req.query.branchId }).select('_id');
      const campIds = branchCamps.map(c => c._id);
      filter.campId = { $in: campIds };
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const registrations = await CampRegistration.find(filter)
      .populate('campId', 'name date branchId')
      .populate('donorId', 'fullName bloodGroup phone isEligible')
      .populate('userId', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    next(error);
  }
};


// @desc    Get donor's camp registrations
// @route   GET /api/camps/my-registrations
// @access  Private (Donor)
export const getMyRegistrations = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });

    const registrations = await CampRegistration.find({ donorId: donor._id })
      .populate({
        path: 'campId',
        select: 'name date startTime address branchId status',
        populate: { path: 'branchId', select: 'name address.city' },
      })
      .sort('-createdAt');

    res.status(200).json({ success: true, count: registrations.length, data: registrations });
  } catch (error) {
    next(error);
  }
};

// @desc    Update registration status (mark attended/donated)
// @route   PUT /api/camps/registrations/:id/status
// @access  Private (Admin, Staff)


export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const registration = await CampRegistration.findById(req.params.id)
      .populate('campId')
      .populate('donorId')
      .populate('userId');
      
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    // Isolation check
    if (req.user.role !== 'admin' && req.user.role === 'staff' && registration.campId?.branchId?.toString() !== req.user.branchId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage registrations for this branch' });
    }

    const previousStatus = registration.status;
    registration.status = status;

    if (status === 'Attended' && previousStatus !== 'Attended') {
      registration.attendanceTime = new Date();

      // Update camp analytics
      await Camp.findByIdAndUpdate(registration.campId._id, { 
        $inc: { totalAttendees: 1, totalDonations: 1 } 
      });

      const donor = registration.donorId;
      if (donor) {
        // Record donation on donor profile (whole blood)
        donor.recordDonation('whole_blood');
        await donor.save();

        const branchId = registration.campId.branchId;
        const quantity = 1; // 1 unit

        // Create donation record
        const donation = await Donation.create({
          donorId: donor._id,
          bloodGroup: donor.bloodGroup,
          quantity,
          donationDate: new Date(),
          component: 'whole_blood',
          collectedBy: req.user.id,
          branchId,
          status: 'approved',
          notes: `Created automatically from camp attendance for "${registration.campId.name}"`,
        });

        // Add to blood inventory
        const inventoryItem = await addToInventory({
          bloodGroup: donor.bloodGroup,
          component: 'whole_blood',
          quantity,
          branchId,
          donationId: donation._id,
          performedBy: req.user.id,
          reason: `Donation camp attendance ("${registration.campId.name}")`,
          referenceType: 'Donation',
          referenceId: donation._id,
        });

        // Link inventory item to donation and registration
        donation.inventoryId = inventoryItem._id;
        await donation.save();

        registration.donationId = donation._id;

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
          description: `Donation recorded automatically for attended camp registration ${registration.registrationId}`,
        });

        // User Notification
        await NotificationService.create({
          userId: registration.userId?._id,
          title: '🎉 Camp Donation Completed',
          message: `Thank you for donating whole blood at "${registration.campId.name}". Your contribution is logged!`,
          type: 'success',
          category: 'donation',
        });
      }
    }

    await registration.save();

    // Log Staff Action if performed by staff/admin
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      await logStaffAction(req.user, registration.campId?.branchId, 'camp_registration_update', { status: previousStatus }, { status }, req, `Updated camp registration ${registration.registrationId} status to ${status}`);
    }

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};
