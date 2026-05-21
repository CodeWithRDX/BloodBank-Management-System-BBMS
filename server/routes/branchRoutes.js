import express from 'express';
import {
  registerBranch, getBranches, getBranch,
  approveBranch, rejectBranch, updateBranchStatus,
  updateBranch, getPublicBranches,
} from '../controllers/branchController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', getPublicBranches);
router.get('/', protect, authorize('admin'), getBranches);
router.post('/', protect, registerBranch);
router.get('/:id', protect, getBranch);
router.put('/:id', protect, authorize('admin', 'branch_admin'), updateBranch);
router.put('/:id/approve', protect, authorize('admin'), approveBranch);
router.put('/:id/reject', protect, authorize('admin'), rejectBranch);
router.put('/:id/status', protect, authorize('admin'), updateBranchStatus);

export default router;
