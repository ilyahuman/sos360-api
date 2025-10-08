/**
 * Properties Module Entry Point
 * Combines customer and admin routes for property management
 */

import { Router } from 'express';

// Import separated route handlers
import customerRoutes from './routes/customer.routes';
import adminRoutes from './routes/admin.routes';

const router: Router = Router();

// --- Module Entry Point: Handle Both Flows ---

// Customer flow: /properties/*
router.use('/properties', customerRoutes);

// Admin flow: /admin/properties/*
router.use('/admin/properties', adminRoutes);

export default router;