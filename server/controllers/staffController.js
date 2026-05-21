import Staff from '../models/Staff.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Add staff member
// @route   POST /api/staff
// @access  Private (Admin)
export const addStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone, staffRole, branchId } = req.body;

    // Check branch exists and is approved
    const branch = await Branch.findById(branchId);
    if (!branch || branch.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Branch not found or not approved' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Create user account
    user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'staff',
      staffRole,
      branchId,
    });

    // Create staff profile
    const staff = await Staff.create({
      userId: user._id,
      fullName: name,
      email,
      phone,
      staffRole,
      branchId,
      addedBy: req.user.id,
    });

    await AuditLog.create({
      actionType: 'staff_add',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Staff',
      targetId: staff._id,
      newData: { name, email, staffRole, branchId },
      ipAddress: req.clientIp,
      description: `Staff member "${name}" added to branch`,
    });

    res.status(201).json({ success: true, data: staff, message: 'Staff member added successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Admin, Branch Admin)
export const getStaff = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.staffRole) filter.staffRole = req.query.staffRole;
    if (req.user.role !== 'admin') filter.branchId = req.user.branchId;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Staff.countDocuments(filter);
    const staff = await Staff.find(filter)
      .populate('branchId', 'name address.city')
      .populate('addedBy', 'name')
      .populate('userId', 'email isActive lastLoginAt')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, count: staff.length, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  Private (Admin)
export const getStaffMember = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('branchId', 'name address')
      .populate('userId', 'email isActive');

    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin)
export const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    const oldData = { staffRole: staff.staffRole, branchId: staff.branchId };

    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // If branch or role changed, update user account too
    if (req.body.branchId || req.body.staffRole) {
      await User.findByIdAndUpdate(staff.userId, {
        branchId: req.body.branchId || staff.branchId,
        staffRole: req.body.staffRole || staff.staffRole,
      });
    }

    await AuditLog.create({
      actionType: 'staff_update',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Staff',
      targetId: staff._id,
      oldData,
      newData: req.body,
      ipAddress: req.clientIp,
      description: `Staff member "${staff.fullName}" updated`,
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
export const removeStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    // Deactivate user account
    await User.findByIdAndUpdate(staff.userId, { isActive: false, role: 'donor', staffRole: null, branchId: null });
    await Staff.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      actionType: 'staff_remove',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Staff',
      targetId: staff._id,
      oldData: { fullName: staff.fullName, staffRole: staff.staffRole },
      ipAddress: req.clientIp,
      description: `Staff member "${staff.fullName}" removed`,
    });

    res.status(200).json({ success: true, message: 'Staff member removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign staff to different branch
// @route   PUT /api/staff/:id/assign-branch
// @access  Private (Admin)
export const assignBranch = async (req, res, next) => {
  try {
    const { branchId } = req.body;
    const branch = await Branch.findById(branchId);
    if (!branch || branch.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Branch not found or not approved' });
    }

    const staff = await Staff.findByIdAndUpdate(req.params.id, { branchId }, { new: true });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    await User.findByIdAndUpdate(staff.userId, { branchId });

    res.status(200).json({ success: true, data: staff, message: 'Branch assigned successfully' });
  } catch (error) {
    next(error);
  }
};
