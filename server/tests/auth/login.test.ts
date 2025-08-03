import login from '../../src/controllers/auth/login';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../../src/models/user.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';

// Mock external modules
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/models/user.model');
jest.mock('../../src/utils/apiResponse');

// Mock tokenVar as it's a local module with constants
jest.mock('../../src/controllers/auth/tokenVar', () => ({
    MAX_AGE: 1,
    EXPIRE_AT: '1h',
}));

describe('login', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {
            body: {
                username: 'testuser',
                password: 'testpassword',
            },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Set JWT_SECRET_KEY for tests
        process.env.JWT_SECRET_KEY = 'test_secret_key';
        // Suppress console.error logs
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        delete process.env.JWT_SECRET_KEY;
        // Restore console.error
        consoleErrorSpy.mockRestore();
    });

    it('should return 200 and a success response on successful login', async () => {
        const mockUser = {
            _id: 'someUserId',
            username: 'testuser',
            password: 'hashedpassword',
            tokenVersion: 1,
        };

        (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue('mockToken');
        (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'Login successful', data: { token: 'mockToken' } });

        await login(mockRequest, mockResponse);

        expect(userModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(bcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 'someUserId', tokenVersion: 1 },
            'test_secret_key',
            { expiresIn: '1h' }
        );
        expect(mockResponse.cookie).toHaveBeenCalledWith('token', 'mockToken', expect.any(Object));
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Login successful', data: { token: 'mockToken' } });
        expect(mockResponse.status).not.toHaveBeenCalled(); // Should not set status for success
    });

    it('should return 400 and an error response for invalid username', async () => {
        (userModel.findOne as jest.Mock).mockResolvedValue(null);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Invalid credentials' });

        await login(mockRequest, mockResponse);

        expect(userModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should return 400 and an error response for invalid password', async () => {
        const mockUser = {
            _id: 'someUserId',
            username: 'testuser',
            password: 'hashedpassword',
            tokenVersion: 1,
        };

        (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Invalid credentials' });

        await login(mockRequest, mockResponse);

        expect(userModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(bcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Invalid credentials' });
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should return 500 and an error response if JWT_SECRET_KEY is not defined', async () => {
        delete process.env.JWT_SECRET_KEY; // Simulate missing environment variable
        const mockUser = {
            _id: 'someUserId',
            username: 'testuser',
            password: 'hashedpassword',
            tokenVersion: 1,
        };

        (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error, please try again later.' });

        await login(mockRequest, mockResponse);

        expect(userModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(bcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error, please try again later.' });
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should return 500 and an error response on internal server error', async () => {
        (userModel.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error, please try again later.' });

        await login(mockRequest, mockResponse);

        expect(userModel.findOne).toHaveBeenCalledWith({ username: 'testuser' });
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error, please try again later.' });
        expect(bcrypt.compare).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
        expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
});
