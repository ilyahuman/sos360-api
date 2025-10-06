# 3_MVP_Core_Modules_Implementation_Roadmap

## Overview

This document defines the **Minimum Viable Product (MVP)** scope for the SOS360 API backend, organizing modules into implementation phases based on dependencies and business criticality.

## MVP Philosophy

The MVP focuses on delivering a **functional multi-tenant CRM** that enables:
1. Company onboarding and tenant isolation
2. User authentication and role-based access control
3. Contact and property management
4. Sales pipeline tracking from lead to opportunity
5. Basic organizational structure via divisions

**Out of MVP Scope** (Phase 2+):
- Project execution and field work tracking
- Detailed cost estimation and line item pricing
- Advanced reporting and analytics
- External integrations (SpotOnSite, Stripe, etc.)
- Customer portal and electronic signatures

---

## Implementation Phases

### **Phase 0: Foundation**
*Infrastructure setup before any modules*

**Components:**
- ✅ Application core (`Application.ts`)
- ✅ Middleware configuration (security, CORS, logging)
- ✅ Error handling system
- ✅ Environment configuration with Zod validation
- ✅ Prisma client singleton
- ✅ Database connection management
- ✅ Request context system (requestId, tenantId)

**Status:** ✅ Complete

---

### **Phase 1: Authentication & Multi-Tenancy Foundation**
*Core infrastructure for all subsequent modules*

#### 1.1 Companies Module (Root Tenant)
**Priority:** CRITICAL - Required for multi-tenancy
**Dependencies:** None
**Status:** ✅ Implemented (admin routes)

**Endpoints:**
```
POST   /api/v1/companies/admin              # Create new company (admin only)
GET    /api/v1/companies/admin              # List all companies (admin only)
GET    /api/v1/companies/admin/:id          # Get company details (admin only)
PATCH  /api/v1/companies/admin/:id          # Update company (admin only)
DELETE /api/v1/companies/admin/:id          # Soft delete company (admin only)
GET    /api/v1/companies                    # Get current company (customer)
PATCH  /api/v1/companies                    # Update own company (customer)
```

**Key Features:**
- Multi-tenant isolation via `companyId`
- Default "General" division auto-created on company creation
- Soft delete support
- Subscription status tracking (ready for Stripe integration)

**Database Schema:**
```prisma
model Company {
  id                String    @id @default(cuid())
  name              String
  legalName         String?
  businessType      CompanyBusinessType
  phone             String?
  email             String?
  website           String?

  // Multi-tenant isolation
  divisions         Division[]
  users             User[]
  contacts          Contact[]
  // ... other relations

  // Subscription (Stripe integration placeholder)
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  subscriptionStatus     SubscriptionStatus @default(TRIAL)
  subscriptionPlan       String?

  // Audit fields
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  deletedAt    DateTime?

  @@index([email])
}
```

#### 1.2 Users & Authentication Module
**Priority:** CRITICAL - Required for access control
**Dependencies:** Companies
**Status:** 🚧 TODO

**Endpoints:**
```
POST   /api/v1/auth/register                # Company owner registration (public)
POST   /api/v1/auth/login                   # User login
POST   /api/v1/auth/refresh                 # Refresh JWT token
POST   /api/v1/auth/logout                  # Logout and invalidate token
POST   /api/v1/auth/forgot-password         # Request password reset
POST   /api/v1/auth/reset-password          # Reset password with token

GET    /api/v1/users                        # List company users (tenant-scoped)
GET    /api/v1/users/:id                    # Get user details
POST   /api/v1/users                        # Invite new user (admin/manager)
PATCH  /api/v1/users/:id                    # Update user
DELETE /api/v1/users/:id                    # Deactivate user
PATCH  /api/v1/users/:id/role               # Change user role (admin only)
```

**Key Features:**
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC):
  - `EXECUTIVE` - Full company access
  - `MANAGER` - Division + company-level access
  - `ESTIMATOR` - Sales pipeline focus
  - `FOREMAN` - Field operations focus (Phase 2)
  - `BASIC_FIELD` - Limited field access (Phase 2)
- Division assignment (default to "General")
- Password hashing with bcrypt
- Email verification system
- Session management

**Database Schema:**
```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  firstName     String
  lastName      String
  phone         String?
  role          UserRole @default(BASIC_FIELD)

  // Multi-tenant
  companyId     String
  company       Company  @relation(fields: [companyId], references: [id])

  // Division assignment
  divisionId    String
  division      Division @relation(fields: [divisionId], references: [id])

  // Authentication
  emailVerified Boolean  @default(false)
  isActive      Boolean  @default(true)
  lastLoginAt   DateTime?

  // Audit fields
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([companyId])
  @@index([email])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}
```

**Middleware Required:**
- `authenticateJWT` - Verify JWT token and attach user to request
- `requireRole([roles])` - Role-based route protection
- `extractTenantId` - Extract companyId from authenticated user

#### 1.3 Divisions Module
**Priority:** HIGH - Required for organizational structure
**Dependencies:** Companies, Users
**Status:** 🚧 TODO (partial schema exists)

**Endpoints:**
```
GET    /api/v1/divisions                    # List company divisions (tenant-scoped)
GET    /api/v1/divisions/:id                # Get division details
POST   /api/v1/divisions                    # Create division (admin/manager)
PATCH  /api/v1/divisions/:id                # Update division
DELETE /api/v1/divisions/:id                # Delete division (if no entities linked)
GET    /api/v1/divisions/:id/hierarchy      # Get division tree
```

**Key Features:**
- Default "General" division (cannot be deleted)
- Hierarchical structure with closure table for efficient tree queries
- Division types: GEOGRAPHIC, SERVICE_LINE, MARKET_SEGMENT, BUSINESS_UNIT, OPERATIONAL
- Prevent deletion if entities are linked (onDelete: Restrict)
- Color coding and icons for UI organization

**Database Schema:**
```prisma
model Division {
  id          String       @id @default(cuid())
  name        String
  description String?
  type        DivisionType @default(GEOGRAPHIC)

  // Multi-tenant
  companyId   String
  company     Company      @relation(fields: [companyId], references: [id])

  // Hierarchy (use closure table for queries, not this directly)
  parentDivisionId String?
  parentDivision   Division?  @relation("DivisionHierarchy", fields: [parentDivisionId], references: [id])
  childDivisions   Division[] @relation("DivisionHierarchy")

  // Related entities
  users       User[]
  contacts    Contact[]
  properties  Property[]
  opportunities Opportunity[]

  // Display configuration
  color       String?
  icon        String?
  sortOrder   Int         @default(0)

  // Audit
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  deletedAt   DateTime?

  @@index([companyId])
  @@index([parentDivisionId])
}

model DivisionClosure {
  ancestorId   String
  descendantId String
  depth        Int

  ancestor     Division @relation("Ancestor", fields: [ancestorId], references: [id])
  descendant   Division @relation("Descendant", fields: [descendantId], references: [id])

  @@id([ancestorId, descendantId])
  @@index([ancestorId])
  @@index([descendantId])
}
```

---

### **Phase 2: CRM Core - Contact & Property Management**
*Essential CRM functionality for managing customers and locations*

#### 2.1 Contacts Module
**Priority:** HIGH - Core CRM entity
**Dependencies:** Companies, Divisions, Users
**Status:** 🚧 TODO (routes commented out)

**Endpoints:**
```
GET    /api/v1/contacts                     # List contacts (tenant-scoped, filterable)
GET    /api/v1/contacts/:id                 # Get contact details
POST   /api/v1/contacts                     # Create contact
PATCH  /api/v1/contacts/:id                 # Update contact
DELETE /api/v1/contacts/:id                 # Soft delete contact
GET    /api/v1/contacts/:id/properties      # List contact's properties
GET    /api/v1/contacts/:id/opportunities   # List contact's opportunities
PATCH  /api/v1/contacts/:id/status          # Update lead status
POST   /api/v1/contacts/import              # Bulk import contacts (CSV)
```

**Key Features:**
- Lead classification: COMMERCIAL, RESIDENTIAL, HOA, MUNICIPAL, INDUSTRIAL
- Lead source tracking: WEBSITE, REFERRAL, REPEAT, PHONE_CALL, TRADE_SHOW, etc.
- Lead status progression: LEAD → PROSPECT → QUALIFIED → CUSTOMER → INACTIVE
- Division assignment (default to "General")
- Assigned user tracking
- Communication preferences (phone/email/text, opt-out settings)
- Follow-up date tracking
- Notes and tags

**Database Schema:**
```prisma
model Contact {
  id              String            @id @default(cuid())
  firstName       String
  lastName        String
  email           String?
  phone           String?
  jobTitle        String?
  companyName     String?

  // Lead classification
  leadType        ContactLeadType?
  leadSource      ContactLeadSource?
  leadStatus      ContactLeadStatus @default(LEAD)

  // Multi-tenant & division
  companyId       String
  company         Company           @relation(fields: [companyId], references: [id])
  divisionId      String
  division        Division          @relation(fields: [divisionId], references: [id])

  // Assignment
  assignedUserId  String?
  assignedUser    User?             @relation(fields: [assignedUserId], references: [id])

  // Communication preferences
  preferredContactMethod PreferredContactMethod?
  emailOptOut     Boolean           @default(false)
  smsOptOut       Boolean           @default(false)

  // Relationship management
  nextFollowUpDate DateTime?
  lastContactDate  DateTime?

  // Related entities
  properties      Property[]
  opportunities   Opportunity[]

  // Metadata
  notes           String?
  tags            String[]

  // Audit
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  deletedAt       DateTime?
  createdBy       String?
  updatedBy       String?

  @@index([companyId])
  @@index([divisionId])
  @@index([email])
  @@index([leadStatus])
}
```

#### 2.2 Properties Module
**Priority:** HIGH - Work location tracking
**Dependencies:** Companies, Divisions, Contacts
**Status:** 🚧 TODO (routes commented out)

**Endpoints:**
```
GET    /api/v1/properties                   # List properties (tenant-scoped, filterable)
GET    /api/v1/properties/:id               # Get property details
POST   /api/v1/properties                   # Create property
PATCH  /api/v1/properties/:id               # Update property
DELETE /api/v1/properties/:id               # Soft delete property
GET    /api/v1/properties/:id/opportunities # List property opportunities
POST   /api/v1/properties/:id/photos        # Upload property photos
```

**Key Features:**
- Full address with geocoding (latitude/longitude)
- Property type: COMMERCIAL, RESIDENTIAL, INDUSTRIAL, MUNICIPAL, HOA
- Property size tracking (square footage)
- Surface types: ASPHALT, CONCRETE, GRAVEL, etc.
- Access restrictions and notes
- Photo gallery support
- Division assignment (for regional management)
- Contact relationship (1 contact : N properties)

**Database Schema:**
```prisma
model Property {
  id              String         @id @default(cuid())
  name            String?

  // Location
  addressLine1    String
  addressLine2    String?
  city            String
  state           String
  zipCode         String
  country         String         @default("USA")
  latitude        Float?
  longitude       Float?

  // Property details
  propertyType    PropertyType
  squareFootage   Float?
  surfaceTypes    SurfaceType[]
  accessNotes     String?

  // Multi-tenant & division
  companyId       String
  company         Company        @relation(fields: [companyId], references: [id])
  divisionId      String
  division        Division       @relation(fields: [divisionId], references: [id])

  // Contact relationship
  contactId       String
  contact         Contact        @relation(fields: [contactId], references: [id])

  // Related entities
  opportunities   Opportunity[]

  // Documentation
  photoUrls       String[]
  notes           String?

  // Audit
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  deletedAt       DateTime?
  createdBy       String?
  updatedBy       String?

  @@index([companyId])
  @@index([divisionId])
  @@index([contactId])
}
```

---

### **Phase 3: Sales Pipeline Core**
*Sales process management from lead to opportunity*

#### 3.1 Pipeline Stages Module (Configuration)
**Priority:** HIGH - Required for opportunity tracking
**Dependencies:** Companies
**Status:** 🚧 TODO

**Endpoints:**
```
GET    /api/v1/pipeline-stages              # List company pipeline stages (tenant-scoped)
GET    /api/v1/pipeline-stages/:id          # Get stage details
POST   /api/v1/pipeline-stages              # Create custom stage (admin only)
PATCH  /api/v1/pipeline-stages/:id          # Update stage (admin only)
DELETE /api/v1/pipeline-stages/:id          # Delete stage (admin only)
PATCH  /api/v1/pipeline-stages/reorder      # Reorder stages (admin only)
```

**Key Features:**
- Customizable pipeline stages per company
- Default stages provided on company creation:
  - LEAD (0% probability)
  - PROSPECT (25% probability)
  - QUALIFIED (50% probability)
  - PROPOSAL (75% probability)
  - WON (100% probability)
  - LOST (0% probability)
- Stage type classification: LEAD, PROSPECT, OPPORTUNITY, WON, LOST
- Probability percentage (0-100%)
- Business requirements per stage (mapping required, estimate required, approval required)
- Automation rules (auto follow-up days, notification triggers)
- Color coding for Kanban visualization
- Workflow configuration (allowed transitions)

**Database Schema:**
```prisma
model PipelineStage {
  id                String               @id @default(cuid())
  name              String
  description       String?
  stageType         PipelineStageType
  probability       Int                  @default(0) // 0-100
  sortOrder         Int

  // Multi-tenant
  companyId         String
  company           Company              @relation(fields: [companyId], references: [id])

  // Business requirements
  requiresMapping   Boolean              @default(false)
  requiresEstimate  Boolean              @default(false)
  requiresApproval  Boolean              @default(false)

  // Automation
  autoFollowUpDays  Int?

  // Display
  color             String?

  // Related entities
  opportunities     Opportunity[]

  // Audit
  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  @@unique([companyId, name])
  @@index([companyId])
}
```

#### 3.2 Opportunities Module
**Priority:** HIGH - Core sales tracking
**Dependencies:** Companies, Divisions, Contacts, Properties, Pipeline Stages, Users
**Status:** 🚧 TODO

**Endpoints:**
```
GET    /api/v1/opportunities                # List opportunities (tenant-scoped, filterable)
GET    /api/v1/opportunities/:id            # Get opportunity details
POST   /api/v1/opportunities                # Create opportunity
PATCH  /api/v1/opportunities/:id            # Update opportunity
DELETE /api/v1/opportunities/:id            # Soft delete opportunity
PATCH  /api/v1/opportunities/:id/stage      # Move to different stage
PATCH  /api/v1/opportunities/:id/assign     # Assign to user
POST   /api/v1/opportunities/:id/notes      # Add note
GET    /api/v1/opportunities/kanban         # Get Kanban board view (grouped by stage)
```

**Key Features:**
- Auto-generated opportunity number
- Pipeline stage tracking with history
- Financial tracking (estimated value, probability)
- Timeline management (expected close date, follow-up dates)
- Assignment to users
- Division inheritance from contact/property
- Contact and property relationship
- Notes and tags
- Status: OPEN, WON, LOST
- Loss reason tracking (when status = LOST)

**Database Schema:**
```prisma
model Opportunity {
  id                  String          @id @default(cuid())
  opportunityNumber   String          @unique // Auto-generated
  name                String
  description         String?

  // Financial
  estimatedValue      Float?
  probability         Int?            // 0-100, inherited from stage

  // Timeline
  expectedCloseDate   DateTime?
  nextFollowUpDate    DateTime?
  lastContactDate     DateTime?

  // Pipeline
  pipelineStageId     String
  pipelineStage       PipelineStage   @relation(fields: [pipelineStageId], references: [id])
  status              OpportunityStatus @default(OPEN)

  // Multi-tenant & division
  companyId           String
  company             Company         @relation(fields: [companyId], references: [id])
  divisionId          String
  division            Division        @relation(fields: [divisionId], references: [id])

  // Relationships
  contactId           String
  contact             Contact         @relation(fields: [contactId], references: [id])
  propertyId          String?
  property            Property?       @relation(fields: [propertyId], references: [id])
  assignedUserId      String?
  assignedUser        User?           @relation(fields: [assignedUserId], references: [id])

  // Closure tracking
  wonAt               DateTime?
  lostAt              DateTime?
  lossReason          String?
  closureNotes        String?

  // Metadata
  notes               String?
  tags                String[]

  // Audit
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  deletedAt           DateTime?
  createdBy           String?
  updatedBy           String?

  @@index([companyId])
  @@index([divisionId])
  @@index([contactId])
  @@index([pipelineStageId])
  @@index([status])
}
```

---

## MVP Module Summary

### ✅ Phase 1 Complete: Foundation & Multi-Tenancy
1. **Companies** - ✅ Implemented
2. **Users & Auth** - 🚧 TODO (CRITICAL BLOCKER)
3. **Divisions** - 🚧 TODO (HIGH PRIORITY)

### 🚧 Phase 2 In Progress: CRM Core
4. **Contacts** - 🚧 TODO (HIGH PRIORITY)
5. **Properties** - 🚧 TODO (HIGH PRIORITY)

### 📋 Phase 3 Planned: Sales Pipeline
6. **Pipeline Stages** - 🚧 TODO (HIGH PRIORITY)
7. **Opportunities** - 🚧 TODO (HIGH PRIORITY)

---

## Post-MVP Modules (Phase 4+)

### Phase 4: Project Execution Foundation
**Implement when opportunities need to convert to actual work**

8. **Working Categories** - Work type classification system
9. **Projects** - Convert won opportunities to executable projects
10. **Line Items** - Detailed work breakdown structure

### Phase 5: Cost Management
**Implement when projects need detailed cost tracking**

11. **Cost Categories** - Labor, Materials, Equipment, Subcontractors, Trucking
12. **Line Item Costs** - Apply costs to line items
13. **Cost Estimation Engine** - Calculate project profitability

### Phase 6: Integrations & Advanced Features
**Implement when core CRM is stable**

14. **Stripe Integration** - Subscription billing
15. **SpotOnSite Integration** - Property mapping
16. **Email/SMS Integration** - Communication tracking
17. **Document Management** - File storage and organization
18. **Electronic Signatures** - Contract signing
19. **Reporting & Analytics** - Business intelligence
20. **Customer Portal** - External client access

---

## Implementation Guidelines

### For Each Module:

1. **Schema First**
   - Define Prisma models with proper indexes
   - Run migrations: `npm run db:migrate`
   - Generate client: `npm run db:generate`

2. **Repository Layer**
   - Create `*.repository.ts` with data access methods
   - Use `*Scoped` methods for tenant-isolated queries
   - Implement soft delete support

3. **Service Layer**
   - Create admin service (`*.admin.service.ts`) - no tenancy
   - Create customer service (`*.customer.service.ts`) - tenant-scoped
   - Implement business logic and validation

4. **Controller Layer**
   - Create admin controller (`*.admin.controller.ts`)
   - Create customer controller (`*.customer.controller.ts`)
   - Extend `BaseController` for standardized responses

5. **Validation Schemas**
   - Define Zod schemas in `*.schema.ts`
   - Match Prisma schema definitions
   - Create DTOs for requests and responses

6. **Route Configuration**
   - Create route files (`admin.routes.ts`, `customer.routes.ts`)
   - Create main route factory (`*.routes.ts`) with DI
   - Mount in `RouteConfigurator.ts`

7. **Middleware Protection**
   - Admin routes: `authenticateAdmin` middleware
   - Customer routes: `authenticateJWT` + `extractTenantId` middleware
   - Role-based protection: `requireRole([...])` middleware

---

## Critical Implementation Notes

### Multi-Tenancy Enforcement
- Every tenant-scoped entity MUST have `companyId` foreign key
- Repository methods MUST filter by `companyId` (use `*Scoped` pattern)
- Middleware MUST extract `tenantId` from authenticated user
- Never expose cross-tenant data

### Division Assignment
- Default "General" division created automatically with each company
- All entities (Users, Contacts, Properties, Opportunities) MUST link to a division
- Cannot delete division if entities are linked (use `onDelete: Restrict`)
- Division hierarchy uses closure table for efficient tree queries

### Audit Fields
- `createdAt`, `updatedAt` - Automatic timestamps
- `createdBy`, `updatedBy` - User ID (nullable for system actions)
- `deletedAt` - Soft delete support (nullable)

### Error Handling
- Use domain-specific errors: `NotFoundError`, `ValidationError`, `UnauthorizedError`
- Prisma error mapping: P2025 → 404, P2002 → 409 conflict
- Global error handler catches all errors

### Authentication Flow
1. User registers or logs in → JWT + Refresh Token
2. JWT contains: `userId`, `companyId`, `role`, `divisionId`
3. Every request: JWT verified → User attached to `req.user`
4. Tenant ID extracted → Available as `req.context.tenantId`
5. Repository uses tenant ID to filter all queries

---

## Success Criteria for MVP

The MVP is considered complete when:

✅ **Multi-tenancy works:**
- Multiple companies can register and operate independently
- Data isolation is enforced (no cross-tenant leaks)
- Default "General" division created automatically

✅ **Authentication works:**
- Users can register, login, logout
- JWT tokens are issued and validated
- Role-based access control protects routes
- Refresh token flow works

✅ **CRM core works:**
- Contacts can be created and managed
- Properties can be linked to contacts
- Lead status progression works
- Division assignment works

✅ **Sales pipeline works:**
- Pipeline stages are customizable per company
- Opportunities can be created and tracked
- Opportunities move through pipeline stages
- Kanban board view works
- Opportunities show probability and estimated value

✅ **Basic reporting works:**
- List opportunities by stage
- Filter opportunities by status, date range, assigned user
- Show pipeline conversion metrics

---

## Next Steps After MVP

1. **User Acceptance Testing** - Validate core CRM workflows with real users
2. **Performance Optimization** - Add database indexes, query optimization
3. **Phase 4 Planning** - Prioritize project execution features
4. **Integration Planning** - Design external service integrations (Stripe, SpotOnSite)
5. **UI Development** - Build frontend application using this API

---

**Document Version:** 1.0
**Last Updated:** 2025-01-06
**Status:** Planning Document for MVP Implementation
