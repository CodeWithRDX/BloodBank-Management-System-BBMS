import express from 'express';
import { getDashboardStats, getUsers, updateUser, deleteUser } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.route('/users').get(getUsers);
router.route('/users/:id').put(updateUser).delete(deleteUser);

export default router;
