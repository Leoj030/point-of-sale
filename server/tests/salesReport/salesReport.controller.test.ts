import { getSalesReport } from '../../src/controllers/salesReport.controller';
import Order from '../../src/models/order.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns';

// Mock external modules
jest.mock('../../src/models/order.model');
jest.mock('../../src/utils/apiResponse');
jest.mock('date-fns', () => ({
    startOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0)),
    endOfDay: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59)),
    startOfWeek: jest.fn((date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
        return new Date(d.setDate(diff));
    }),
    endOfWeek: jest.fn((date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() + (7 - day); // Adjust to Sunday
        return new Date(d.setDate(diff));
    }),
    startOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth(), 1)),
    endOfMonth: jest.fn((date) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)),
}));

describe('Sales Report Controller', () => {
    let mockRequest: any;
    let mockResponse: any;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();

        // Mock Order.find to return a chainable object with then and catch
        (Order.find as jest.Mock).mockResolvedValue([]);
    });

    it('should return 200 and sales report data on successful fetch', async () => {
        const mockOrders = [
            { items: [{ price: 10, quantity: 1 }, { price: 20, quantity: 2 }] }, // Total 50
            { items: [{ price: 5, quantity: 3 }] }, // Total 15
        ];

        // Mock Order.find for each call within getSalesReport
        (Order.find as jest.Mock)
            .mockResolvedValueOnce(mockOrders) // For todayTotal
            .mockResolvedValueOnce(mockOrders) // For weekTotal
            .mockResolvedValueOnce(mockOrders); // For monthTotal

        (successResponse as jest.Mock).mockReturnValue({ success: true, data: { today: 65, thisWeek: 65, thisMonth: 65 } });

        await getSalesReport(mockRequest, mockResponse);

        expect(Order.find).toHaveBeenCalledTimes(3);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: { today: 65, thisWeek: 65, thisMonth: 65 } });
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
        (Order.find as jest.Mock).mockRejectedValue(new Error('Database error'));
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Server error', details: 'Database error' });

        await getSalesReport(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Server error', details: 'Database error' });
    });
});
