/**
 * inventoryService.js
 * Centralized inventory adjustment service.
 * All inventory changes MUST go through this service to ensure:
 * - Automatic logging (InventoryLog)
 * - Socket.IO real-time broadcasts
 * - Low-stock alerts
 */

import BloodInventory from '../models/BloodInventory.js';
import InventoryLog from '../models/InventoryLog.js';
import Branch from '../models/Branch.js';
import { broadcastInventoryUpdate, emitLowStockAlert } from '../utils/socketManager.js';

const LOW_STOCK_THRESHOLD = 5;

/**
 * Get aggregated stock for a blood group + branch
 */
export const getStockLevel = async (bloodGroup, branchId = null, component = 'whole_blood') => {
  if (!branchId) {
    const defaultBranch = await Branch.findOne();
    if (defaultBranch) {
      branchId = defaultBranch._id;
    }
  }

  const match = { status: 'available', bloodGroup, component };
  if (branchId) match.branchId = branchId;
  else match.branchId = null;

  const result = await BloodInventory.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$quantity' } } },
  ]);
  return result[0]?.total || 0;
};

/**
 * Add blood to inventory (on donation approval / transfer in)
 * Creates a new BloodInventory document and logs the operation.
 */
export const addToInventory = async ({
  bloodGroup,
  component = 'whole_blood',
  quantity,
  branchId = null,
  donationId = null,
  expiryDate = null,
  performedBy = null,
  reason = 'Blood donation',
  referenceType = 'Donation',
  referenceId = null,
}) => {
  // Resolve null/undefined branchId to the default branch if one exists
  if (!branchId) {
    const defaultBranch = await Branch.findOne();
    if (defaultBranch) {
      branchId = defaultBranch._id;
    }
  }

  // Calculate expiry if not provided (whole blood: 42 days, platelets: 5 days, plasma: 1 year)
  if (!expiryDate) {
    const d = new Date();
    const expiryDays = component === 'platelets' ? 5 : component === 'plasma' ? 365 : 42;
    d.setDate(d.getDate() + expiryDays);
    expiryDate = d;
  }

  const prevQty = await getStockLevel(bloodGroup, branchId, component);

  let inventoryItem = await BloodInventory.findOne({
    bloodGroup,
    component,
    branchId,
    status: 'available',
  });

  if (inventoryItem) {
    inventoryItem.quantity += quantity;
    if (expiryDate && expiryDate > inventoryItem.expiryDate) {
      inventoryItem.expiryDate = expiryDate;
    }
    await inventoryItem.save();
  } else {
    inventoryItem = await BloodInventory.create({
      bloodGroup,
      component,
      quantity,
      branchId,
      donationId,
      expiryDate,
      status: 'available',
    });
  }

  const updatedQty = prevQty + quantity;

  // Log the operation
  await InventoryLog.create({
    operationType: 'addition',
    bloodGroup,
    component,
    quantity,
    previousQuantity: prevQty,
    updatedQuantity: updatedQty,
    branchId,
    performedBy,
    reason,
    referenceType,
    referenceId,
    inventoryItemId: inventoryItem._id,
  });

  // Broadcast real-time update
  await broadcastRealTimeUpdate(bloodGroup, branchId);

  return inventoryItem;
};

/**
 * Subtract from inventory (on blood request approval / transfer out)
 * Marks specific inventory items as issued.
 */
export const subtractFromInventory = async ({
  bloodGroup,
  component = 'whole_blood',
  quantity,
  branchId = null,
  performedBy = null,
  reason = 'Blood issued',
  referenceType = 'BloodRequest',
  referenceId = null,
}) => {
  // Resolve null/undefined branchId to the default branch if one exists
  if (!branchId) {
    const defaultBranch = await Branch.findOne();
    if (defaultBranch) {
      branchId = defaultBranch._id;
    }
  }

  const prevQty = await getStockLevel(bloodGroup, branchId, component);

  if (prevQty < quantity) {
    throw new Error(`Insufficient stock. Available: ${prevQty}, Requested: ${quantity}`);
  }

  // Find available items (oldest first — FIFO)
  const match = { bloodGroup, component, status: 'available' };
  if (branchId) match.branchId = branchId;
  else match.branchId = null;

  const items = await BloodInventory.find(match)
    .sort({ expiryDate: 1 }) // FIFO: use expiring-soonest first
    .limit(20);

  let remaining = quantity;
  const usedItems = [];

  for (const item of items) {
    if (remaining <= 0) break;
    if (item.quantity <= remaining) {
      remaining -= item.quantity;
      item.status = 'issued';
      item.quantity = 0;
      await item.save();
      usedItems.push(item._id);
    } else {
      item.quantity -= remaining;
      remaining = 0;
      await item.save();
      usedItems.push(item._id);
    }
  }

  const updatedQty = prevQty - quantity;

  // Log
  await InventoryLog.create({
    operationType: 'subtraction',
    bloodGroup,
    component,
    quantity,
    previousQuantity: prevQty,
    updatedQuantity: updatedQty,
    branchId,
    performedBy,
    reason,
    referenceType,
    referenceId,
  });

  // Broadcast real-time update
  await broadcastRealTimeUpdate(bloodGroup, branchId);

  // Check for low stock
  if (updatedQty <= LOW_STOCK_THRESHOLD) {
    emitLowStockAlert(branchId?.toString(), bloodGroup, updatedQty);
  }

  return { usedItems, updatedQuantity: updatedQty };
};

/**
 * Manual inventory adjustment (admin correction)
 */
export const adjustInventory = async ({
  inventoryItemId,
  newQuantity,
  performedBy = null,
  reason = 'Manual adjustment',
}) => {
  const item = await BloodInventory.findById(inventoryItemId);
  if (!item) throw new Error('Inventory item not found');

  const prevQty = item.quantity;
  const diff = newQuantity - prevQty;
  item.quantity = newQuantity;
  await item.save();

  const branchLevel = await getStockLevel(item.bloodGroup, item.branchId, item.component);

  await InventoryLog.create({
    operationType: 'adjustment',
    bloodGroup: item.bloodGroup,
    component: item.component,
    quantity: Math.abs(diff),
    previousQuantity: prevQty,
    updatedQuantity: newQuantity,
    branchId: item.branchId,
    performedBy,
    reason,
    referenceType: 'Manual',
    inventoryItemId: item._id,
  });

  await broadcastRealTimeUpdate(item.bloodGroup, item.branchId);
  return item;
};

/**
 * Broadcast updated inventory summary via Socket.IO
 */
const broadcastRealTimeUpdate = async (bloodGroup, branchId) => {
  try {
    const match = { status: 'available' };
    if (branchId) match.branchId = branchId;
    else match.branchId = null;

    const summary = await BloodInventory.aggregate([
      { $match: match },
      { $group: { _id: '$bloodGroup', totalUnits: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } },
    ]);

    broadcastInventoryUpdate(branchId?.toString(), summary);
  } catch (err) {
    console.error('Real-time broadcast error:', err.message);
  }
};
