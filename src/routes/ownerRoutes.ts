import { Router } from 'express';
import * as ownerController from '../controllers/OwnerController';
import { authenticate, authorizeOwner } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', ownerController.createOwner);
router.post('/login', ownerController.loginOwner);

;
router.get('/profile',authenticate, authorizeOwner, ownerController.getProfile);
router.get('/', ownerController.getAllOwners);
router.get('/:id', ownerController.getOwner);
router.put('/:id',authenticate, authorizeOwner, ownerController.updateOwner);
router.delete('/:id',authenticate, authorizeOwner, ownerController.deleteOwner);

export default router;