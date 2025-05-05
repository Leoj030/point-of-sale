import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from 'src/models/category.model.ts';
import Product from 'src/models/product.model.ts';
import { successResponse, errorResponse } from 'src/utils/apiResponse.ts';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const categories = await Category.find().sort({ name: 1 }).lean();

        if (!categories) {
            res.status(404).json(errorResponse("Categories not found"));
            return;
        }

        res.json(successResponse("Categories fetched successfully", categories));
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json(errorResponse("Internal server error, please try again later."));
    }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        const newCategory = await Category.create({ name });

        res.status(201).json(successResponse("Category created successfully", newCategory));
    } catch (error) {
        console.error("Error creating category:", error);

        if (error instanceof mongoose.Error.ValidationError) {
            res.status(400).json(errorResponse("Validation failed", error.errors));
        } 
        else {
            res.status(500).json(errorResponse("Internal server error creating category"));
        }
    }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            res.status(404).json(errorResponse("Category not found"));
            return;
        }

        res.json(successResponse("Category updated successfully", updatedCategory));
    } catch (error: unknown) {
        console.error("Error updating category:", error);
            
        if (
            error instanceof mongoose.Error.ValidationError ||
            (typeof (error as { code?: number }).code === 'number' && (error as { code: number }).code === 11000)
        ) {
            res.status(400).json(errorResponse("Update failed: Validation error or duplicate name."));
        } else {
            res.status(500).json(errorResponse("Internal server error updating category"));
        }
    }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const productCount = await Product.countDocuments({ category: id });

        if (productCount > 0) {
            res.status(400).json(errorResponse(`Cannot delete category: ${productCount} product(s) are using it.`));
            return;
        }

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            res.status(404).json(errorResponse("Category not found"));
            return;
        }

        res.json(successResponse("Category deleted successfully", { id: deletedCategory._id }));
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json(errorResponse("Internal server error deleting category"));
    }
};