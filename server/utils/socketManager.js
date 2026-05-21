/**
 * socketManager.js
 * Centralized Socket.IO emission utilities.
 * Import `getIO()` anywhere in the server to emit real-time events.
 */

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

// ─── Emission Helpers ────────────────────────────────────────────────────────

/**
 * Emit to all connected admin clients
 */
export const emitToAdmins = (event, data) => {
  if (!_io) return;
  _io.to('room:admins').emit(event, data);
};

/**
 * Emit to all staff/admin in a specific branch
 */
export const emitToBranch = (branchId, event, data) => {
  if (!_io) return;
  _io.to(`room:branch:${branchId}`).emit(event, data);
};

/**
 * Emit to a specific user by userId
 */
export const emitToUser = (userId, event, data) => {
  if (!_io) return;
  _io.to(`room:user:${userId}`).emit(event, data);
};

/**
 * Broadcast inventory update to admins + relevant branch
 */
export const broadcastInventoryUpdate = (branchId, inventorySummary) => {
  if (!_io) return;
  emitToAdmins('inventory:updated', { branchId, summary: inventorySummary });
  if (branchId) {
    emitToBranch(branchId, 'inventory:updated', { branchId, summary: inventorySummary });
  }
};

/**
 * Broadcast a new notification in real-time
 */
export const emitNotification = (userId, notification) => {
  if (!_io) return;
  if (userId) {
    emitToUser(userId, 'notification:new', notification);
  }
  // Also push to admins room for admin-targeted notifications
  emitToAdmins('notification:new', notification);
};

/**
 * Broadcast low-stock alert to admins and branch
 */
export const emitLowStockAlert = (branchId, bloodGroup, quantity) => {
  if (!_io) return;
  const payload = { branchId, bloodGroup, quantity, timestamp: new Date() };
  emitToAdmins('inventory:low_stock', payload);
  if (branchId) {
    emitToBranch(branchId, 'inventory:low_stock', payload);
  }
};

/**
 * Emit blood request update
 */
export const emitRequestUpdate = (userId, branchId, request) => {
  if (!_io) return;
  emitToUser(userId, 'request:updated', request);
  emitToAdmins('request:updated', request);
  if (branchId) {
    emitToBranch(branchId, 'request:updated', request);
  }
};

/**
 * Emit camp registration event
 */
export const emitCampRegistration = (branchId, registration) => {
  if (!_io) return;
  emitToAdmins('camp:registration', registration);
  if (branchId) {
    emitToBranch(branchId, 'camp:registration', registration);
  }
};

/**
 * Emit branch status change (approval/rejection/suspension)
 */
export const emitBranchStatusChange = (branchId, status) => {
  if (!_io) return;
  _io.to(`room:branch:${branchId}`).emit('branch:status_changed', { branchId, status });
  emitToAdmins('branch:status_changed', { branchId, status });
};
