import express from 'express';
import { protect } from '../middleware/auth.js';
import { addClient } from '../utils/sseManager.js';

const router = express.Router();

// Establish keep-alive Server-Sent Events stream for authenticated clients
router.get('/', protect, addClient);

export default router;
