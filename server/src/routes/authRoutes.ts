import { Router } from 'express';
import register from '../controllers/auth/register.ts';
import login from '../controllers/auth/login.ts';
import logout from '../controllers/auth/logout.ts';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

export default authRouter;