import express from 'express';
import register from '../controllers/user/register.js';
import { checkRole, isAuthenticated } from '../middleware/auth.middleware.js';
import { handleValidationErrors } from '../middleware/validation.middleware.js';
import * as userValidator from '../validators/user.validator.js';
import roles from '../enums/roles.js';
import update from '../controllers/user/update.js';
import deleteUser from '../controllers/user/delete.js';
import getUsers from '../controllers/user/fetchUser.js';

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

userRouter.put('/update/:id', 
    isAuthenticated,
    adminOnly,
    userValidator.validateMongoId('id'),
    userValidator.validateUpdateUser,
    handleValidationErrors,
    update
);

userRouter.delete('/delete/:id', 
    isAuthenticated,
    adminOnly,
    userValidator.validateMongoId('id'),
    handleValidationErrors,
    deleteUser
);

export default userRouter;