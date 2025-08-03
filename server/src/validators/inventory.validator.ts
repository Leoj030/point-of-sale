import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import Category from '../models/category.model';

// --- Category Validations --- \\
export const validateCreateCategory = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 2, max: 50 }).withMessage('Category name must be between 2 and 50 characters long.')
        .custom(async (name) => {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return Promise.reject('Category name already exists.');
            }
        }),
    body('imageUrl')
        .trim()
        .notEmpty().withMessage('Image path is required.'),
];

export const validateUpdateCategory = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required.')
        .isLength({ min: 2 }).withMessage('Category name must be at least 2 characters long.')
        .custom(async (name, { req }) => {
            const categoryId = req.params?.id;
            if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
                return true;
            }
            const existingCategory = await Category.findOne({ name, _id: { $ne: categoryId } });
            if (existingCategory) {
                return Promise.reject('Another category with this name already exists.');
            }
        }),
    body('imageUrl')
        .trim()
        .notEmpty().withMessage('Image path is required.'),
];

// --- Product Validations --- \\
export const validateCreateProduct = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required.'),
    body('description')
        .trim()
        .notEmpty().withMessage('Product description is required.'),
    body('price')
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    body('imageUrl')
        .trim()
        .notEmpty().withMessage('Image path is required.'),
    body('category')
        .notEmpty().withMessage('Category ID is required.')
        .isMongoId().withMessage('Invalid Category ID format.')
        .custom(async (categoryId) => {
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                return Promise.reject('Category not found.');
            }
        }),
];

export const validateUpdateProduct = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Product name cannot be empty if provided.'),
    body('description')
        .optional()
        .trim()
        .notEmpty().withMessage('Product description cannot be empty if provided.'),
    body('price')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Price must be a positive number if provided.'),
    body('imageUrl')
        .optional()
        .trim()
        .notEmpty().withMessage('Image path cannot be empty if provided.'),
    body('category')
        .optional()
        .isMongoId().withMessage('Invalid Category ID format if provided.')
        .custom(async (categoryId) => {
             if (!categoryId) return true;
             const categoryExists = await Category.findById(categoryId);
             if (!categoryExists) {
                return Promise.reject('Category not found.');
            }
        }),
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean (true/false).'),
];


// --- ID Parameter Validation --- \\
export const validateMongoId = (paramName: string = 'id') => [
    param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName} format.`),
];