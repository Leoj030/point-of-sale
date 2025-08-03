import { Response } from 'express';
import Order from '../models/order.model';
import { AuthenticatedRequest } from '../interfaces/authMiddleware';
import { successResponse, errorResponse } from '../utils/apiResponse';

// Placeholder for store details
const STORE_DETAILS = {
    name: "Store POS",
    address: "123 ST, City, Country",
    contact: "(555) 123-4567",
    tin: "000-000-000-000 VAT REG"
};

export const generateReceipt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { orderId } = req.params;

        if (!req.user) {
            res.status(401).json(errorResponse('Authentication required'));
            return;
        }

        const order = await Order.findOne({ orderId }).lean();

        if (!order) {
            res.status(404).json(errorResponse('Order not found'));
            return;
        }

        // Remove the check for 'Completed' status to allow fetching for 'Pending' orders
        // The frontend will handle updating the status to 'Completed' upon successful receipt view
        // if (order.status !== OrderStatus.Completed) {
        //     res.status(403).json(errorResponse('Receipt can only be generated for completed orders.'));
        //     return;
        // }

        // Construct receipt data
        const receiptData = {
            storeDetails: STORE_DETAILS,
            orderId: order.orderId,
            createdAt: order.createdAt,
            items: order.items.map(item => ({
                productId: item.id,
                name: item.productName,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
            })),
            subTotal: order.totalAmount,
            totalAmount: order.totalAmount,
            amountPaid: order.amountPaid,
            changeGiven: order.changeGiven,
            paymentMethod: order.paymentMethod,
            servedBy: req.user.username,
            orderType: order.orderType,
        };

        res.status(200).json(successResponse('Receipt data generated', receiptData));

    } catch (err: unknown) {
        console.error('Error generating receipt:', err);
        const message = (err instanceof Error && err.message) ? err.message : 'An unexpected server error occurred';
        res.status(500).json(errorResponse('Server error while generating receipt', message));
    }
};
