import express from 'express';
import register from '../controllers/user/register.ts';
import { checkRole, isAuthenticated } from '../middleware/auth.middleware.ts';
import { handleValidationErrors } from '../middleware/validation.middleware.ts';
import * as userValidator from '../validators/user.validator.ts';
import roles from '../enums/roles.ts';
import update from 'src/controllers/user/update.ts';
import deleteUser from 'src/controllers/user/delete.ts';
import getUsers from 'src/controllers/user/fetchUser.ts';

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