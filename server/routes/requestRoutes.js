import express from 'express';
import {
  getRequests,
  getRequest,
  getMyRequests,
  createRequest,
  updateRequestStatus,
  createPublicEmergencyRequest,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateBloodRequest } from '../middleware/validate.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/my-requests', protect, getMyRequests);
router.route('/')
  .get(protect, authorize('admin', 'staff'), getRequests)
  .post(protect, authorize('hospital', 'admin'), validateBloodRequest, createRequest);

router.post(
  '/public-emergency',
  upload.fields([
    { name: 'medicalReport', maxCount: 1 },
    { name: 'governmentId', maxCount: 1 },
  ]),
  createPublicEmergencyRequest
);

router.route('/:id')
  .get(protect, getRequest)
  .put(protect, authorize('admin', 'staff'), updateRequestStatus);

export default router;
