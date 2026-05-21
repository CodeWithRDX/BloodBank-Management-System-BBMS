import express from 'express';
import { getAppointments, getMyAppointments, createAppointment, updateAppointment, cancelAppointment } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-appointments', protect, getMyAppointments);
router.route('/')
  .get(protect, authorize('admin', 'staff', 'branch_admin'), getAppointments)
  .post(protect, authorize('donor'), createAppointment);
router.route('/:id')
  .put(protect, authorize('admin', 'staff', 'branch_admin', 'donor'), updateAppointment);
router.put('/:id/cancel', protect, authorize('admin', 'staff', 'branch_admin', 'donor'), cancelAppointment);

export default router;
