import Staff from '../models/Staff.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import AuditLog from '../models/AuditLog.js';
import StaffLog from '../models/StaffLog.js';
import { sendStaffWelcomeEmail } from '../services/emailService.js';

// Helper to check if user has permission to manage staff for a branch
const hasStaffManagementPermission = (actor, branchId) => {
  if (actor.role === 'admin') return true;
  if (actor.role === 'branch_admin' && actor.branchId?.toString() === branchId?.toString()) return true;
  if (actor.role === 'staff' && actor.staffRole === 'branch_manager' && actor.branchId?.toString() === branchId?.toString()) return true;
  return false;
};

// Helper to log staff actions to StaffLog
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

// @desc    Add staff member
// @route   POST /api/staff
// @access  Private (Admin, Branch Admin, Branch Manager)
export const addStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone, staffRole, branchId } = req.body;

    let targetBranchId = branchId;
    if (req.user.role !== 'admin') {
      targetBranchId = req.user.branchId;
    }

    if (!targetBranchId) {
      return res.status(400).json({ success: false, message: 'Branch assignment is required' });
    }

    // Check branch permissions
    if (!hasStaffManagementPermission(req.user, targetBranchId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to manage staff for this branch' });
    }

    // Check branch exists and is approved
    const branch = await Branch.findById(targetBranchId);
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
      branchId: targetBranchId,
    });

    // Create staff profile
    const staff = await Staff.create({
      userId: user._id,
      fullName: name,
      email,
      phone,
      staffRole,
      branchId: targetBranchId,
      addedBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      actionType: 'staff_add',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: targetBranchId,
      targetType: 'Staff',
      targetId: staff._id,
      newData: { name, email, staffRole, branchId: targetBranchId },
      ipAddress: req.clientIp || req.ip || '',
      description: `Staff member "${name}" added to branch`,
    });

    // Staff activity log
    await logStaffAction(req.user, targetBranchId, 'staff_add', null, { name, email, staffRole, branchId: targetBranchId }, req, `Added staff member "${name}"`);

    // Send welcome email notification
    sendStaffWelcomeEmail({
      name,
      email,
      role: staffRole,
      branchName: branch.name,
    }, password);

    res.status(201).json({ success: true, data: staff, message: 'Staff member added successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Admin, Branch Admin, Branch Manager)
export const getStaff = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.staffRole) filter.staffRole = req.query.staffRole;
    
    // Non-admins can only access staff from their branch
    if (req.user.role !== 'admin') {
      filter.branchId = req.user.branchId;
    }

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
// @access  Private (Admin, Branch Admin, Branch Manager)
export const getStaffMember = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('branchId', 'name address')
      .populate('userId', 'email isActive');

    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    // Isolation check
    if (req.user.role !== 'admin' && staff.branchId?.toString() !== req.user.branchId?.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view staff of this branch' });
    }

    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Admin, Branch Admin, Branch Manager)
export const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    // Check branch permissions
    if (!hasStaffManagementPermission(req.user, staff.branchId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update staff for this branch' });
    }

    const oldData = { staffRole: staff.staffRole, branchId: staff.branchId, fullName: staff.fullName, phone: staff.phone };

    // Prevent non-admin from moving staff to another branch
    if (req.user.role !== 'admin') {
      delete req.body.branchId;
    }

    const updated = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    // If branch, name, or role changed, update user account too
    const userUpdates = {};
    if (req.body.branchId) userUpdates.branchId = req.body.branchId;
    if (req.body.staffRole) userUpdates.staffRole = req.body.staffRole;
    if (req.body.name) userUpdates.name = req.body.name;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(staff.userId, userUpdates);
    }

    await AuditLog.create({
      actionType: 'staff_update',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: staff.branchId,
      targetType: 'Staff',
      targetId: staff._id,
      oldData,
      newData: req.body,
      ipAddress: req.clientIp || req.ip || '',
      description: `Staff member "${staff.fullName}" updated`,
    });

    // Staff activity log
    await logStaffAction(req.user, staff.branchId, 'staff_update', oldData, req.body, req, `Updated staff member "${staff.fullName}"`);

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin, Branch Admin, Branch Manager)
export const removeStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff member not found' });

    // Check branch permissions
    if (!hasStaffManagementPermission(req.user, staff.branchId)) {
      return res.status(403).json({ success: false, message: 'Not authorized to remove staff for this branch' });
    }

    // Deactivate user account
    await User.findByIdAndUpdate(staff.userId, { isActive: false, role: 'donor', staffRole: null, branchId: null });
    await Staff.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      actionType: 'staff_remove',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: staff.branchId,
      targetType: 'Staff',
      targetId: staff._id,
      oldData: { fullName: staff.fullName, staffRole: staff.staffRole },
      ipAddress: req.clientIp || req.ip || '',
      description: `Staff member "${staff.fullName}" removed`,
    });

    // Staff activity log
    await logStaffAction(req.user, staff.branchId, 'staff_remove', { fullName: staff.fullName, staffRole: staff.staffRole }, null, req, `Removed staff member "${staff.fullName}"`);

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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only global admin can reassign branches' });
    }

    const { branchId } = req.body;
    const branch = await Branch.findById(branchId);
    if (!branch || branch.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Branch not found or not approved' });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    const oldBranchId = staff.branchId;
    staff.branchId = branchId;
    await staff.save();

    await User.findByIdAndUpdate(staff.userId, { branchId });

    await AuditLog.create({
      actionType: 'staff_update',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId,
      targetType: 'Staff',
      targetId: staff._id,
      oldData: { branchId: oldBranchId },
      newData: { branchId },
      ipAddress: req.clientIp || req.ip || '',
      description: `Staff member "${staff.fullName}" branch reassigned`,
    });

    res.status(200).json({ success: true, data: staff, message: 'Branch assigned successfully' });
  } catch (error) {
    next(error);
  }
};
