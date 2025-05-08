import express from 'express';
import login from '../controllers/auth/login.js';
import logout from '../controllers/auth/logout.js';
import { isAuthenticated } from '../middleware/auth.middleware.js';
import * as userValidator from '../validators/user.validator.js';

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