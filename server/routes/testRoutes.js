import express from 'express';
import { getTestReports, getTestReport, createTestReport, updateTestReport } from '../controllers/testController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'staff'), getTestReports)
  .post(protect, authorize('admin', 'staff'), createTestReport);
router.route('/:id')
  .get(protect, getTestReport)
  .put(protect, authorize('admin', 'staff'), updateTestReport);

export default router;
