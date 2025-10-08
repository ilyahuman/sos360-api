import { Router } from 'express';
import { prisma } from '@/infrastructure/database/prisma.client';
import { DivisionRepository } from './divisions.repository';
import { DivisionService } from './divisions.service';
import { DivisionController } from './divisions.controller';
import { createCustomerDivisionRoutes } from './routes/customer.routes';
import { createAdminDivisionRoutes } from './routes/admin.routes';

const router: Router = Router();

// Dependency injection setup
const repository = new DivisionRepository(prisma);
const service = new DivisionService(repository);
const controller = new DivisionController(service);

// Route mounting following Dual-Flow Architecture

// Customer Flow: /divisions/* (company-scoped operations)
router.use('/', createCustomerDivisionRoutes(controller));

// Admin Flow: /admin/divisions/* (cross-tenant operations)
router.use('/admin', createAdminDivisionRoutes(controller));

export default router;