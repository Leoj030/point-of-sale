import { Request, Response } from 'express';
import Order from '../models/order.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns';

const getTotalSales = async (start: Date, end: Date) => {
    const orders = await Order.find({
        createdAt: { $gte: start, $lte: end },
        status: 'Completed',
    });
    return orders.reduce((sum, order) => {
        return sum + order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
    }, 0);
};

export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const todayTotal = await getTotalSales(startOfDay(now), endOfDay(now));
        const weekTotal = await getTotalSales(startOfWeek(now), endOfWeek(now));
        const monthTotal = await getTotalSales(startOfMonth(now), endOfMonth(now));
        res.json(successResponse('Sales report fetched', {
            today: todayTotal,
            thisWeek: weekTotal,
            thisMonth: monthTotal,
        }));
    } catch (err) {
        res.status(500).json(errorResponse('Server error', err));
    }
};
