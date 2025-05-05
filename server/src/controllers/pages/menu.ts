// src/controllers/menu.controller.ts
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from 'src/models/categoryModel.ts';
import Product from 'src/models/productModel.ts';
import { IProduct } from 'src/interfaces/product.ts';
import { successResponse, errorResponse } from 'src/utils/apiResponse.ts';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean();

        if (!categories) {
            res.status(404).json(errorResponse("Categories not found"));
            return;
        }

        res.status(200).json(successResponse("Categories fetched successfully", categories));
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json(errorResponse("Internal server error, please try again later."));
    }
};

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

        res.status(200).json(successResponse("Products fetched successfully", products));
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json(errorResponse("Internal server error, please try again later."));
    }
};