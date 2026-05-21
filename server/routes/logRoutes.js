import express from 'express';
import {
  getInventoryLogs, getInventoryLogStats,
  getAuditLogs, getAuditLogSummary,
} from '../controllers/logController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/inventory', protect, authorize('admin', 'staff', 'branch_admin'), getInventoryLogs);
router.get('/inventory/stats', protect, authorize('admin'), getInventoryLogStats);
router.get('/audit', protect, authorize('admin'), getAuditLogs);
router.get('/audit/summary', protect, authorize('admin'), getAuditLogSummary);

export default router;
