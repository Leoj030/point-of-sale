import { createOrder, getOrders, getOrderById, deleteOrder, deleteAllOrders } from '../../src/controllers/inventory/order.controller';
import Order from '../../src/models/order.model';
import Product from '../../src/models/product.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';
import { validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';

// Mock external modules
jest.mock('../../src/models/order.model');
jest.mock('../../src/models/product.model');
jest.mock('../../src/utils/apiResponse');
jest.mock('express-validator');
jest.mock('uuid');

describe('Order Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {
            user: { _id: 'testUserId' },
            body: {},
            params: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
        (uuidv4 as jest.Mock).mockReturnValue('mock-order-id');
        (validationResult as unknown as jest.Mock).mockReturnValue({
            isEmpty: () => true,
            array: () => [],
        });
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('createOrder', () => {
        it('should return 401 if user is not authenticated', async () => {
            mockRequest.user = undefined;
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Authentication required' });

            await createOrder(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required' });
        });

        it('should return 400 if validation fails', async () => {
            (validationResult as unknown as jest.Mock).mockReturnValue({
                isEmpty: () => false,
                array: () => [{ msg: 'Validation error' }],
            });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Validation failed', errors: [{ msg: 'Validation error' }] });

            await createOrder(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Validation failed', errors: [{ msg: 'Validation error' }] });
        });

        it('should return 400 for invalid amountPaid', async () => {
            mockRequest.body = { items: [], orderType: 'dine_in', paymentMethod: 'cash', amountPaid: -10 };
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Invalid amountPaid. Must be a non-negative number.' });

            await createOrder(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Invalid amountPaid. Must be a non-negative number.' });
        });

        it('should return 404 if a product is not found', async () => {
            mockRequest.body = {
                items: [{ id: 'nonExistentProductId', productName: 'Test Product', price: 10, quantity: 1 }],
                orderType: 'dine_in', paymentMethod: 'cash', amountPaid: 10
            };
            (Product.findById as jest.Mock).mockResolvedValue(null);
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Product with ID nonExistentProductId not found.' });

            await createOrder(mockRequest, mockResponse);

            expect(Product.findById).toHaveBeenCalledWith('nonExistentProductId');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Product with ID nonExistentProductId not found.' });
        });

        it('should return 400 for insufficient stock', async () => {
            mockRequest.body = {
                items: [{ id: 'productId1', productName: 'Test Product', price: 10, quantity: 5 }],
                orderType: 'dine_in', paymentMethod: 'cash', amountPaid: 50
            };
            (Product.findById as jest.Mock).mockResolvedValue({ _id: 'productId1', name: 'Test Product', quantity: 2 });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Insufficient stock for product: Test Product. Available: 2, Ordered: 5' });

            await createOrder(mockRequest, mockResponse);

            expect(Product.findById).toHaveBeenCalledWith('productId1');
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Insufficient stock for product: Test Product. Available: 2, Ordered: 5' });
        });

        it('should return 400 for insufficient payment', async () => {
            mockRequest.body = {
                items: [{ id: 'productId1', productName: 'Test Product', price: 10, quantity: 1 }],
                orderType: 'dine_in', paymentMethod: 'cash', amountPaid: 5
            };
            (Product.findById as jest.Mock).mockResolvedValue({ _id: 'productId1', name: 'Test Product', quantity: 10 });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Insufficient payment. Total: 10, Paid: 5' });

            await createOrder(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Insufficient payment. Total: 10, Paid: 5' });
        });

        it('should create an order and return 201 on success', async () => {
            const mockProduct = { _id: 'productId1', name: 'Test Product', price: 10, quantity: 10 };
            const mockOrder = {
                orderId: 'mock-order-id',
                items: [{ id: 'productId1', productName: 'Test Product', price: 10, quantity: 1 }],
                totalAmount: 10,
                amountPaid: 10,
                changeGiven: 0,
                orderType: 'dine_in',
                paymentMethod: 'cash',
                createdBy: 'testUserId',
            };

            mockRequest.body = {
                items: [{ id: 'productId1', productName: 'Test Product', price: 10, quantity: 1 }],
                orderType: 'dine_in', paymentMethod: 'cash', amountPaid: 10
            };

            (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
            (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue({ ...mockProduct, quantity: 9 });
            (Order.create as jest.Mock).mockResolvedValue(mockOrder);
            (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'Order created successfully', data: { orderId: 'mock-order-id', changeGiven: 0 } });

            await createOrder(mockRequest, mockResponse);

            expect(Product.findById).toHaveBeenCalledWith('productId1');
            expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('productId1', { $inc: { quantity: -1 } }, { new: true });
            expect(Order.create).toHaveBeenCalledWith(expect.objectContaining({
                orderId: 'mock-order-id',
                totalAmount: 10,
                amountPaid: 10,
                changeGiven: 0,
                createdBy: 'testUserId',
            }));
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Order created successfully', data: { orderId: 'mock-order-id', changeGiven: 0 } });
        });

        it('should return 500 on internal server error during product quantity update', async () => {
            const mockProduct = { _id: 'productId1', name: 'Test Product', price: 10, quantity: 10 };

            mockRequest.body = {
                items: [{ id: 'productId1', productName: 'Test Product', price: 10, quantity: 1 }],
                orderType: 'dine_in', paymentMethod: 'cash', amountPaid: 10
            };

            (Product.findById as jest.Mock).mockResolvedValue(mockProduct);
            (Product.findByIdAndUpdate as jest.Mock).mockResolvedValue(null); // Simulate update failure
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Failed to update quantity for product ID productId1. Product may have been modified or deleted.' });

            await createOrder(mockRequest, mockResponse);

            expect(Product.findById).toHaveBeenCalledWith('productId1');
            expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('productId1', { $inc: { quantity: -1 } }, { new: true });
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Failed to update quantity for product ID productId1. Product may have been modified or deleted.' });
            expect(Order.create).not.toHaveBeenCalled();
        });

        it('should return 500 on general internal server error', async () => {
            mockRequest.body = {
                items: [{ id: 'productId1', productName: 'Test Product', price: 10, quantity: 1 }],
                orderType: 'dine_in', paymentMethod: 'cash', amountPaid: 10
            };
            (Product.findById as jest.Mock).mockRejectedValue(new Error('Database error'));
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Server error while creating order', details: 'Database error' });

            await createOrder(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Server error while creating order', details: 'Database error' });
        });
    });

    describe('getOrders', () => {
        it('should return 200 and a list of orders', async () => {
            const mockOrders = [
                { _id: 'orderId1', orderId: 'uuid1', createdBy: { _id: 'userId1', username: 'user1' }, __v: 0 },
                { _id: 'orderId2', orderId: 'uuid2', createdBy: { _id: 'userId2', username: 'user2' }, __v: 0 },
            ];
            (Order.find as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockOrders),
            });
            (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'Orders fetched', data: mockOrders.map(order => { const { _id, __v, ...rest } = order; return rest; }) });

            await getOrders(mockRequest, mockResponse);

            expect(Order.find).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Orders fetched', data: mockOrders.map(order => { const { _id, __v, ...rest } = order; return rest; }) });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 500 on internal server error', async () => {
            (Order.find as jest.Mock).mockImplementation(() => {
                throw new Error('Database error');
            });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Server error', details: 'Database error' });

            await getOrders(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Server error', details: 'Database error' });
        });
    });

    describe('getOrderById', () => {
        it('should return 200 and the order if found', async () => {
            const mockOrder = { _id: 'orderId1', orderId: 'uuid1', createdBy: { _id: 'userId1', username: 'user1' }, __v: 0 };
            mockRequest.params.orderId = 'uuid1';
            (Order.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockOrder),
            });
            (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'Order fetched', data: { orderId: 'uuid1', createdBy: { _id: 'userId1', username: 'user1' } } });

            await getOrderById(mockRequest, mockResponse);

            expect(Order.findOne).toHaveBeenCalledWith({ orderId: 'uuid1' });
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Order fetched', data: { orderId: 'uuid1', createdBy: { _id: 'userId1', username: 'user1' } } });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 404 if order is not found', async () => {
            mockRequest.params.orderId = 'nonExistentUuid';
            (Order.findOne as jest.Mock).mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(null),
            });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Order not found' });

            await getOrderById(mockRequest, mockResponse);

            expect(Order.findOne).toHaveBeenCalledWith({ orderId: 'nonExistentUuid' });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
        });

        it('should return 500 on internal server error', async () => {
            mockRequest.params.orderId = 'uuid1';
            (Order.findOne as jest.Mock).mockImplementation(() => {
                throw new Error('Database error');
            });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Server error', details: 'Database error' });

            await getOrderById(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Server error', details: 'Database error' });
        });
    });

    describe('deleteOrder', () => {
        it('should return 200 on successful deletion', async () => {
            const mockDeletedOrder = { orderId: 'uuid1' };
            mockRequest.params.orderId = 'uuid1';
            (Order.findOneAndDelete as jest.Mock).mockResolvedValue(mockDeletedOrder);
            (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'Order deleted', data: mockDeletedOrder });

            await deleteOrder(mockRequest, mockResponse);

            expect(Order.findOneAndDelete).toHaveBeenCalledWith({ orderId: 'uuid1' });
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Order deleted', data: mockDeletedOrder });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 404 if order not found', async () => {
            mockRequest.params.orderId = 'nonExistentUuid';
            (Order.findOneAndDelete as jest.Mock).mockResolvedValue(null);
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Order not found' });

            await deleteOrder(mockRequest, mockResponse);

            expect(Order.findOneAndDelete).toHaveBeenCalledWith({ orderId: 'nonExistentUuid' });
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Order not found' });
        });

        it('should return 500 on internal server error', async () => {
            mockRequest.params.orderId = 'uuid1';
            (Order.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('Database error'));
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Server error', details: 'Database error' });

            await deleteOrder(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Server error', details: 'Database error' });
        });
    });

    describe('deleteAllOrders', () => {
        it('should return 200 and deleted count on success', async () => {
            (Order.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 5 });
            (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'All orders deleted', data: { deletedCount: 5 } });

            await deleteAllOrders(mockRequest, mockResponse);

            expect(Order.deleteMany).toHaveBeenCalledWith({});
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'All orders deleted', data: { deletedCount: 5 } });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 500 on internal server error', async () => {
            (Order.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'));
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Server error while deleting all orders', details: 'Database error' });

            await deleteAllOrders(mockRequest, mockResponse);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Server error while deleting all orders', details: 'Database error' });
        });
    });
});