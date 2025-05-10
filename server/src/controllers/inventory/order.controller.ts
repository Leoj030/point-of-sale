import { Response } from 'express';
import Order from '../../models/order.model.js';
import Product from '../../models/product.model.js';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { validationResult } from 'express-validator';
import { OrderStatus } from '../../enums/status.js';
import { AuthenticatedRequest } from '../../interfaces/authMiddleware.js';
import { OrderItemSnapshot } from '../../interfaces/order.js';

// Define interface for incoming request items
interface RequestItem {
    id: string;
    quantity: number;
}

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
        // Explicitly type the destructured items from req.body
        const { items, orderType, paymentMethod, amountPaid }: { items: RequestItem[], orderType: string, paymentMethod: string, amountPaid: number } = req.body;

        if (typeof amountPaid !== 'number' || amountPaid < 0) {
            res.status(400).json(errorResponse('Invalid amountPaid. Must be a non-negative number.'));
            return;
        }

        let totalAmount = 0;
        const orderItemsSnapshots: OrderItemSnapshot[] = [];

        for (const item of items) { // item is now RequestItem
            const product = await Product.findById(item.id);

            if (!product) {
                res.status(404).json(errorResponse(`Product with ID ${item.id} not found.`));
                return;
            }

            if (product.quantity < item.quantity) {
                res.status(400).json(errorResponse(`Insufficient stock for product: ${product.name}. Available: ${product.quantity}, Ordered: ${item.quantity}`));
                return;
            }

            totalAmount += product.price * item.quantity;
            orderItemsSnapshots.push({
                id: product._id.toString(),
                productName: product.name,
                price: product.price,
                quantity: item.quantity,
            });
        }

        if (amountPaid < totalAmount) {
            res.status(400).json(errorResponse(`Insufficient payment. Total: ${totalAmount}, Paid: ${amountPaid}`));
            return;
        }

        const changeGiven = amountPaid - totalAmount;

        // Decrement stock after all checks pass
        for (const itemSnapshot of orderItemsSnapshots) {
            // Removed the unused 'productToUpdate' variable and its lookup logic
            const updatedProduct = await Product.findByIdAndUpdate(
                itemSnapshot.id, 
                { $inc: { quantity: -itemSnapshot.quantity } },
                { new: true } 
            );
            if (!updatedProduct) {
                res.status(500).json(errorResponse(`Failed to update quantity for product ID ${itemSnapshot.id}. Product may have been modified or deleted.`));
                return;
            }
        }

        const order = await Order.create({
            orderId: uuidv4(),
            items: orderItemsSnapshots, 
            totalAmount, 
            amountPaid,  
            changeGiven, 
            orderType,
            paymentMethod,
            status: OrderStatus.Pending, 
            createdBy: req.user._id,
        });

        // Construct the specific response data expected by the frontend
        const responseData = {
            orderId: order.orderId, 
            changeGiven: order.changeGiven
        };

        res.status(201).json(successResponse('Order created successfully', responseData));
    } catch (err: unknown) { 
        console.error('Error creating order:', err); 
        // Provide a default message if err is not an Error instance or message is not available
        const message = (err instanceof Error && err.message) ? err.message : 'An unexpected error occurred';
        res.status(500).json(errorResponse('Server error while creating order', message));
    }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const orders = await Order.find().populate('createdBy', 'username').lean();
        // Remove _id and __v from each order object
        const filteredOrders = orders.map((order) => {
            const filtered = { ...order };
            // @ts-expect-error: _id may not be optional, but we want to remove it for the response
            delete filtered._id;
            // @ts-expect-error: __v may not be optional, but we want to remove it for the response
            delete filtered.__v;
            return filtered;
        });
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
        // Remove _id and __v from the order object
        const orderWithoutMongoId = { ...order };
        // @ts-expect-error: _id may not be optional, but we want to remove it for the response
        delete orderWithoutMongoId._id;
        // @ts-expect-error: __v may not be optional, but we want to remove it for the response
        delete orderWithoutMongoId.__v;
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

export const deleteAllOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const result = await Order.deleteMany({});
        res.json(successResponse('All orders deleted', { deletedCount: result.deletedCount }));
    } catch (err) {
        res.status(500).json(errorResponse('Server error while deleting all orders', err));
    }
};
