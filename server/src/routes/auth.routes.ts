import express from 'express';
import login from '../controllers/auth/login';
import logout from '../controllers/auth/logout';
import { isAuthenticated } from '../middleware/auth.middleware';
import * as userValidator from '../validators/user.validator';

const authRouter = express.Router();

// --- Public Routes (Read Operations) --- \\
authRouter.post(
    '/login', 
    userValidator.validateLoginUser,
    login
);

authRouter.post(
    '/logout',
    isAuthenticated,
    logout 
);

export default authRouter;