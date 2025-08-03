import { Router } from 'express';
import { getSalesReport } from '../controllers/salesReport.controller';
import { isAuthenticated, checkRole } from '../middleware/auth.middleware';
import roles from '../enums/roles';

const router = Router();

// Only admin users can access sales reports
router.get('/', isAuthenticated, checkRole(roles.ADMIN), getSalesReport);

export default router;
