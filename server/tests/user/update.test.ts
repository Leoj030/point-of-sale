import updateUser from '../../src/controllers/user/update';
import bcrypt from 'bcryptjs';
import userModel from '../../src/models/user.model';
import Roles from '../../src/models/roles.model';
import StatusModel from '../../src/models/status.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';
import statusEnum from '../../src/enums/status';

// Mock external modules
jest.mock('bcryptjs');
jest.mock('../../src/models/user.model');
jest.mock('../../src/models/roles.model');
jest.mock('../../src/models/status.model');
jest.mock('../../src/utils/apiResponse');

describe('updateUser', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {
            params: { id: 'testUserId' },
            body: {},
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

    it('should return 200 and success response on successful update of name', async () => {
        const updatedUserData = { name: 'Updated Name' };
        const mockUpdatedUser = { _id: 'testUserId', ...updatedUserData };

        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);
        (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'User updated successfully', data: { id: 'testUserId' } });

        mockRequest.body = updatedUserData;

        await updateUser(mockRequest, mockResponse);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'testUserId',
            updatedUserData,
            { new: true, runValidators: true }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'User updated successfully', data: { id: 'testUserId' } });
        expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should hash password if provided and update user', async () => {
        const updatedUserData = { password: 'newPassword' };
        const hashedPassword = 'hashedNewPassword';
        const mockUpdatedUser = { _id: 'testUserId', password: hashedPassword };

        (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);
        (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'User updated successfully', data: { id: 'testUserId' } });

        mockRequest.body = updatedUserData;

        await updateUser(mockRequest, mockResponse);

        expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 12);
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'testUserId',
            { password: hashedPassword },
            { new: true, runValidators: true }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'User updated successfully', data: { id: 'testUserId' } });
    });

    it('should update user role if provided and role exists', async () => {
        const updatedUserData = { role: 'admin' };
        const mockRole = { _id: 'adminRoleId', name: 'admin' };
        const mockUpdatedUser = { _id: 'testUserId', role: 'adminRoleId' };

        (Roles.findOne as jest.Mock).mockResolvedValue(mockRole);
        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);
        (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'User updated successfully', data: { id: 'testUserId' } });

        mockRequest.body = updatedUserData;

        await updateUser(mockRequest, mockResponse);

        expect(Roles.findOne).toHaveBeenCalledWith({ name: 'admin' });
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'testUserId',
            { role: 'adminRoleId' },
            { new: true, runValidators: true }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'User updated successfully', data: { id: 'testUserId' } });
    });

    it('should return 400 if provided role does not exist', async () => {
        const updatedUserData = { role: 'nonExistentRole' };

        (Roles.findOne as jest.Mock).mockResolvedValue(null);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Role not found.' });

        mockRequest.body = updatedUserData;

        await updateUser(mockRequest, mockResponse);

        expect(Roles.findOne).toHaveBeenCalledWith({ name: 'nonexistentrole' });
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Role not found.' });
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should update user status if isActive is provided', async () => {
        const updatedUserData = { isActive: true };
        const mockStatus = { _id: 'activeStatusId', name: 'active' };
        const mockUpdatedUser = { _id: 'testUserId', status: 'activeStatusId' };

        (StatusModel.findOne as jest.Mock).mockResolvedValue(mockStatus);
        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);
        (successResponse as jest.Mock).mockReturnValue({ success: true, message: 'User updated successfully', data: { id: 'testUserId' } });

        mockRequest.body = updatedUserData;

        await updateUser(mockRequest, mockResponse);

        expect(StatusModel.findOne).toHaveBeenCalledWith({ name: statusEnum.ACTIVE });
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
            'testUserId',
            { status: 'activeStatusId' },
            { new: true, runValidators: true }
        );
        expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'User updated successfully', data: { id: 'testUserId' } });
    });

    it('should return 400 if provided status does not exist', async () => {
        const updatedUserData = { isActive: true };

        (StatusModel.findOne as jest.Mock).mockResolvedValue(null);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Status not found.' });

        mockRequest.body = updatedUserData;

        await updateUser(mockRequest, mockResponse);

        expect(StatusModel.findOne).toHaveBeenCalledWith({ name: statusEnum.ACTIVE });
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Status not found.' });
        expect(userModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 404 if user to update is not found', async () => {
        (userModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'User not found' });

        mockRequest.body = { name: 'Updated Name' };

        await updateUser(mockRequest, mockResponse);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should return 500 on internal server error', async () => {
        (userModel.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));
        (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error, please try again later.' });

        mockRequest.body = { name: 'Updated Name' };

        await updateUser(mockRequest, mockResponse);

        expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error, please try again later.' });
    });
});
