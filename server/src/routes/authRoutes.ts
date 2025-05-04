import { Router } from 'express';
import register from '../controllers/auth/register.ts';
import login from '../controllers/auth/login.ts';
import logout from '../controllers/auth/logout.ts';
import deleteAccount from '../controllers/auth/deleteAccount.ts';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/delete_account', deleteAccount);

export default authRouter;