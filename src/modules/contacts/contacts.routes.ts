import { Router } from 'express';

// Import separated route handlers
import customerRoutes from './routes/customer.routes';
import adminRoutes from './routes/admin.routes';

const router: Router = Router();

// --- Module Entry Point: Handle Both Flows ---

// Customer flow: /contacts/*
router.use('/', customerRoutes);

// Admin flow: /admin/contacts/*
router.use('/admin', adminRoutes);

export default router;
