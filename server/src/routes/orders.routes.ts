import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
} from '../controllers/inventory/order.controller.js';
import { createOrderValidator, updateOrderStatusValidator } from '../validators/order.validator.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';

const router = Router();

// All order routes require authentication (cashier or admin)
router.use(isAuthenticated);

router.post('/', createOrderValidator, createOrder);
router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.put('/:orderId/status', updateOrderStatusValidator, updateOrderStatus);
router.delete('/:orderId', deleteOrder);

export default router;
