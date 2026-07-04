/**
 * socketManager.js
 * Centralized Socket.IO emission utilities + SSE redirection.
 * Import `getIO()` anywhere in the server to emit real-time events.
 * Redundant one-way alerts are redirected to Server-Sent Events (sseManager).
 */

import { sendToAdmins, sendToBranch, sendToUser, sendToAll } from './sseManager.js';

let _io = null;

/**
 * Initialize with the Socket.IO server instance (called once in server.js)
 */
export const initSocket = (io) => {
  _io = io;
};

/**
 * Get the Socket.IO instance (throws if not initialized)
 */
export const getIO = () => {
  if (!_io) throw new Error('Socket.IO not initialized');
  return _io;
};

// ─── SSE Emission Redirection Helpers ────────────────────────────────────────

/**
 * Emit to all connected admin clients via SSE
 */
export const emitToAdmins = (event, data) => {
  sendToAdmins(event, data);
};

/**
 * Emit to all staff/admin in a specific branch via SSE
 */
export const emitToBranch = (branchId, event, data) => {
  sendToBranch(branchId, event, data);
};

/**
 * Emit to a specific user by userId via SSE
 */
export const emitToUser = (userId, event, data) => {
  sendToUser(userId, event, data);
};

/**
 * Broadcast inventory update to admins + relevant branch via SSE
 */
export const broadcastInventoryUpdate = (branchId, inventorySummary) => {
  sendToAdmins('inventory:updated', { branchId, summary: inventorySummary });
  if (branchId) {
    sendToBranch(branchId, 'inventory:updated', { branchId, summary: inventorySummary });
  }
};

/**
 * Broadcast a new notification in real-time via SSE
 */
export const emitNotification = (userId, notification) => {
  if (userId) {
    sendToUser(userId, 'notification:new', notification);
  }
  // Also push to admins room for admin-targeted notifications
  sendToAdmins('notification:new', notification);
};

/**
 * Broadcast low-stock alert to admins and branch via SSE
 */
export const emitLowStockAlert = (branchId, bloodGroup, quantity) => {
  const payload = { branchId, bloodGroup, quantity, timestamp: new Date() };
  sendToAdmins('inventory:low_stock', payload);
  if (branchId) {
    sendToBranch(branchId, 'inventory:low_stock', payload);
  }
};

/**
 * Emit blood request update via SSE
 */
export const emitRequestUpdate = (userId, branchId, request) => {
  sendToUser(userId, 'request:updated', request);
  sendToAdmins('request:updated', request);
  if (branchId) {
    sendToBranch(branchId, 'request:updated', request);
  }
};

/**
 * Emit camp registration event via SSE
 */
export const emitCampRegistration = (branchId, registration) => {
  sendToAdmins('camp:registration', registration);
  if (branchId) {
    sendToBranch(branchId, 'camp:registration', registration);
  }
};

/**
 * Emit branch status change (approval/rejection/suspension) via SSE
 */
export const emitBranchStatusChange = (branchId, status) => {
  sendToBranch(branchId, 'branch:status_changed', { branchId, status });
  sendToAdmins('branch:status_changed', { branchId, status });
};
