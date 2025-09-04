import { Router } from 'express';
import * as dashboardController from '../controllers/DashboardController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate, authorizeOwner);

router.get('/organization/:organizationId', dashboardController.getOrganizationDashboard);

export default router;