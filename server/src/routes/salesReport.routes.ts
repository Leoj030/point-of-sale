import { Router } from 'express';
import { getSalesReport } from '../controllers/salesReport.controller.ts';
import { isAuthenticated, checkRole } from '../middleware/auth.middleware.ts';
import roles from '../enums/roles.ts';

const router = Router();

// Only admin users can access sales reports
router.get('/', isAuthenticated, checkRole(roles.ADMIN), getSalesReport);

export default router;
