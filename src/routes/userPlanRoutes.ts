import { Router } from 'express';
import * as userPlanController from '../controllers/UserPlanController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// Public route for token validation
router.post('/validate', userPlanController.validateToken);

// Protected routes
router.use(authenticate, authorizeOwner);
router.post('/', userPlanController.createUserPlan);
router.get('/:id', userPlanController.getUserPlan);
router.get('/user/:userId', userPlanController.getUserPlansByUser);
router.patch('/:id/deactivate', userPlanController.deactivateUserPlan);
router.patch('/:id/upgrade', userPlanController.upgradePlan);
router.patch('/:id/downgrade', userPlanController.downgradePlan);
router.delete('/:id/remove', userPlanController.removePlan);
router.patch('/:id/extend', userPlanController.extendExpiry);
router.get('/history/:userId', userPlanController.getPlanHistory);

export default router;