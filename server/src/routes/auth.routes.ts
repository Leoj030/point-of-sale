import express from 'express';
import login from '../controllers/auth/login.ts';
import logout from '../controllers/auth/logout.ts';
import { isAuthenticated } from '../middleware/auth.middleware.ts';
import * as userValidator from '../validators/user.validator.ts';

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