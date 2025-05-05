import express from 'express';
import register from '../controllers/auth/register.ts';
import login from '../controllers/auth/login.ts';
import logout from '../controllers/auth/logout.ts';
import { isAuthenticated } from '../middleware/auth.middleware.ts';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post(
    '/logout',
    isAuthenticated,
    logout 
);

export default authRouter;