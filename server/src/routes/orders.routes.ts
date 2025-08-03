import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    deleteOrder,
    deleteAllOrders
} from '../controllers/inventory/order.controller';
import { createOrderValidator } from '../validators/order.validator';
import { checkRole, isAuthenticated } from '../middleware/auth.middleware';
import roles from '../enums/roles';

const router = Router();

// All order routes require authentication (cashier or admin)
router.use(isAuthenticated);

router.post('/', createOrderValidator, createOrder);
router.get('/', getOrders);
router.get('/:orderId', getOrderById);

router.delete('/:orderId', deleteOrder);
router.delete('/', checkRole(roles.ADMIN), deleteAllOrders); // Add this route for deleting all orders

export default router;
