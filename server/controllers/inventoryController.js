import mongoose from 'mongoose';
import BloodInventory from '../models/BloodInventory.js';
import InventoryLog from '../models/InventoryLog.js';
import AuditLog from '../models/AuditLog.js';
import ApiFeatures from '../utils/ApiFeatures.js';
import { adjustInventory } from '../services/inventoryService.js';
import { broadcastInventoryUpdate } from '../utils/socketManager.js';
import Branch from '../models/Branch.js';
import Staff from '../models/Staff.js';
import StaffLog from '../models/StaffLog.js';

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


export const getInventory = async (req, res, next) => {
  try {
    const baseQuery = {};
    // Branch filter for staff
    if (req.user && req.user.role !== 'admin' && req.user.branchId) {
      baseQuery.branchId = req.user.branchId;
    }
    if (req.user && req.query.branchId && req.user.role === 'admin') {
      baseQuery.branchId = req.query.branchId;
    }
    if (!req.user && req.query.branchId) {
      baseQuery.branchId = req.query.branchId;
    }

    const totalCount = await BloodInventory.countDocuments(baseQuery);
    const features = new ApiFeatures(
      BloodInventory.find(baseQuery).populate('branchId', 'name address.city'),
      req.query
    ).filter().sort().paginate();
    const inventory = await features.query;
    res.status(200).json({
      success: true,
      count: inventory.length,
      total: totalCount,
      pagination: features.pagination,
      data: inventory,
    });
  } catch (error) { next(error); }
};

export const getInventorySummary = async (req, res, next) => {
  try {
    const match = { status: 'available' };
    
    let targetBranch = null;
    if (req.query.branchId) {
      targetBranch = req.query.branchId;
    } else if (req.user && req.user.role !== 'admin' && req.user.branchId) {
      targetBranch = req.user.branchId;
    }

    if (targetBranch) {
      try {
        match.branchId = new mongoose.Types.ObjectId(targetBranch);
      } catch (err) {
        match.branchId = targetBranch;
      }
    }

    const summary = await BloodInventory.aggregate([
      { $match: match },
      { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$quantity' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const fullSummary = allGroups.map((g) => {
      const found = summary.find((s) => s._id === g);
      return { bloodGroup: g, totalUnits: found ? found.totalUnits : 0, count: found ? found.count : 0 };
    });
    res.status(200).json({ success: true, data: fullSummary });
  } catch (error) { next(error); }
};

export const addInventory = async (req, res, next) => {
  try {
    const { bloodGroup, component, quantity, expiryDate, branchId, storageLocation } = req.body;

    if (!expiryDate) {
      const d = new Date();
      d.setDate(d.getDate() + (component === 'platelets' ? 5 : component === 'plasma' ? 365 : 42));
      req.body.expiryDate = d;
    }

    // Use branchId from user if staff, allow admin to specify
    let targetBranchId = req.user.role === 'admin' ? branchId : req.user.branchId;
    if (!targetBranchId) {
      const defaultBranch = await Branch.findOne();
      if (defaultBranch) {
        targetBranchId = defaultBranch._id;
      }
    }
    req.body.branchId = targetBranchId || null;

    const inventory = await BloodInventory.create(req.body);

    // Compute previous stock for log
    const prevStockResult = await BloodInventory.aggregate([
      { $match: { bloodGroup, status: 'available', branchId: targetBranchId || null, component: component || 'whole_blood' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } },
    ]);
    const prevQty = (prevStockResult[0]?.total || 0) - quantity;

    await InventoryLog.create({
      operationType: 'addition',
      bloodGroup,
      component: component || 'whole_blood',
      quantity,
      previousQuantity: Math.max(0, prevQty),
      updatedQuantity: prevStockResult[0]?.total || quantity,
      branchId: targetBranchId,
      performedBy: req.user.id,
      reason: req.body.reason || 'Manual inventory addition',
      referenceType: 'Manual',
      inventoryItemId: inventory._id,
    });

    await AuditLog.create({
      actionType: 'inventory_add',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: targetBranchId,
      targetType: 'BloodInventory',
      targetId: inventory._id,
      newData: { bloodGroup, component, quantity },
      ipAddress: req.clientIp,
      description: `Inventory added: ${quantity} units of ${bloodGroup}`,
    });

    await logStaffAction(req.user, targetBranchId, 'inventory_add', null, { bloodGroup, component, quantity }, req, `Inventory added: ${quantity} units of ${bloodGroup}`);

    broadcastInventoryUpdate(targetBranchId?.toString(), null);

    res.status(201).json({ success: true, data: inventory });
  } catch (error) { next(error); }
};

export const updateInventory = async (req, res, next) => {
  try {
    let item = await BloodInventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const oldData = { quantity: item.quantity, status: item.status };

    item = await BloodInventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    await AuditLog.create({
      actionType: 'inventory_update',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: item.branchId,
      targetType: 'BloodInventory',
      targetId: item._id,
      oldData,
      newData: req.body,
      ipAddress: req.clientIp,
      description: `Inventory item updated`,
    });

    await logStaffAction(req.user, item.branchId, 'inventory_update', oldData, req.body, req, `Inventory item updated`);

    broadcastInventoryUpdate(item.branchId?.toString(), null);
    res.status(200).json({ success: true, data: item });
  } catch (error) { next(error); }
};

export const deleteInventory = async (req, res, next) => {
  try {
    const item = await BloodInventory.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    await BloodInventory.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      actionType: 'inventory_delete',
      actor: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      branchId: item.branchId,
      targetType: 'BloodInventory',
      targetId: item._id,
      oldData: { bloodGroup: item.bloodGroup, quantity: item.quantity },
      ipAddress: req.clientIp,
      description: `Inventory item deleted`,
    });

    await logStaffAction(req.user, item.branchId, 'inventory_delete', { bloodGroup: item.bloodGroup, quantity: item.quantity }, null, req, `Inventory item deleted`);

    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
};

export const getExpiredInventory = async (req, res, next) => {
  try {
    const filter = { expiryDate: { $lt: new Date() }, status: { $ne: 'discarded' } };
    if (req.user.role !== 'admin' && req.user.branchId) filter.branchId = req.user.branchId;
    const expired = await BloodInventory.find(filter).populate('branchId', 'name');
    res.status(200).json({ success: true, count: expired.length, data: expired });
  } catch (error) { next(error); }
};

export const getLowStock = async (req, res, next) => {
  try {
    const threshold = parseInt(req.query.threshold) || 5;
    const match = { status: 'available' };
    if (req.user.role !== 'admin' && req.user.branchId) match.branchId = req.user.branchId;
    if (req.query.branchId && req.user.role === 'admin') match.branchId = req.query.branchId;

    const lowStock = await BloodInventory.aggregate([
      { $match: match },
      { $group: { _id: { bloodGroup: '$bloodGroup', branchId: '$branchId' }, totalUnits: { $sum: '$quantity' } } },
      { $match: { totalUnits: { $lte: threshold } } },
      { $sort: { totalUnits: 1 } },
    ]);
    res.status(200).json({ success: true, data: lowStock });
  } catch (error) { next(error); }
};
