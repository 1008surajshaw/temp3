import { Router } from 'express';
import * as userDetailsController from '../controllers/UserDetailsController';

const router = Router();

// Public route - user can check their own details with plan token
router.post('/details', userDetailsController.getUserCompleteDetails);

export default router;