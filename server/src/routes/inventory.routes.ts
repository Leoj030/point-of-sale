import express from 'express';
import * as categoryController from '../controllers/inventory/category.controller.js';
import * as productController from '../controllers/inventory/product.controller.js';
import { checkRole, isAuthenticated } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/validation.middleware.js';
import * as inventoryValidator from '../validators/inventory.validator.js';
import roles from '../enums/roles.js';
import ordersRouter from './orders.routes.js';

const router = express.Router();

// --- Public Routes (Read Operations) --- \\
router.get('/categories', categoryController.getCategories);
router.get('/products', productController.getProducts);

const adminOnly = checkRole(roles.ADMIN);

// --- Protected Category Routes (Admin Only) --- \\
router.post(
    '/categories',
    isAuthenticated,
    adminOnly,
    inventoryValidator.validateCreateCategory,
    handleValidationErrors,
    categoryController.createCategory
);

router.put(
    '/categories/:id',
    isAuthenticated,
    adminOnly,
    inventoryValidator.validateMongoId('id'),
    inventoryValidator.validateUpdateCategory,
    handleValidationErrors,
    categoryController.updateCategory
);

router.delete(
    '/categories/:id',
    isAuthenticated,
    adminOnly,
    inventoryValidator.validateMongoId('id'),
    handleValidationErrors,
    categoryController.deleteCategory
);


// --- Protected Product Routes (Admin Only) --- \\
router.post(
    '/products',
    isAuthenticated,
    adminOnly,
    inventoryValidator.validateCreateProduct,
    handleValidationErrors,
    productController.createProduct
);

router.put(
    '/products/:id',
    isAuthenticated,
    adminOnly,
    inventoryValidator.validateMongoId('id'),
    inventoryValidator.validateUpdateProduct,
    handleValidationErrors,
    productController.updateProduct
);

router.delete(
    '/products/:id',
    isAuthenticated,
    adminOnly,
    inventoryValidator.validateMongoId('id'),
    handleValidationErrors,
    productController.deleteProduct
);

router.use('/orders', ordersRouter);

export default router;