import express from 'express';
import {
  initiateTransfer, acceptTransfer, rejectTransfer,
  getTransfers, getTransfer,
} from '../controllers/transferController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'branch_admin', 'staff'), getTransfers);
router.post('/', protect, authorize('admin', 'branch_admin'), initiateTransfer);
router.get('/:id', protect, getTransfer);
router.put('/:id/accept', protect, authorize('admin', 'branch_admin'), acceptTransfer);
router.put('/:id/reject', protect, authorize('admin', 'branch_admin'), rejectTransfer);

export default router;
