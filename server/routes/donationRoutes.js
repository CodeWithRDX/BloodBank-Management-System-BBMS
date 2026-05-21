import express from 'express';
import { getDonations, getDonation, getMyDonations, createDonation, updateDonation } from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-donations', protect, authorize('donor'), getMyDonations);
router.route('/')
  .get(protect, authorize('admin', 'staff'), getDonations)
  .post(protect, authorize('admin', 'staff'), createDonation);
router.route('/:id')
  .get(protect, getDonation)
  .put(protect, authorize('admin', 'staff'), updateDonation);

export default router;
