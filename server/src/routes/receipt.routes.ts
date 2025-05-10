import { Router } from 'express';
import { generateReceipt } from '../controllers/receipt.controller.js';
import { isAuthenticated } from '../middleware/auth.middleware.js'; // Changed to isAuthenticated

const router = Router();

// GET /api/receipts/:orderId - Generate receipt for a specific order
router.get('/:orderId', isAuthenticated, generateReceipt); // Changed to isAuthenticated

export default router;
