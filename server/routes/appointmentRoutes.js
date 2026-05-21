import express from 'express';
import { getAppointments, getMyAppointments, createAppointment, updateAppointment, cancelAppointment } from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-appointments', protect, getMyAppointments);
router.route('/')
  .get(protect, authorize('admin', 'staff'), getAppointments)
  .post(protect, authorize('donor'), createAppointment);
router.route('/:id')
  .put(protect, updateAppointment);
router.put('/:id/cancel', protect, cancelAppointment);

export default router;
