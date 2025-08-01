import { Router } from 'express';
import { generateReceipt } from '../controllers/receipt.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/receipts/:orderId - Generate receipt for a specific order
router.get('/:orderId', isAuthenticated, generateReceipt);

export default router;
