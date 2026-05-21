import express from 'express';
import {
  getAnalyticsOverview, getMonthlyDonations,
  getRequestStats, getBranchPerformance,
  getInventoryTrends, getCampAnalytics,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin', 'branch_admin'));

router.get('/overview', getAnalyticsOverview);
router.get('/donations/monthly', getMonthlyDonations);
router.get('/requests/stats', getRequestStats);
router.get('/branches/performance', getBranchPerformance);
router.get('/inventory/trends', getInventoryTrends);
router.get('/camps', getCampAnalytics);

export default router;
