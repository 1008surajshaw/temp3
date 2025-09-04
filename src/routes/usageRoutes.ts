import { Router } from 'express';
import * as usageController from '../controllers/UsageController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// Public route for usage tracking
router.post('/track', usageController.trackUsage);

// Protected routes
router.use(authenticate, authorizeOwner);
router.get('/organization/:organizationId', usageController.getUsageStats);
router.get('/feature/:featureId', usageController.getFeatureUsage);

export default router;