/**
 * Route Configurator
 * Centralized route configuration and setup
 */

import { Application } from 'express';
import { config, isDevelopment } from '@/config/environment';
import { logger } from '@/shared/utils/logger';
import { authMiddleware } from '@/modules/auth/auth.middleware';
import { tenantIsolation } from '@/api/middleware/tenantIsolation';
import databaseService from '@/infrastructure/database/prisma.client';

// Import route modules
import authRoutes from '@/modules/auth/auth.routes';
import companyRoutes from '@/modules/companies/companies.routes';
import divisionRoutes from '@/modules/divisions/divisions.routes';
import contactRoutes from '@/modules/contacts/contacts.routes';
import propertyRoutes from '@/modules/properties/properties.routes';

export class RouteConfigurator {
  private readonly apiPrefix: string;

  constructor(private app: Application) {
    this.apiPrefix = `/api/${config.API_VERSION}`;
  }

  public configure(): void {
    this.configureHealthEndpoint();
    this.configureRoutes();
    this.configureRootEndpoint();
    this.configure404Handler();

    logger.info('Route configuration completed');
  }

  private configureHealthEndpoint(): void {
    // Health check endpoint for Docker and load balancers
    this.app.get(config.HEALTH_CHECK_PATH, async (req, res) => {
      try {
        const dbHealthy = await databaseService.health();

        if (dbHealthy) {
          res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
              database: 'operational',
              api: 'operational',
            },
          });
        } else {
          res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
              database: 'degraded',
              api: 'operational',
            },
          });
        }
      } catch (error) {
        res.status(503).json({
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'down',
            api: 'operational',
          },
        });
      }
    });
  }

  private configureRoutes(): void {
    // Mount module routes - each module handles its own flows internally
    this.app.use(`${this.apiPrefix}/auth`, authRoutes);
    this.app.use(`${this.apiPrefix}`, companyRoutes); // Companies module handles /companies and /admin/companies internally
    this.app.use(`${this.apiPrefix}/divisions`, divisionRoutes); // Divisions module handles /divisions and /admin/divisions internally
    this.app.use(`${this.apiPrefix}`, contactRoutes); // Contacts module handles /contacts and /admin/contacts internally
    this.app.use(`${this.apiPrefix}`, propertyRoutes); // Properties module handles /properties and /admin/properties internally
  }

  private configureRootEndpoint(): void {
    // API root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: config.APP_NAME,
        version: config.API_VERSION,
        environment: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        status: 'operational',
        docs: isDevelopment ? '/api-docs' : undefined,
        endpoints: {
          health: config.HEALTH_CHECK_PATH,
          auth: `${this.apiPrefix}/auth`,
          companies: `${this.apiPrefix}/companies`,
          divisions: `${this.apiPrefix}/divisions`,
          contacts: `${this.apiPrefix}/contacts`,
          properties: `${this.apiPrefix}/properties`,
          admin: `${this.apiPrefix}/admin`,
        },
      });
    });
  }

  private configure404Handler(): void {
    // 404 handler for unmatched routes
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
        availableEndpoints: {
          root: '/',
          health: config.HEALTH_CHECK_PATH,
          auth: `${this.apiPrefix}/auth`,
          companies: `${this.apiPrefix}/companies`,
          divisions: `${this.apiPrefix}/divisions`,
          contacts: `${this.apiPrefix}/contacts`,
          properties: `${this.apiPrefix}/properties`,
        },
      });
    });
  }
}
