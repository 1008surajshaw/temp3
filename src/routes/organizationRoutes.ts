import { Router } from 'express';
import * as organizationController from '../controllers/OrganizationController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate, authorizeOwner);

router.post('/', organizationController.createOrganization);
router.get('/', organizationController.getAllOrganizations);
router.get('/:id', organizationController.getOrganization);
router.get('/owner/:ownerId', organizationController.getOrganizationsByOwner);
router.put('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

export default router;