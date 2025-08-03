import getUsers from '../../src/controllers/user/fetchUser';
import User from '../../src/models/user.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';
import mongoose from 'mongoose';

// Mock external modules
jest.mock('../../src/models/user.model');
jest.mock('../../src/utils/apiResponse');

describe('getUsers', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {
            query: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();

        // Suppress console.error logs
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // Mock mongoose.Types.ObjectId.isValid
        jest.spyOn(mongoose.Types.ObjectId, 'isValid').mockReturnValue(true);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        // Restore console.error
        consoleErrorSpy.mockRestore();
    });

    it('should return 200 and a list of users on successful fetch', async () => {
        const mockUsers = [
            { _id: 'user1', username: 'userA', role: { name: 'admin' }, status: { name: 'active' } },
            { _id: 'user2', username: 'userB', role: { name: 'staff' }, status: { name: 'inactive' } },
        ];
        (User.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockUsers),
        });
        (successResponse as jest.Mock).mockReturnValue({ success: true, data: expect.any(Array) });

        await getUsers(mockRequest, mockResponse);

        expect(User.find).toHaveBeenCalledWith({});
        expect(User.find().sort).toHaveBeenCalledWith({ name: 1 });
        expect(User.find().select).toHaveBeenCalledWith(['-password', '-__v', '-tokenVersion']);
        expect(User.find().populate).toHaveBeenCalledWith('role', 'name');
        expect(User.find().populate).toHaveBeenCalledWith('status', 'name');
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: [
                expect.objectContaining({ username: 'userA', role: 'ADMIN', status: 'active' }),
                expect.objectContaining({ username: 'userB', role: 'STAFF', status: 'inactive' }),
            ],
        }));
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should filter users by userId if provided and valid', async () => {
        mockRequest.query.userId = 'validUserId';
        const mockUsers = [{ _id: 'user1', username: 'userA', role: { name: 'admin' }, status: { name: 'active' } }];
        (User.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockUsers),
        });
        (successResponse as jest.Mock).mockReturnValue({ success: true, data: expect.any(Array) });

        await getUsers(mockRequest, mockResponse);

        expect(User.find).toHaveBeenCalledWith({ category: 'validUserId' }); // Note: The controller uses 'category' for userId filter
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: [expect.objectContaining({ username: 'userA' })],
        }));
    });

    it('should return 400 for invalid userId format', async () => {
        mockRequest.query.userId = 'invalidUserId';
        (mongoose.Types.ObjectId.isValid as jest.Mock).mockReturnValue(false);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Invalid user ID format' });

        await getUsers(mockRequest, mockResponse);

        expect(mongoose.Types.ObjectId.isValid).toHaveBeenCalledWith('invalidUserId');
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Invalid user ID format' });
        expect(User.find).not.toHaveBeenCalled();
    });

    it('should sort users by name descending when sort is alpha-desc', async () => {
        mockRequest.query.sort = 'alpha-desc';
        const mockUsers = [
            { _id: 'user2', username: 'userB', role: { name: 'staff' }, status: { name: 'inactive' } },
            { _id: 'user1', username: 'userA', role: { name: 'admin' }, status: { name: 'active' } },
        ];
        (User.find as jest.Mock).mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            populate: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockUsers),
        });
        (successResponse as jest.Mock).mockReturnValue({ success: true, data: expect.any(Array) });

        await getUsers(mockRequest, mockResponse);

        expect(User.find().sort).toHaveBeenCalledWith({ name: -1 });
        expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: [
                expect.objectContaining({ username: 'userB' }),
                expect.objectContaining({ username: 'userA' }),
            ],
        }));
    });

    it('should return 500 on internal server error', async () => {
        (User.find as jest.Mock).mockImplementation(() => {
            throw new Error('Database error');
        });
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error, please try again later.' });

        await getUsers(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error, please try again later.' });
    });
});
