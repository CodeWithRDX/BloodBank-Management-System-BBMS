import express from 'express';
import { getHospitals, getHospital, getMyHospitalProfile, createHospital, updateHospital, deleteHospital } from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-profile', protect, authorize('hospital'), getMyHospitalProfile);
router.route('/')
  .get(protect, authorize('admin', 'staff'), getHospitals)
  .post(protect, authorize('admin'), createHospital);
router.route('/:id')
  .get(protect, getHospital)
  .put(protect, authorize('admin'), updateHospital)
  .delete(protect, authorize('admin'), deleteHospital);

export default router;
