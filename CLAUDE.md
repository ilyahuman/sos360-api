# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**SOS360 API** - Enterprise SaaS ERP/CRM Platform for the Asphalt & Exterior Services Industry. Built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL.

**Node version requirement**: >=22.0.0

## Common Commands

### Development
```bash
npm run dev                # Start development server with hot reload
npm run dev:debug          # Start with Node inspector for debugging
```

### Database Operations
```bash
npm run db:generate        # Generate Prisma client after schema changes
npm run db:push           # Push schema changes to database (dev)
npm run db:migrate        # Create and run new migration
npm run db:deploy         # Deploy migrations (production)
npm run db:seed           # Seed database with initial data
npm run db:studio         # Open Prisma Studio GUI
npm run db:reset          # Reset database (WARNING: deletes all data)
```

### Build & Production
```bash
npm run build             # Compile TypeScript to dist/ folder
npm run start             # Run production build
npm run start:prod        # Run with NODE_ENV=production
```

### Code Quality
```bash
npm run lint              # Run ESLint
npm run lint:fix          # Auto-fix ESLint issues
npm run format            # Format code with Prettier
npm run format:check      # Check formatting without changes
```

## Architecture Overview

### Path Aliases
The codebase uses TypeScript path aliases defined in `tsconfig.json`:
- `@/*` - Root src directory
- `@/api/*` - API layer (middleware, controllers, routes)
- `@/config/*` - Configuration files
- `@/infrastructure/*` - External services (database, Redis, etc.)
- `@/modules/*` - Business domain modules
- `@/shared/*` - Shared utilities

**Important**: After building, run `tsc-alias` to resolve aliases in the compiled output.

### Layered Architecture

The application follows a module-based architecture:

1. **Entry Point** (`src/app.ts`): Bootstraps the application
2. **Application Core** (`src/api/core/Application.ts`): Manages server lifecycle, database connections, and graceful shutdown
3. **Middleware Layer** (`src/api/middleware/middlewareConfigurator.ts`): Configures security, CORS, parsers, logging
4. **Routing Layer** (`src/api/routes/RouteConfigurator.ts`): Centralized route mounting with explicit base paths
5. **Module Layer** (`src/modules/**`): Domain isolated modules with controller → service → repository pattern
6. **Error Handling** (`src/api/middleware/errorConfigurator.ts`): Global error handler (must be last middleware)

### Module Structure

Each module follows a consistent pattern (example: Companies module):

```
modules/
  companies/
    admin/                    # Admin-specific logic (no tenancy)
      companies.admin.controller.ts
      companies.admin.service.ts
    customer/                 # Customer-specific logic (tenant-scoped)
      companies.customer.controller.ts
      companies.customer.service.ts
    routes/
      admin.routes.ts         # Admin route definitions
      customer.routes.ts      # Customer route definitions
    companies.repository.ts   # Data access layer
    companies.routes.ts       # DI factory that wires everything together
    companies.schema.ts       # Zod validation schemas
    companies.types.ts        # TypeScript types/interfaces
```

**Key architectural decisions:**
- **Dependency Injection**: Modules export factory functions that accept dependencies (e.g., PrismaClient) and return configured routers
- **Separation of Concerns**: Admin flows (no tenancy) and customer flows (tenant-scoped) are separate
- **Repository Pattern**: All database access goes through repository layer
- **Validation**: Zod schemas for runtime validation and DTOs, matching Prisma schema definitions

### Routing Pattern

Routes are mounted in `RouteConfigurator.ts` with explicit base paths:
- `/api/v1/companies` → Companies module
- `/api/v1/divisions` → Divisions module (commented out)
- `/api/v1/contacts` → Contacts module (commented out)
- `/api/v1/properties` → Properties module (commented out)

Within each module:
- Admin routes: `/api/v1/companies/admin/*`
- Customer routes: `/api/v1/companies/*`

### Database Schema

**Multi-tenant architecture**: The system uses `companyId` for tenant isolation.

**Key models:**
- **Company**: Root tenant entity with Stripe subscription management
- **Division**: Hierarchical divisions with closure table pattern for efficient tree queries
- **User**: Authenticated users with role-based permissions
- **Contact**: CRM contacts with lead classification system (Lucidspark integration)
- **Property**: Physical properties with geolocation and SpotOnSite integration
- **Opportunity**: Sales pipeline tracking with Kanban stages
- **Project**: Won opportunities converted to projects
- **LineItem**: Work items with visual correlation to mapped areas
- **CostCategory**: Cost tracking (Labor, Materials, Equipment, etc.)

**Important patterns:**
- Soft deletes: Use `deletedAt` timestamp field
- Audit fields: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` (userId nullable for system actions)
- Division hierarchy: Use `DivisionClosure` table for tree queries, not `parentDivisionId` directly

### Environment Configuration

Configuration is centralized in `src/config/environment.ts` with Zod validation. Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Minimum 32 chars (64 in production)
- `JWT_REFRESH_SECRET`: Minimum 32 chars (64 in production), must differ from JWT_SECRET
- `COOKIE_SECRET`: Minimum 32 chars (64 in production)

Load environment files based on `NODE_ENV`:
- `development` → `.env`
- `staging` → `.env.staging`
- `production` → `.env.production.local`

### Error Handling

Errors are handled by a global error handler that catches:
- Prisma errors (P2025 → 404, P2002 → 409 conflict, etc.)
- Domain-specific errors (`NotFoundError`, `ValidationError`, etc.) defined in `src/api/types/domain-errors.types.ts`
- Zod validation errors
- Generic HTTP errors

Controllers extend `BaseController` which provides:
- `sendSuccessResponse()`: Standardized success responses
- `sendNoContentResponse()`: 204 responses for deletes
- `validateRequestBody()`: Zod validation with automatic error responses

### Prisma Client Management

**Critical**: The application uses a global Prisma client singleton from `src/infrastructure/database/prisma.client.ts`.

Never create new `PrismaClient` instances. Always import:
```typescript
import databaseService from '@/infrastructure/database/prisma.client';
```

The singleton handles:
- Connection pooling
- Query logging in development
- Graceful disconnection on shutdown

### Request Context

Every request has a context object attached with:
- `requestId`: Unique UUID for tracing
- `startTime`: Request start timestamp
- `tenantId`: Extracted from authentication (if applicable)

Access via `req.context`.

## Development Workflow

1. **Schema changes**: Modify `prisma/schema.prisma`, then run `npm run db:generate && npm run db:migrate`
2. **New module**: Follow the Companies module pattern (controller → service → repository)
3. **New routes**: Add to module's route factory, then mount in `RouteConfigurator.ts`
4. **Validation**: Define Zod schemas in `*.schema.ts`, use in controllers via `validateRequestBody()`
5. **Testing**: Currently no test framework configured (`npm test` is placeholder)

## Important Notes

- **reflect-metadata** must be the first import in `app.ts` for dependency injection
- Build process uses `tsc && tsc-alias` to compile and resolve path aliases
- Middleware order is critical: security → CORS → parsers → routes → error handler
- Repository methods with "Scoped" suffix enforce tenant isolation
- Never use `git rebase -i` or `git add -i` (interactive commands not supported in automation)
- Commented routes in `RouteConfigurator.ts` are placeholders - do not delete them


- Respond critically and honestly to my inquiries.
- Use 'less' or 'cat' commands to read files.
- Every feature follows the same patterns. Use these abstractions to implement any business
  domain while maintaining architectural consistency.
- Search web for any answers and solutions you are not sure about to get best result.
- Look for official documentations of any libraries and packages you use to provide best results and latest API usage.
- Before providing new code updates or features, always check @docs/ folder and read docs there to be sure you
  understand what you shall do correctly.
- Always use Prisma best practices how to work with API + DB, with its typing system to cover by TS all module logic.
  Use generic Prisma types like: Company and its Prisma.CompanyCreateInput and so on, as well as creating DTOs for
  module.
- After adding new code always run tsc commands to check for errors and fix them.
- During working on any module and logic if you face some needed logic that should be added from other not yet
  implemented modules — do not skip it but always leave the ToDo(!!!) comment with placeholder descriptions of what
  should be added here later. Via this we will easily add necessary logic later to implemented modules and connect logic
  between modules without spending time on analyzing code again.