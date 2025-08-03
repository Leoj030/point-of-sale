
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../src/controllers/inventory/product.controller';
import Product from '../../src/models/product.model';
import { successResponse, errorResponse } from '../../src/utils/apiResponse';

// Mock the models
jest.mock('../../src/models/product.model');

// Mock the response utilities
jest.mock('../../src/utils/apiResponse', () => ({
    successResponse: jest.fn((message, data) => ({ message, data })),
    errorResponse: jest.fn((message, error) => ({ message, error })),
}));

describe('Product Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
        req = {
            query: {},
            body: {},
            params: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        // Suppress console.error logs
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        // Restore console.error
        consoleErrorSpy.mockRestore();
    });

    describe('getProducts', () => {
        it('should return products successfully', async () => {
            const products = [{ name: 'Product 1' }, { name: 'Product 2' }];
            (Product.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(products),
            });

            await getProducts(req as Request, res as Response);

            expect(res.json).toHaveBeenCalledWith(successResponse("Products fetched successfully", products));
        });

        it('should handle invalid category ID', async () => {
            req.query = { categoryId: 'invalid-id' };

            await getProducts(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(errorResponse("Invalid category ID format"));
        });

        it('should handle errors', async () => {
            (Product.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                lean: jest.fn().mockRejectedValue(new Error('Test Error')),
            });

            await getProducts(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(errorResponse("Internal server error, please try again later."));
        });
    });

    describe('createProduct', () => {
        it('should create a product successfully', async () => {
            const newProduct = { name: 'New Product' };
            req.body = newProduct;
            (Product.create as jest.Mock).mockResolvedValue({
                ...newProduct,
                populate: jest.fn().mockResolvedValue(newProduct),
            });

            await createProduct(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(successResponse("Product created successfully", expect.any(Object)));
        });

        it('should handle validation errors', async () => {
            const error = new mongoose.Error.ValidationError();
            (Product.create as jest.Mock).mockRejectedValue(error);

            await createProduct(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(errorResponse("Validation failed", error.errors));
        });
    });

    describe('updateProduct', () => {
        it('should update a product successfully', async () => {
            const updatedProduct = { name: 'Updated Product' };
            req.params = { id: 'some-id' };
            req.body = updatedProduct;
            (Product.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(updatedProduct),
            });

            await updateProduct(req as Request, res as Response);

            expect(res.json).toHaveBeenCalledWith(successResponse("Product updated successfully", updatedProduct));
        });

        it('should return 404 if product not found', async () => {
            req.params = { id: 'some-id' };
            (Product.findByIdAndUpdate as jest.Mock).mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await updateProduct(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(errorResponse("Product not found"));
        });
    });

    describe('deleteProduct', () => {
        it('should delete a product successfully', async () => {
            req.params = { id: 'some-id' };
            (Product.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: 'some-id' });

            await deleteProduct(req as Request, res as Response);

            expect(res.json).toHaveBeenCalledWith(successResponse("Product deleted successfully", { id: 'some-id' }));
        });

        it('should return 404 if product not found', async () => {
            req.params = { id: 'some-id' };
            (Product.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

            await deleteProduct(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(errorResponse("Product not found"));
        });
    });
});
