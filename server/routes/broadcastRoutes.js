import express from 'express';
import { createBroadcast, getBroadcasts } from '../controllers/broadcastController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .post(createBroadcast)
  .get(getBroadcasts);

export default router;
