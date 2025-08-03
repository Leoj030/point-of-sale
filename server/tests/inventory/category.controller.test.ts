import { getCategories, createCategory, updateCategory, deleteCategory } from '../../src/controllers/inventory/category.controller';
import Category from '../../src/models/category.model';
import Product from '../../src/models/product.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';
import mongoose from 'mongoose';

// Mock external modules
jest.mock('../../src/models/category.model');
jest.mock('../../src/models/product.model');
jest.mock('../../src/utils/apiResponse');

describe('Category Controller', () => {
    let mockRequest: any;
    let mockResponse: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        mockRequest = {};
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

    describe('getCategories', () => {
        it('should return 200 and categories on successful fetch', async () => {
            const mockCategories = [{ _id: '1', name: 'Category 1' }, { _id: '2', name: 'Category 2' }];
            (Category.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockCategories),
            });
            (successResponse as jest.Mock).mockReturnValue({ success: true, data: mockCategories });

            await getCategories(mockRequest, mockResponse);

            expect(Category.find).toHaveBeenCalled();
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: mockCategories });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 404 if no categories are found', async () => {
            (Category.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(null),
            });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Categories not found' });

            await getCategories(mockRequest, mockResponse);

            expect(Category.find).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Categories not found' });
        });

        it('should return 500 on internal server error', async () => {
            (Category.find as jest.Mock).mockImplementation(() => {
                throw new Error('Database error');
            });
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error, please try again later.' });

            await getCategories(mockRequest, mockResponse);

            expect(Category.find).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error, please try again later.' });
        });
    });

    describe('createCategory', () => {
        it('should return 201 and new category on successful creation', async () => {
            const newCategoryData = { name: 'New Category', imageUrl: 'image.jpg' };
            const createdCategory = { _id: '3', ...newCategoryData };
            (Category.create as jest.Mock).mockResolvedValue(createdCategory);
            (successResponse as jest.Mock).mockReturnValue({ success: true, data: createdCategory });

            mockRequest.body = newCategoryData;

            await createCategory(mockRequest, mockResponse);

            expect(Category.create).toHaveBeenCalledWith(newCategoryData);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: createdCategory });
        });

        it('should return 400 on validation error', async () => {
            const newCategoryData = { name: '', imageUrl: 'image.jpg' };
            const validationError = new mongoose.Error.ValidationError();
            validationError.errors = { name: { message: 'Path `name` is required.' } as any };

            (Category.create as jest.Mock).mockRejectedValue(validationError);
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Validation failed', errors: validationError.errors });

            mockRequest.body = newCategoryData;

            await createCategory(mockRequest, mockResponse);

            expect(Category.create).toHaveBeenCalledWith(newCategoryData);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Validation failed', errors: validationError.errors });
        });

        it('should return 500 on internal server error', async () => {
            (Category.create as jest.Mock).mockRejectedValue(new Error('Database error'));
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error creating category' });

            mockRequest.body = { name: 'New Category', imageUrl: 'image.jpg' };

            await createCategory(mockRequest, mockResponse);

            expect(Category.create).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error creating category' });
        });
    });

    describe('updateCategory', () => {
        it('should return 200 and updated category on successful update', async () => {
            const updatedCategoryData = { name: 'Updated Category', imageUrl: 'updated_image.jpg' };
            const updatedCategory = { _id: '1', ...updatedCategoryData };
            (Category.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedCategory);
            (successResponse as jest.Mock).mockReturnValue({ success: true, data: updatedCategory });

            mockRequest.params = { id: '1' };
            mockRequest.body = updatedCategoryData;

            await updateCategory(mockRequest, mockResponse);

            expect(Category.findByIdAndUpdate).toHaveBeenCalledWith(
                '1',
                updatedCategoryData,
                { new: true, runValidators: true }
            );
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: updatedCategory });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 404 if category not found', async () => {
            (Category.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Category not found' });

            mockRequest.params = { id: 'nonExistentId' };
            mockRequest.body = { name: 'Updated Category' };

            await updateCategory(mockRequest, mockResponse);

            expect(Category.findByIdAndUpdate).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Category not found' });
        });

        it('should return 400 on validation error', async () => {
            const validationError = new mongoose.Error.ValidationError();
            validationError.errors = { name: { message: 'Path `name` is required.' } as any };

            (Category.findByIdAndUpdate as jest.Mock).mockRejectedValue(validationError);
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Update failed: Validation error or duplicate name.' });

            mockRequest.params = { id: '1' };
            mockRequest.body = { name: '', imageUrl: 'image.jpg' };

            await updateCategory(mockRequest, mockResponse);

            expect(Category.findByIdAndUpdate).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Update failed: Validation error or duplicate name.' });
        });

        it('should return 400 on duplicate key error', async () => {
            const duplicateKeyError = new Error('Duplicate key error');
            (duplicateKeyError as any).code = 11000; // Simulate duplicate key error

            (Category.findByIdAndUpdate as jest.Mock).mockRejectedValue(duplicateKeyError);
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Update failed: Validation error or duplicate name.' });

            mockRequest.params = { id: '1' };
            mockRequest.body = { name: 'Existing Category' };

            await updateCategory(mockRequest, mockResponse);

            expect(Category.findByIdAndUpdate).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Update failed: Validation error or duplicate name.' });
        });

        it('should return 500 on internal server error', async () => {
            (Category.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error updating category' });

            mockRequest.params = { id: '1' };
            mockRequest.body = { name: 'Updated Category' };

            await updateCategory(mockRequest, mockResponse);

            expect(Category.findByIdAndUpdate).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error updating category' });
        });
    });

    describe('deleteCategory', () => {
        it('should return 200 on successful deletion', async () => {
            (Product.countDocuments as jest.Mock).mockResolvedValue(0);
            (Category.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: '1' });
            (successResponse as jest.Mock).mockReturnValue({ success: true, data: { id: '1' } });

            mockRequest.params = { id: '1' };

            await deleteCategory(mockRequest, mockResponse);

            expect(Product.countDocuments).toHaveBeenCalledWith({ category: '1' });
            expect(Category.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: { id: '1' } });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should return 400 if products are associated with the category', async () => {
            (Product.countDocuments as jest.Mock).mockResolvedValue(5);
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Cannot delete category: 5 product(s) are using it.' });

            mockRequest.params = { id: '1' };

            await deleteCategory(mockRequest, mockResponse);

            expect(Product.countDocuments).toHaveBeenCalledWith({ category: '1' });
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Cannot delete category: 5 product(s) are using it.' });
            expect(Category.findByIdAndDelete).not.toHaveBeenCalled();
        });

        it('should return 404 if category not found', async () => {
            (Product.countDocuments as jest.Mock).mockResolvedValue(0);
            (Category.findByIdAndDelete as jest.Mock).mockResolvedValue(null);
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Category not found' });

            mockRequest.params = { id: 'nonExistentId' };

            await deleteCategory(mockRequest, mockResponse);

            expect(Product.countDocuments).toHaveBeenCalledWith({ category: 'nonExistentId' });
            expect(Category.findByIdAndDelete).toHaveBeenCalledWith('nonExistentId');
            expect(mockResponse.status).toHaveBeenCalledWith(404);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Category not found' });
        });

        it('should return 500 on internal server error', async () => {
            (Product.countDocuments as jest.Mock).mockRejectedValue(new Error('Database error'));
            (errorResponse as jest.Mock).mockReturnValue({ success: false, message: 'Internal server error deleting category' });

            mockRequest.params = { id: '1' };

            await deleteCategory(mockRequest, mockResponse);

            expect(Product.countDocuments).toHaveBeenCalledWith({ category: '1' });
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Internal server error deleting category' });
            expect(Category.findByIdAndDelete).not.toHaveBeenCalled();
        });
    });
});
