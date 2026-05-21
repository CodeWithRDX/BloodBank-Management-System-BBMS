import express from 'express';
import {
  getNearbyBranches, getBloodBankMap,
  getNearbyCamps, getNearestBranchForRequest,
} from '../controllers/geoController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public geo endpoints
router.get('/nearby', getNearbyBranches);
router.get('/map', getBloodBankMap);
router.get('/camps', getNearbyCamps);
router.get('/nearest-branch', protect, getNearestBranchForRequest);

export default router;
