import BloodTransfer from '../models/BloodTransfer.js';
import BloodInventory from '../models/BloodInventory.js';
import AuditLog from '../models/AuditLog.js';
import NotificationService from '../services/notificationService.js';
import { subtractFromInventory, addToInventory } from '../services/inventoryService.js';
import { emitToBranch, emitToAdmins } from '../utils/socketManager.js';

// @desc    Initiate blood transfer request
// @route   POST /api/transfers
// @access  Private (Admin, Branch Admin)
export const initiateTransfer = async (req, res, next) => {
  try {
    const { fromBranch, toBranch, bloodGroup, component, quantity, reason, bloodRequestId } = req.body;

    if (fromBranch === toBranch) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to same branch' });
    }

    const transfer = await BloodTransfer.create({
      fromBranch,
      toBranch,
      bloodGroup,
      component: component || 'whole_blood',
      quantity,
      reason,
      bloodRequestId,
      requestedBy: req.user.id,
      status: 'pending',
    });

    await AuditLog.create({
      actionType: 'transfer_initiate',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: fromBranch,
      targetType: 'BloodTransfer',
      targetId: transfer._id,
      newData: { fromBranch, toBranch, bloodGroup, quantity },
      ipAddress: req.clientIp,
      description: `Transfer ${transfer.transferId} initiated: ${quantity} units of ${bloodGroup}`,
    });

    // Notify destination branch staff
    await NotificationService.notifyBranchStaff(toBranch, {
      title: '🔄 Incoming Transfer Request',
      message: `A blood transfer request for ${quantity} units of ${bloodGroup} is pending your approval.`,
      type: 'info',
      category: 'transfer',
    });

    emitToBranch(toBranch.toString(), 'transfer:new', { transferId: transfer._id });
    emitToAdmins('transfer:new', { transferId: transfer._id });

    res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept transfer — deducts from source, adds to destination
// @route   PUT /api/transfers/:id/accept
// @access  Private (Admin, Branch Admin of destination)
export const acceptTransfer = async (req, res, next) => {
  try {
    const transfer = await BloodTransfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    if (transfer.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Transfer is not in pending state' });
    }

    // Deduct from source branch
    await subtractFromInventory({
      bloodGroup: transfer.bloodGroup,
      component: transfer.component,
      quantity: transfer.quantity,
      branchId: transfer.fromBranch,
      performedBy: req.user.id,
      reason: `Transfer to branch (${transfer.transferId})`,
      referenceType: 'BloodTransfer',
      referenceId: transfer._id,
    });

    // Add to destination branch
    const d = new Date();
    d.setDate(d.getDate() + 35); // remaining shelf life approximation
    await addToInventory({
      bloodGroup: transfer.bloodGroup,
      component: transfer.component,
      quantity: transfer.quantity,
      branchId: transfer.toBranch,
      expiryDate: d,
      performedBy: req.user.id,
      reason: `Transfer received from branch (${transfer.transferId})`,
      referenceType: 'BloodTransfer',
      referenceId: transfer._id,
    });

    transfer.status = 'completed';
    transfer.approvedBy = req.user.id;
    transfer.approvedAt = new Date();
    transfer.completedAt = new Date();
    await transfer.save();

    await NotificationService.notifyTransfer(transfer, 'accepted');

    await AuditLog.create({
      actionType: 'transfer_accept',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'BloodTransfer',
      targetId: transfer._id,
      newData: { status: 'completed' },
      ipAddress: req.clientIp,
      description: `Transfer ${transfer.transferId} accepted and completed`,
    });

    emitToBranch(transfer.fromBranch.toString(), 'transfer:completed', { transferId: transfer._id });
    emitToAdmins('transfer:completed', { transferId: transfer._id });

    res.status(200).json({ success: true, data: transfer, message: 'Transfer completed. Inventories updated.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject transfer
// @route   PUT /api/transfers/:id/reject
// @access  Private (Admin, Branch Admin of destination)
export const rejectTransfer = async (req, res, next) => {
  try {
    const transfer = await BloodTransfer.findById(req.params.id);
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });

    transfer.status = 'rejected';
    transfer.rejectionReason = req.body.rejectionReason || 'Not specified';
    transfer.approvedBy = req.user.id;
    transfer.approvedAt = new Date();
    await transfer.save();

    await NotificationService.notifyTransfer(transfer, 'rejected');

    await AuditLog.create({
      actionType: 'transfer_reject',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      targetType: 'BloodTransfer',
      targetId: transfer._id,
      newData: { status: 'rejected', rejectionReason: transfer.rejectionReason },
      ipAddress: req.clientIp,
      description: `Transfer ${transfer.transferId} rejected`,
    });

    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transfers
// @route   GET /api/transfers
// @access  Private (Admin, Branch Admin)
export const getTransfers = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    if (req.user.role !== 'admin' && req.user.branchId) {
      filter.$or = [{ fromBranch: req.user.branchId }, { toBranch: req.user.branchId }];
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await BloodTransfer.countDocuments(filter);
    const transfers = await BloodTransfer.find(filter)
      .populate('fromBranch', 'name address.city')
      .populate('toBranch', 'name address.city')
      .populate('requestedBy', 'name')
      .populate('approvedBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, total, count: transfers.length, data: transfers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transfer
// @route   GET /api/transfers/:id
// @access  Private
export const getTransfer = async (req, res, next) => {
  try {
    const transfer = await BloodTransfer.findById(req.params.id)
      .populate('fromBranch', 'name address')
      .populate('toBranch', 'name address')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name');

    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};
