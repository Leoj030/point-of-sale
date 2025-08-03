import deleteUser from '../../src/controllers/user/delete';
import userModel from '../../src/models/user.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';

// Mock external modules
jest.mock('../../src/models/user.model');
jest.mock('../../src/utils/apiResponse');

describe('deleteUser', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {
            params: {},
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should return 200 on successful deletion', async () => {
        const deletedUser = { _id: '1' };
        (userModel.findByIdAndDelete as jest.Mock).mockResolvedValue(deletedUser);
        (successResponse as jest.Mock).mockReturnValue({ success: true, data: { id: '1' } });

        mockRequest.params = { id: '1' };

        await deleteUser(mockRequest, mockResponse);

        expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('1');
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: { id: '1' } });
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 404 if user not found', async () => {
        (userModel.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'User not found' });

        mockRequest.params = { id: 'nonExistentId' };

        await deleteUser(mockRequest, mockResponse);

        expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('nonExistentId');
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return 500 on internal server error', async () => {
        (userModel.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Database error'));
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error deleting product' });

        mockRequest.params = { id: '1' };

        await deleteUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error deleting product' });
    });
});
