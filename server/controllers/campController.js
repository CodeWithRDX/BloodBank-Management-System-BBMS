import Camp from '../models/Camp.js';
import CampRegistration from '../models/CampRegistration.js';
import Donor from '../models/Donor.js';
import AuditLog from '../models/AuditLog.js';
import NotificationService from '../services/notificationService.js';
import { emitCampRegistration, emitToAdmins } from '../utils/socketManager.js';

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
export const registerForCamp = async (req, res, next) => {
  try {
    const camp = await Camp.findById(req.params.id).populate('branchId');
    if (!camp) return res.status(404).json({ success: false, message: 'Camp not found' });
    if (camp.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: 'Camp is not accepting registrations' });
    }

    const donor = await Donor.findOne({ userId: req.user.id });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });

    // Check capacity
    const regCount = await CampRegistration.countDocuments({ campId: camp._id, status: { $ne: 'cancelled' } });
    if (regCount >= camp.maxDonors) {
      return res.status(400).json({ success: false, message: 'Camp is fully booked' });
    }

    // Check eligibility
    const eligibility = donor.checkEligibility('whole_blood');

    // Check duplicate registration
    const existing = await CampRegistration.findOne({ campId: camp._id, donorId: donor._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already registered for this camp' });
    }

    const registration = await CampRegistration.create({
      campId: camp._id,
      donorId: donor._id,
      userId: req.user.id,
      isEligible: eligibility.eligible,
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
      targetType: 'CampRegistration',
      targetId: registration._id,
      newData: { campId: camp._id, donorId: donor._id },
      ipAddress: req.clientIp,
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
    const registration = await CampRegistration.findByIdAndUpdate(
      req.params.id,
      { status, attendanceTime: new Date() },
      { new: true }
    );
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    // Update camp analytics
    if (status === 'attended') {
      await Camp.findByIdAndUpdate(registration.campId, { $inc: { totalAttendees: 1 } });
    }
    if (status === 'donated') {
      await Camp.findByIdAndUpdate(registration.campId, { $inc: { totalDonations: 1 } });
    }

    res.status(200).json({ success: true, data: registration });
  } catch (error) {
    next(error);
  }
};
