import express from 'express';
import {
  createCamp, getCamps, getCamp, updateCamp, cancelCamp,
  registerForCamp, getCampRegistrations, getMyRegistrations,
  updateRegistrationStatus, getAllRegistrations,
} from '../controllers/campController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateCamp } from '../middleware/validate.js';

const router = express.Router();

// Camps
router.get('/', getCamps);
router.post('/', protect, authorize('admin', 'staff', 'branch_admin'), validateCamp, createCamp);
router.get('/my-registrations', protect, authorize('donor'), getMyRegistrations);
router.get('/:id', getCamp);
router.put('/:id', protect, authorize('admin', 'staff', 'branch_admin'), updateCamp);
router.put('/:id/cancel', protect, authorize('admin', 'staff', 'branch_admin'), cancelCamp);

// Registrations
router.get('/registrations/all', protect, authorize('admin', 'staff', 'branch_admin'), getAllRegistrations);
router.post('/:id/register', protect, authorize('donor'), registerForCamp);
router.get('/:id/registrations', protect, authorize('admin', 'staff', 'branch_admin'), getCampRegistrations);
router.put('/registrations/:id/status', protect, authorize('admin', 'staff', 'branch_admin'), updateRegistrationStatus);


export default router;
