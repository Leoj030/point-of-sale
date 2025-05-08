import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Product from '../../models/product.model.js';
import { IProduct } from '../../interfaces/product.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const { categoryId, sort } = req.query as { categoryId?: string; sort?: string };

        const filter: mongoose.FilterQuery<IProduct> = {};

        if (categoryId && categoryId.toLowerCase() !== 'all' && categoryId !== '') {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                res.status(400).json(errorResponse("Invalid category ID format"));
                return;
            }
            filter.category = categoryId;
        }

        const sortOrder = sort?.toLowerCase() === 'alpha-desc' ? -1 : 1;
        const sortOptions: { [key: string]: 1 | -1 } = { name: sortOrder };

        const products = await Product.find(filter)
        .sort(sortOptions)
        .lean();

        res.json(successResponse("Products fetched successfully", products));
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json(errorResponse("Internal server error, please try again later."));
    }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, description, price, imageUrl, category, quantity } = req.body;

        const newProductData: Partial<IProduct> = {
            name,
            description,
            price,
            imageUrl,
            category,
            quantity,
            // isActive defaults to true
        };

        const newProduct = await Product.create(newProductData);

        await newProduct.populate('category', 'name');

        res.status(201).json(successResponse("Product created successfully", newProduct));
    } catch (error) {
        console.error("Error creating product:", error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json(errorResponse("Validation failed", error.errors));
        } else {
            res.status(500).json(errorResponse("Internal server error updating product"));
        }
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        
        const updateData = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category', 'name');

        if (!updatedProduct) {
            res.status(404).json(errorResponse("Product not found"));
            return;
        }

        res.json(successResponse("Product updated successfully", updatedProduct));
    } catch (error) {
        console.error("Error updating product:", error);
        
        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json(errorResponse("Validation failed", error.errors));
        } else {
            res.status(500).json(errorResponse("Internal server error updating product"));
        }
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            res.status(404).json(errorResponse("Product not found"));
            return;
        }

        res.json(successResponse("Product deleted successfully", { id: deletedProduct._id }));
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json(errorResponse("Internal server error deleting product"));
    }
};