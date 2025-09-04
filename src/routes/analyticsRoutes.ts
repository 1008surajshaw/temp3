import { Router } from 'express';
import * as analyticsController from '../controllers/AnalyticsController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate, authorizeOwner);

router.get('/organization/:organizationId', analyticsController.getOrganizationAnalytics);
router.get('/feature/:featureId', analyticsController.getFeatureAnalytics);
router.get('/dashboard/:organizationId', analyticsController.getDashboardStats);

export default router;