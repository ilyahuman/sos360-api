# SOS360 API

Enterprise SaaS ERP/CRM Platform for Asphalt & Exterior Services Industry

## 🏗️ Architecture Overview

SOS360 is a multi-tenant, cloud-based platform designed specifically for construction paving contractors and exterior service
companies. Built with TypeScript, Node.js, and following Domain-Driven Design (DDD) principles.

### Key Features

- **Multi-tenant Architecture**: Complete data isolation between companies
- **Enterprise Security**: JWT authentication, input sanitization
- **Domain-Driven Design**: Clean Modular based architecture with proper separation of concerns
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Database**: PostgreSQL with Prisma ORM
- **NoSQL**: Firebase for document storage and real-time features
- **Monitoring**: Comprehensive logging and health checks
- **API Design**: RESTful APIs with OpenAPI documentation

## 🛠️ Technology Stack

### Core Technologies

- **Runtime**: Node.js 18+ with TypeScript 5.2+
- **Framework**: Express.js with enterprise middleware stack
- **Database**: PostgreSQL with Prisma ORM
- **NoSQL**: Firebase Firestore
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod + class-validator
- **Logging**: Winston with daily rotation
- **Security**: Helmet, CORS

### Development Tools

- **Code Quality**: ESLint + Prettier
- **Package Manager**: Yarn
- **Process Manager**: PM2 (production)
- **API Documentation**: Swagger/OpenAPI
- **Health Monitoring**: Custom health check endpoints

### Environment Variables

Create a `.env` file based on `.env.example`:

# Project Architecture

This project follows a **modular, feature-based architecture**. This design pattern is crucial for maintaining a clean
and scalable codebase. It organizes the application by business domain (or "feature") rather than by technical layer.

The core principles of this architecture are:

- **High Cohesion**: All code related to a single feature (e.g., authentication, projects, contacts) is located in a
  single directory. This makes the feature easy to understand, maintain, and test.
- **Low Coupling**: Modules are designed to be self-contained and should not have direct dependencies on the internal
  implementation of other modules. They communicate through well-defined public interfaces (typically their services).
- **Clear Boundaries**: The project is divided into distinct zones (`api`, `modules`, `shared`) with clear rules about
  how they interact, preventing a tangled "spaghetti code" structure.

### Directory Structure Overview

The `src/` directory is organized into three main areas, each with a specific responsibility:

```
src/
├── api/          # Core application setup (server, middleware, routes)
├── modules/      # Self-contained business feature modules
└── shared/       # Non-business, generic code shared across all modules
```

### How to Extend the Project

To maintain the integrity of the architecture, all new development should follow these guidelines.

#### How to Add a New Business Feature

Adding a new feature (e.g., "Invoicing") should be done by creating a new module.

**Step-by-step guide:**

1. **Create a New Module Directory**:

   ```bash
   mkdir src/modules/invoicing
   ```

2. **Create the Internal Files**:
   Populate the new directory with all the necessary files for that feature. A typical module includes:
   - `invoicing.routes.ts`: Defines the API endpoints (e.g., `POST /invoices`, `GET /invoices/:id`).
   - `invoicing.service.ts`: Contains the core business logic for the feature. This is the module's public API for
     other modules.
   - `invoicing.repository.ts`: Handles all database interactions for the feature.
   - `invoicing.validator.ts`: Defines input validation rules for the routes.
   - `invoicing.types.ts`: Contains all TypeScript interfaces and types specific to this module.

3. **Connect the Routes**:
   Open `src/api/routes/RouteConfigurator.ts` and import the new routes file. Then, mount it on the application, usually
   within the `configureProtectedRoutes` method:
   ```typescript
   import invoicingRoutes from '@/modules/invoicing/invoicing.routes';
   // ...
   this.app.use(`${this.apiPrefix}/invoicing`, authMiddleware, invoicingRoutes);
   ```

#### Architectural Rules and Best Practices

To avoid creating a messy codebase, please adhere to the following rules:

- **Module Communication**: One module **should not** directly import files from another module's repository, validator,
  or routes. If `Module A` needs to interact with `Module B`, it should import and use `Module B`'s **service** (
  `B.service.ts`).
- **The `api` Directory**: This directory is for **application orchestration only**. It should not contain any
  business-specific logic. Its job is to wire together the modules and the server.
- **The `shared` Directory**: This directory is for **truly generic code only**. If a piece of code is related to a
  specific business domain, it belongs in a module. The `shared` directory is for utilities like `logger`, global types
  like `ApiError`, or reusable constants that have no business context.

By following these guidelines, we can ensure the codebase remains clean, maintainable, and easy for anyone to extend.

## 📈 Performance Monitoring

### Logging

- **Winston**: Structured logging with daily rotation
- **Request Tracking**: Unique request IDs for tracing
- **Performance Metrics**: Response time monitoring
- **Security Events**: Authentication and authorization logging
- **Business Events**: Domain-specific activity tracking

### Metrics

- API response times
- Database query performance
- Error rates and types
- User activity patterns
- Resource utilization

## 🔄 API Usage

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Use JWT token in subsequent requests
curl -X GET http://localhost:3000/api/v1/companies/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Sample API Calls

```bash
# Get company profile
GET /api/v1/companies/profile

# List contacts
GET /api/v1/contacts?page=1&limit=20&search=john

# Create new contact
POST /api/v1/contacts
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "contactType": "COMMERCIAL"
}
```

## 📚 Additional Resources

### Business Documentation

- `docs/Business Entities.md` - Detailed business entity relationships
- `docs/Industry Context & Workflow Scenarios.md` - Business workflows
- `docs/sos360-project-review.md` - Complete project overview

### API Documentation

- Swagger/OpenAPI docs available at `/api-docs` (development)
- Postman collection (future enhancement)

### Database Schema

- Prisma schema: `prisma/schema.prisma`
- ERD diagram (generated from schema)

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**

   ```bash
   # Check PostgreSQL is running
   pg_isready -h localhost -p 5432

   # Verify DATABASE_URL in .env
   echo $DATABASE_URL
   ```

2. **JWT Token Issues**

   ```bash
   # Check JWT_SECRET is set and strong
   echo $JWT_SECRET | wc -c  # Should be 32+ characters
   ```

3. **Firebase Connection Issues**
   ```bash
   # Verify Firebase credentials
   # Check FIREBASE_* environment variables
   ```

### Debug Mode

```bash
# Start with debugging enabled
yarn dev:debug

# Connect debugger on port 9229
```
