import express from 'express';
import { getDonors, getDonor, getMyDonorProfile, createDonor, updateDonor, deleteDonor, checkEligibility } from '../controllers/donorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-profile', protect, authorize('donor'), getMyDonorProfile);
router.get('/:id/eligibility', protect, checkEligibility);
router.route('/')
  .get(protect, authorize('admin', 'staff'), getDonors)
  .post(protect, authorize('admin', 'staff'), createDonor);
router.route('/:id')
  .get(protect, getDonor)
  .put(protect, updateDonor)
  .delete(protect, authorize('admin'), deleteDonor);

export default router;
