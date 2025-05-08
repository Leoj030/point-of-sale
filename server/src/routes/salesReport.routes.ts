import { Router } from 'express';
import { getSalesReport } from '../controllers/salesReport.controller.js';
import { isAuthenticated, checkRole } from '../middleware/auth.middleware.js';
import roles from '../enums/roles.js';

const router = Router();

// Only admin users can access sales reports
router.get('/', isAuthenticated, checkRole(roles.ADMIN), getSalesReport);

export default router;
