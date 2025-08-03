import register from '../../src/controllers/user/register';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../../src/models/user.model';
import Roles from '../../src/models/roles.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';

// Mock external modules
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../src/models/user.model');
jest.mock('../../src/models/roles.model');
jest.mock('../../src/utils/apiResponse');

// Mock tokenVar as it's a local module with constants
jest.mock('../../src/controllers/auth/tokenVar', () => ({
    EXPIRE_AT: '1h',
}));

describe('register', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {
            body: {
                name: 'Test User',
                username: 'testuser',
                password: 'testpassword',
                role: 'admin',
            },
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
        process.env.JWT_SECRET_KEY = 'test_secret_key';
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        delete process.env.JWT_SECRET_KEY;
        consoleErrorSpy.mockRestore();
    });

    it('should return 200 and a success response on successful registration', async () => {
        const hashedPassword = 'hashedpassword';
        const mockRole = { _id: 'roleId', name: 'admin' };
        const mockUser = {
            _id: 'userId',
            name: 'Test User',
            username: 'testuser',
            password: hashedPassword,
            role: 'roleId',
            tokenVersion: 1,
            save: jest.fn().mockResolvedValue(true),
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (Roles.findOne as jest.Mock).mockResolvedValue(mockRole);
        (userModel.create as jest.Mock).mockResolvedValue(mockUser);
        (jwt.sign as jest.Mock).mockReturnValue('mockToken');
        (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'User registered successfully' });

        await register(mockRequest, mockResponse);

        expect(bcrypt.hash).toHaveBeenCalledWith('testpassword', 12);
        expect(Roles.findOne).toHaveBeenCalledWith({ name: 'admin' });
        expect(userModel.create).toHaveBeenCalledWith({
            name: 'Test User',
            username: 'testuser',
            password: hashedPassword,
            role: 'roleId',
        });
        expect(mockUser.save).toHaveBeenCalled();
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 'userId', tokenVersion: 1 },
            'test_secret_key',
            { expiresIn: '1h' }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'User registered successfully' });
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 if role is not found', async () => {
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
        (Roles.findOne as jest.Mock).mockResolvedValue(null);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Role not found.' });

        await register(mockRequest, mockResponse);

        expect(Roles.findOne).toHaveBeenCalledWith({ name: 'admin' });
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Role not found.' });
        expect(userModel.create).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 500 if JWT_SECRET_KEY is not defined', async () => {
        delete process.env.JWT_SECRET_KEY;
        const hashedPassword = 'hashedpassword';
        const mockRole = { _id: 'roleId', name: 'admin' };
        const mockUser = {
            _id: 'userId',
            name: 'Test User',
            username: 'testuser',
            password: hashedPassword,
            role: 'roleId',
            tokenVersion: 1,
            save: jest.fn().mockResolvedValue(true),
        };

        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (Roles.findOne as jest.Mock).mockResolvedValue(mockRole);
        (userModel.create as jest.Mock).mockResolvedValue(mockUser);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error, please try again later.' });

        await register(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error, please try again later.' });
        expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
        (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing error'));
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error, please try again later.' });

        await register(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error, please try again later.' });
        expect(Roles.findOne).not.toHaveBeenCalled();
        expect(userModel.create).not.toHaveBeenCalled();
        expect(jwt.sign).not.toHaveBeenCalled();
    });
});
