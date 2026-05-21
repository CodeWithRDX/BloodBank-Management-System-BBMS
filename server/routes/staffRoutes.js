import express from 'express';
import {
  addStaff, getStaff, getStaffMember,
  updateStaff, removeStaff, assignBranch,
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'branch_admin', 'staff'), getStaff);
router.post('/', protect, authorize('admin', 'branch_admin', 'staff'), addStaff);
router.get('/:id', protect, authorize('admin', 'branch_admin', 'staff'), getStaffMember);
router.put('/:id', protect, authorize('admin', 'branch_admin', 'staff'), updateStaff);
router.delete('/:id', protect, authorize('admin', 'branch_admin', 'staff'), removeStaff);
router.put('/:id/assign-branch', protect, authorize('admin'), assignBranch);

export default router;
