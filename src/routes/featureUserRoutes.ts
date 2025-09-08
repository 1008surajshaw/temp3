import { Router } from 'express';
import * as featureUserController from '../controllers/FeatureUserController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// Public route for token validation
router.post('/validate', featureUserController.validateFeatureUserToken);

// Protected routes
router.use(authenticate, authorizeOwner);
router.post('/', featureUserController.createFeatureUser);
router.get('/:id', featureUserController.getFeatureUser);
router.get('/feature/:featureId', featureUserController.getFeatureUsersByFeature);
router.get('/organization/:organizationId', featureUserController.getFeatureUsersByOrganization);
router.patch('/:id/toggle', featureUserController.toggleFeatureUserActivity);

export default router;