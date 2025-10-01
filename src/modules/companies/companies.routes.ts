import { Router } from 'express';

// Import separated route handlers
import customerRoutes from './routes/customer.routes';
import adminRoutes from './routes/admin.routes';

const router: Router = Router();

// --- Module Entry Point: Handle Both Flows ---

// Customer flow: /companies/*
router.use('/companies', customerRoutes);

// Admin flow: /admin/companies/*  
router.use('/admin/companies', adminRoutes);

export default router;