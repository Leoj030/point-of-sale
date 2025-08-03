import logout from '../../src/controllers/auth/logout';
import userModel from '../../src/models/user.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';

// Mock external modules
jest.mock('../../src/models/user.model');
jest.mock('../../src/utils/apiResponse');

describe('logout', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {
            user: { _id: 'someUserId' }, // Simulate authenticated user
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            clearCookie: jest.fn(),
        };
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should clear the token cookie and increment tokenVersion on successful logout', async () => {
        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({});
        (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'Logout successful' });

        await logout(mockRequest, mockResponse);

        expect(mockResponse.clearCookie).toHaveBeenCalledWith('token', expect.any(Object));
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('someUserId', { $inc: { tokenVersion: 1 } });
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Logout successful' });
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
        mockRequest.user = undefined; // Simulate unauthenticated user
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Authentication required for logout' });

        await logout(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Authentication required for logout' });
        expect(mockResponse.clearCookie).not.toHaveBeenCalled();
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 500 on internal server error', async () => {
        (userModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error, please try again later.' });

        await logout(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error, please try again later.' });
        expect(mockResponse.clearCookie).toHaveBeenCalled(); // clearCookie is called before the error occurs
        expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
    });
});
