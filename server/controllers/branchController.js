import Branch from '../models/Branch.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import BranchApproval from '../models/BranchApproval.js';
import NotificationService from '../services/notificationService.js';
import { emitBranchStatusChange, emitToAdmins } from '../utils/socketManager.js';
import { sendBranchRegistrationEmail, sendBranchStatusEmail } from '../services/emailService.js';

// @desc    Register a new branch
// @route   POST /api/branches
// @access  Public (or authenticated users)
export const registerBranch = async (req, res, next) => {
  try {
    const {
      name, registrationNumber, email, phone,
      address, latitude, longitude, description,
      operatingHours, managerId,
    } = req.body;

    const existing = await Branch.findOne({ $or: [{ registrationNumber }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Branch with this registration number or email already exists' });
    }

    const branch = await Branch.create({
      name, registrationNumber, email, phone,
      address, latitude, longitude, description,
      operatingHours, managerId,
      status: 'pending',
    });

    // Notify all admins of new branch registration request
    await NotificationService.notifyAdmins({
      title: '🏥 New Branch Registration',
      message: `${name} has submitted a branch registration request. Review and approve.`,
      type: 'info',
      category: 'branch',
      referenceType: 'Branch',
      referenceId: branch._id,
    });

    // Emit to admins via socket
    emitToAdmins('branch:new_registration', { branchId: branch._id, name });

    // Audit log
    await AuditLog.create({
      actionType: 'branch_register',
      actor: req.user?.id,
      actorName: req.user?.name,
      actorRole: req.user?.role,
      targetType: 'Branch',
      targetId: branch._id,
      newData: { name, registrationNumber, status: 'pending' },
      ipAddress: req.clientIp,
      description: `Branch "${name}" registered and awaiting approval`,
    });

    // Send email notification to admins
    sendBranchRegistrationEmail(branch);

    res.status(201).json({ success: true, data: branch, message: 'Branch registration submitted. Pending admin approval.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all branches
// @route   GET /api/branches
// @access  Private (Admin)
export const getBranches = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.city) filter['address.city'] = { $regex: req.query.city, $options: 'i' };

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Branch.countDocuments(filter);
    const branches = await Branch.find(filter)
      .populate('managerId', 'name email')
      .populate('approvedBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, count: branches.length, data: branches });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single branch
// @route   GET /api/branches/:id
// @access  Private
export const getBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id)
      .populate('managerId', 'name email phone')
      .populate('approvedBy', 'name');

    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }
    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve branch
// @route   PUT /api/branches/:id/approve
// @access  Private (Admin)
export const approveBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

    const oldStatus = branch.status;
    branch.status = 'approved';
    branch.approvedBy = req.user.id;
    branch.approvedAt = new Date();
    branch.isActive = true;
    await branch.save();

    // Notify the branch manager
    await NotificationService.notifyBranchApproval(branch, 'approved', branch.managerId);

    // Send email notification to branch manager
    sendBranchStatusEmail(branch, 'approved');

    // Emit socket event
    emitBranchStatusChange(branch._id.toString(), 'approved');

    // Audit log
    await AuditLog.create({
      actionType: 'branch_approve',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Branch',
      targetId: branch._id,
      oldData: { status: oldStatus },
      newData: { status: 'approved' },
      ipAddress: req.clientIp,
      description: `Branch "${branch.name}" approved by admin`,
    });

    // Create BranchApproval log
    await BranchApproval.create({
      branchId: branch._id,
      status: 'approved',
      action: 'approve',
      performedBy: req.user.id,
      reason: 'Approved by admin',
      ipAddress: req.clientIp || req.ip || '',
    });

    res.status(200).json({ success: true, data: branch, message: 'Branch approved successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject branch
// @route   PUT /api/branches/:id/reject
// @access  Private (Admin)
export const rejectBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

    const oldStatus = branch.status;
    branch.status = 'rejected';
    branch.rejectionReason = req.body.rejectionReason || 'Not specified';
    branch.approvedBy = req.user.id;
    branch.approvedAt = new Date();
    await branch.save();

    await NotificationService.notifyBranchApproval(branch, 'rejected', branch.managerId);
    
    // Send email notification to branch manager
    sendBranchStatusEmail(branch, 'rejected', branch.rejectionReason);

    emitBranchStatusChange(branch._id.toString(), 'rejected');

    await AuditLog.create({
      actionType: 'branch_reject',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Branch',
      targetId: branch._id,
      oldData: { status: oldStatus },
      newData: { status: 'rejected', rejectionReason: branch.rejectionReason },
      ipAddress: req.clientIp,
      description: `Branch "${branch.name}" rejected`,
    });

    // Create BranchApproval log
    await BranchApproval.create({
      branchId: branch._id,
      status: 'rejected',
      action: 'reject',
      performedBy: req.user.id,
      reason: branch.rejectionReason,
      ipAddress: req.clientIp || req.ip || '',
    });

    res.status(200).json({ success: true, data: branch, message: 'Branch rejected' });
  } catch (error) {
    next(error);
  }
};

// @desc    Suspend/unsuspend branch
// @route   PUT /api/branches/:id/status
// @access  Private (Admin)
export const updateBranchStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['approved', 'suspended'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { status, isActive: status === 'approved' },
      { new: true }
    );
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

    emitBranchStatusChange(branch._id.toString(), status);

    await AuditLog.create({
      actionType: status === 'suspended' ? 'branch_suspend' : 'branch_approve',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'Branch',
      targetId: branch._id,
      newData: { status },
      ipAddress: req.clientIp,
      description: `Branch "${branch.name}" status changed to ${status}`,
    });

    // Create BranchApproval log
    await BranchApproval.create({
      branchId: branch._id,
      status: status,
      action: status,
      performedBy: req.user.id,
      reason: req.body.reason || `Status updated by admin to ${status}`,
      ipAddress: req.clientIp || req.ip || '',
    });

    res.status(200).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

// @desc    Update branch details
// @route   PUT /api/branches/:id
// @access  Private (Admin, Branch Admin)
export const updateBranch = async (req, res, next) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

    // Branch admin can only update their own branch
    if (req.user.role !== 'admin' && req.user.branchId?.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get approved branches (public - for locator)
// @route   GET /api/branches/public
// @access  Public
export const getPublicBranches = async (req, res, next) => {
  try {
    const branches = await Branch.find({ status: 'approved', isActive: true })
      .select('name address latitude longitude phone email operatingHours')
      .sort('name');
    res.status(200).json({ success: true, count: branches.length, data: branches });
  } catch (error) {
    next(error);
  }
};
