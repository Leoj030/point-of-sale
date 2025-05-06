import { body, param } from 'express-validator';
import mongoose from 'mongoose';
import User from '../models/user.model.ts';
import Roles from '../models/roles.model.ts';

// -- User Validations -- \\
export const validateCreateUser = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name field is required.')
        .isLength({ min: 2 }).withMessage('User name must be at least 2 characters long.'),
    
    body('username')
        .trim()
        .notEmpty().withMessage('Username field is required.')
        .isLength({ min: 2 }).withMessage('User username must be at least 2 characters long.')
        .custom(async (username) => {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return Promise.reject('User already exists.');
            }
        }),

    body('password')
        .trim()
        .notEmpty().withMessage('Password field is required.')
        .isLength({ min: 8 }).withMessage('User password must be at least 8 characters long.'),

    body('role')
        .notEmpty().withMessage('Role is required.')
        .isString().withMessage('Role must be a string.')
        .custom(async (roleName) => {
            const roleExists = await Roles.findOne({ name: roleName.toLowerCase() });
            if (!roleExists) {
                return Promise.reject('Role not found.');
            }
        }),
];

export const validateLoginUser = [
    body('username')
        .trim()
        .notEmpty().withMessage('Missing credentials.'),
    
    body('password')
        .trim()
        .notEmpty().withMessage('Missing credentials.'),
];

export const validateUpdateUser = [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('User name cannot be empty if provided.')
        .isLength({ min: 2 }).withMessage('User name must be at least 2 characters long.'),

    body('username')
        .optional()
        .trim()
        .notEmpty().withMessage('User username cannot be empty if provided.')
        .isLength({ min: 2 }).withMessage('User username must be at least 2 characters long.')
        .custom(async (username, { req }) => {
            const userId = req.params?.id;
            if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
                return true;
            }
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return Promise.reject('User username already exists.');
            }
        }),

    body('password')
        .optional()
        .trim()
        .notEmpty().withMessage('User password cannot be empty if provided.')
        .isLength({ min: 8 }).withMessage('User password must be at least 8 characters long.'),

    body('role')
    .optional()
    .trim()
    .notEmpty().withMessage('Role is required.')
    .isString().withMessage('Role must be a string.')
    .custom(async (roleName, { req }) => {
        const userId = req.params?.id;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            return true;
        }
        const user = await User.findById(userId).populate('role');
        if (user && user.role && typeof user.role === 'object' && 'name' in user.role && typeof user.role.name === 'string' && user.role.name.toLowerCase() === roleName.toLowerCase()) {
            return Promise.reject('User already has this role.');
        }
        const roleExists = await Roles.findOne({ name: roleName.toLowerCase() });
        if (!roleExists) {
            return Promise.reject('Role not found.');
        }
    }),

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean (true/false).'),
];

export const validateMongoId = (paramName: string = 'id') => [
    param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName} format.`),
];