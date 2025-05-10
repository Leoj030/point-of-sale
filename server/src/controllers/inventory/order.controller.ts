import { Response } from 'express';
import Order from '../../models/order.model.js';
import Product from '../../models/product.model.js';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { validationResult } from 'express-validator';
import { OrderStatus } from '../../enums/status.js';
import { AuthenticatedRequest } from '../../interfaces/authMiddleware.js';

export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
        res.status(401).json(errorResponse('Authentication required'));
        return;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json(errorResponse('Validation failed', errors.array()));
        return;
    }
    try {
        const { items, orderType, paymentMethod } = req.body;

        for (const item of items) {
            const product = await Product.findById(item.id);

            if (!product) {
                res.status(400).json(errorResponse(`Product with ID ${item.id} not found.`));
                return;
            }

            if (product.quantity < item.quantity) {
                res.status(400).json(errorResponse(`Insufficient stock for product: ${product.name}. Available: ${product.quantity}, Ordered: ${item.quantity}`));
                return;
            }
        }

        const productUpdates = [];
        for (const item of items) {
            
            const updatedProduct = await Product.findByIdAndUpdate(
                item.id,
                { $inc: { quantity: -item.quantity } },
                { new: true } 
            );
            if (!updatedProduct) {
            
                res.status(500).json(errorResponse(`Failed to update quantity for product ID ${item.id} after stock check.`));
                return;
            }
            productUpdates.push(updatedProduct);
        }

        const order = await Order.create({
            orderId: uuidv4(),
            items,
            orderType,
            paymentMethod,
            status: OrderStatus.Pending,
            createdBy: req.user._id,
        });
        res.status(201).json(successResponse('Order created', order));
    } catch (err) {
        res.status(500).json(errorResponse('Server error', err));
    }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find().populate('createdBy', 'username').lean();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const filteredOrders = orders.map(({ _id, __v, ...rest }) => rest);
        res.json(successResponse('Orders fetched', filteredOrders));
    } catch (err) {
        res.status(500).json(errorResponse('Server error', err));
    }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId }).populate('createdBy', 'username').lean();
        if (!order) {
            res.status(404).json(errorResponse('Order not found'));
            return;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _id, __v, ...orderWithoutMongoId } = order;
        res.json(successResponse('Order fetched', orderWithoutMongoId));
    } catch (err) {
        res.status(500).json(errorResponse('Server error', err));
    }
};

export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json(errorResponse('Validation failed', errors.array()));
        return;
    }
    try {
        const { status } = req.body;
        const order = await Order.findOneAndUpdate(
            { orderId: req.params.orderId },
            { status },
            { new: true }
        );
        if (!order) {
            res.status(404).json(errorResponse('Order not found'));
            return;
        }
        res.json(successResponse('Order status updated', order));
    } catch (err) {
        res.status(500).json(errorResponse('Server error', err));
    }
};

export const deleteOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const order = await Order.findOneAndDelete({ orderId: req.params.orderId });
        if (!order) {
            res.status(404).json(errorResponse('Order not found'));
            return;
        }
        res.json(successResponse('Order deleted', order));
    } catch (err) {
        res.status(500).json(errorResponse('Server error', err));
    }
};
