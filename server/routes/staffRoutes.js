import express from 'express';
import {
  addStaff, getStaff, getStaffMember,
  updateStaff, removeStaff, assignBranch,
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'branch_admin'), getStaff);
router.post('/', protect, authorize('admin'), addStaff);
router.get('/:id', protect, authorize('admin', 'branch_admin'), getStaffMember);
router.put('/:id', protect, authorize('admin'), updateStaff);
router.delete('/:id', protect, authorize('admin'), removeStaff);
router.put('/:id/assign-branch', protect, authorize('admin'), assignBranch);

export default router;
