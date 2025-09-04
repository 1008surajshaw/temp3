import { Router } from 'express';
import * as planController from '../controllers/PlanController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate, authorizeOwner);

router.post('/', planController.createPlan);
router.get('/', planController.getAllPlans);
router.get('/:id', planController.getPlan);
router.get('/organization/:organizationId', planController.getPlansByOrganization);
router.put('/:id', planController.updatePlan);
router.delete('/:id', planController.deletePlan);

export default router;