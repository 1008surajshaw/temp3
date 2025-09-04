import { Router } from 'express';
import * as featureController from '../controllers/FeatureController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate, authorizeOwner);

router.post('/', featureController.createFeature);
router.get('/', featureController.getAllFeatures);
router.get('/:id', featureController.getFeature);
router.get('/organization/:organizationId', featureController.getFeaturesByOrganization);
router.put('/:id', featureController.updateFeature);
router.delete('/:id', featureController.deleteFeature);

export default router;