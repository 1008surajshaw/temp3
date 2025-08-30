import { Router } from 'express';
import userRoutes from './userRoutes';

const router = Router();

// Health check
router.get('/', (req, res) => {
  res.json({ message: 'API is running!', timestamp: new Date().toISOString() });
});

// Feature routes
router.use('/users', userRoutes);

export default router;