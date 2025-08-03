import { generateReceipt } from '../../src/controllers/receipt.controller';
import Order from '../../src/models/order.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';

// Mock external modules
jest.mock('../../src/models/order.model');
jest.mock('../../src/utils/apiResponse');

describe('Receipt Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {
            params: {},
            user: { _id: 'testUserId', username: 'testUser' },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();

        // Suppress console.error logs
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore console.error
        consoleErrorSpy.mockRestore();
    });

    describe('generateReceipt', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Authentication required' });

            await generateReceipt(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
        });

        it('should return 404 if order is not found', async () => {
            mockRequest.params.orderId = 'nonExistentOrderId';
            (Order.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Order not found' });

            await generateReceipt(mockRequest, mockResponse);

            expect(Order.findOne).toHaveBeenCalledWith({ orderId: 'nonExistentOrderId' });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
        });

        it('should return 200 and receipt data on successful generation', async () => {
            const mockOrder = {
                orderId: 'testOrderId',
                createdAt: new Date(),
                items: [
                    { id: 'prod1', productName: 'Product 1', quantity: 2, price: 10 },
                    { id: 'prod2', productName: 'Product 2', quantity: 1, price: 20 },
                ],
                totalAmount: 40,
                amountPaid: 50,
                changeGiven: 10,
                paymentMethod: 'Cash',
                orderType: 'Dine-in',
            };
            mockRequest.params.orderId = 'testOrderId';
            (Order.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockOrder),
            });
            (successResponse as jest.Mock).mockImplementation((message, data) => ({ success: true, message, data }));

            await generateReceipt(mockRequest, mockResponse);

            expect(Order.findOne).toHaveBeenCalledWith({ orderId: 'testOrderId' });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: expect.objectContaining({
                    orderId: 'testOrderId',
                    items: expect.arrayContaining([
                        expect.objectContaining({ productId: 'prod1', name: 'Product 1', quantity: 2, price: 10, total: 20 }),
                        expect.objectContaining({ productId: 'prod2', name: 'Product 2', quantity: 1, price: 20, total: 20 }),
                    ]),
                    subTotal: 40,
                    totalAmount: 40,
                    amountPaid: 50,
                    changeGiven: 10,
                    paymentMethod: 'Cash',
                    servedBy: 'testUser',
                    orderType: 'Dine-in',
                }),
            }));
        });

        it('should return 500 on internal server error', async () => {
            mockRequest.params.orderId = 'testOrderId';
            (Order.findOne as jest.Mock).mockImplementation(() => {
                throw new Error('Database error');
            });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Server error while generating receipt', details: 'Database error' });

            await generateReceipt(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Server error while generating receipt', details: 'Database error' });
        });
    });
});
