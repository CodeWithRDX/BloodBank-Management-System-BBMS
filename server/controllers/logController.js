import InventoryLog from '../models/InventoryLog.js';
import AuditLog from '../models/AuditLog.js';

// ─── INVENTORY LOGS ───────────────────────────────────────────────────────────

// @desc    Get inventory logs
// @route   GET /api/logs/inventory
// @access  Private (Admin, Staff)
export const getInventoryLogs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.operationType) filter.operationType = req.query.operationType;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    // Branch staff can only see their branch logs
    if (req.user.role !== 'admin' && req.user.branchId) {
      filter.branchId = req.user.branchId;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await InventoryLog.countDocuments(filter);
    const logs = await InventoryLog.find(filter)
      .populate('branchId', 'name address.city')
      .populate('performedBy', 'name role')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      count: logs.length,
      pagination: { page, limit, totalPages: Math.ceil(total / limit) },
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get inventory log stats
// @route   GET /api/logs/inventory/stats
// @access  Private (Admin)
export const getInventoryLogStats = async (req, res, next) => {
  try {
    const stats = await InventoryLog.aggregate([
      {
        $group: {
          _id: '$operationType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byBloodGroup = await InventoryLog.aggregate([
      { $match: { operationType: { $in: ['addition', 'subtraction'] } } },
      {
        $group: {
          _id: { bloodGroup: '$bloodGroup', operationType: '$operationType' },
          totalQuantity: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.bloodGroup': 1 } },
    ]);

    res.status(200).json({ success: true, data: { byOperationType: stats, byBloodGroup } });
  } catch (error) {
    next(error);
  }
};

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

// @desc    Get audit logs
// @route   GET /api/logs/audit
// @access  Private (Admin only)
export const getAuditLogs = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.actionType) filter.actionType = req.query.actionType;
    if (req.query.actor) filter.actor = req.query.actor;
    if (req.query.branchId) filter.branchId = req.query.branchId;
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('actor', 'name email role')
      .populate('branchId', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      count: logs.length,
      pagination: { page, limit, totalPages: Math.ceil(total / limit) },
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit log summary
// @route   GET /api/logs/audit/summary
// @access  Private (Admin)
export const getAuditLogSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalToday, byAction, recentLogins] = await Promise.all([
      AuditLog.countDocuments({ createdAt: { $gte: today } }),
      AuditLog.aggregate([
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      AuditLog.find({ actionType: 'user_login' })
        .populate('actor', 'name email role')
        .sort('-createdAt')
        .limit(10),
    ]);

    res.status(200).json({ success: true, data: { totalToday, byAction, recentLogins } });
  } catch (error) {
    next(error);
  }
};
