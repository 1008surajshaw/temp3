import { Router } from 'express';
import ownerRoutes from './ownerRoutes';
import organizationRoutes from './organizationRoutes';
import featureRoutes from './featureRoutes';
import planRoutes from './planRoutes';
import usageRoutes from './usageRoutes';
import userPlanRoutes from './userPlanRoutes';
import featureUserRoutes from './featureUserRoutes';
import analyticsRoutes from './analyticsRoutes';
import dashboardRoutes from './dashboardRoutes';
import userDetailsRoutes from './userDetailsRoutes';

const router = Router();

// Health check
router.get('/', (req, res) => {
  res.json({ message: 'API is running!', timestamp: new Date().toISOString() });
});

// API routes
router.use('/owners', ownerRoutes);
router.use('/organizations', organizationRoutes);
router.use('/features', featureRoutes);
router.use('/plans', planRoutes);
router.use('/usage', usageRoutes);
router.use('/user-plans', userPlanRoutes);
router.use('/feature-users', featureUserRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/user', userDetailsRoutes);

export default router;