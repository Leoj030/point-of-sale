import express from 'express';
import register from '../controllers/user/register.js';
import { checkRole, isAuthenticated } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/validation.middleware.js';
import * as userValidator from '../validators/user.validator.js';
import roles from '../enums/roles.js';
import update from '../controllers/user/update.js';
import deleteUser from '../controllers/user/delete.js';
import getUsers from '../controllers/user/fetchUser.js';
import { createDeprecationMiddleware } from 'src/middleware/deprecation.middleware.js';

const userRouter = express.Router();

const adminOnly = checkRole(roles.ADMIN);

// --- Protected Auth Routes (Admin Only) --- \\
userRouter.post('/register',
    isAuthenticated,
    adminOnly,
    userValidator.validateCreateUser,
    handleValidationErrors,
    register
);

userRouter.get('/list', 
    isAuthenticated,
    adminOnly,
    getUsers
);

// deprecated routes for update and delete user
userRouter.put('/update/:id',
    createDeprecationMiddleware('/api/v2/users/:id', new Date('2025-05-25T00:00:00Z')),
    isAuthenticated,
    adminOnly,
    userValidator.validateMongoId('id'),
    userValidator.validateUpdateUser,
    handleValidationErrors,
    update
);

userRouter.delete('/delete/:id',
    createDeprecationMiddleware('/api/v2/users/:id', new Date('2025-05-25T00:00:00Z')),
    isAuthenticated,
    adminOnly,
    userValidator.validateMongoId('id'),
    handleValidationErrors,
    deleteUser
);
// ----------------------------------------------------------------- //


// new routes for update and delete user
userRouter.put('/v2/:id',
    createDeprecationMiddleware('/user/v2/:id', new Date('2025-05-25T00:00:00Z')),
    isAuthenticated,
    adminOnly,
    userValidator.validateMongoId('id'),
    userValidator.validateUpdateUser,
    handleValidationErrors,
    update
);

userRouter.delete('/v2/:id',
    createDeprecationMiddleware('/user/v2/:id', new Date('2025-05-25T00:00:00Z')),
    isAuthenticated,
    adminOnly,
    userValidator.validateMongoId('id'),
    handleValidationErrors,
    deleteUser
);
export default userRouter;