import express from 'express';
import { getInventory, getInventorySummary, addInventory, updateInventory, deleteInventory, getExpiredInventory, getLowStock } from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', getInventorySummary);
router.get('/expired', protect, authorize('admin', 'staff'), getExpiredInventory);
router.get('/low-stock', protect, authorize('admin', 'staff'), getLowStock);
router.route('/')
  .get(getInventory)
  .post(protect, authorize('admin', 'staff'), addInventory);
router.route('/:id')
  .put(protect, authorize('admin', 'staff'), updateInventory)
  .delete(protect, authorize('admin'), deleteInventory);

export default router;
