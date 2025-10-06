# 2_SOS360_Technical_Entity_Schema_System_Architecture

## Project Overview

**SOS360** is a multi-tenant SaaS ERP/CRM platform designed for asphalt contracting and exterior service companies. The
system manages the complete business lifecycle from lead generation through project completion, integrating sales
pipeline management, cost estimation, project execution, and financial reporting.

**Multi-tenant SaaS platform** designed for asphalt contracting companies with complete data isolation, role-based
access control, and integrated external services for mapping, billing, and communications.

## MVP System Architecture Overview

## CRM usage flows

1. **Guests/New Clients onboarding and creating new companies:**
- Client and Company owner contacts the SOS360 sales service
- They discuss the deals and needs of the company and agree on the terms.
- If both agreed — the customer gets a link-invited to email with a link that leads to the creating company flow in the
  CRM.
- Customer goes to this link and gets to the auth flow (like on HubSpot). Fill the form about the company as the first
  step; then after the company is created, they fill information about themselves since this person is becoming the
  first user
  and admin of the created company.
- Company and first User(admin) are created in the CRM.
- After this, the customer gets an email with congratulations and a link to the company in the CRM.
- The customer can now login into the CRM and manage/view the company.
- After these steps Customer, and all users they invited to this company, can login into 360 and manage/view only their
  own company like adding users, creating contacts, etc.

2. **Customer & company-tenant scoped**
- Customers can only access their own company data
- Customer company admins can invite new users to the company
- Customer company admins can set and change user roles and features permissions of the company
- Users can create new divisions, contacts, properties, projects, etc.

3. **CRM admin panel**
- Employees of 360(admin panel) can manage/view these new created companies, the list of them, see their data, edit,
  provide support etc.
- CRM admins can access all companies data
- CRM admins can provide support for customers/companies
- CRM admins can manage/view all companies data
- CRM admins can edit/change companies data/settings as support for customers/companies

## Entity/Modules Definitions Overview

### 1. Company (Root Tenant Entity)

**Purpose:** The Company entity represents the root tenant in the SOS360 multi-tenant architecture.
Each Company is a completely isolated asphalt contracting business with its own:

- User base and role hierarchy
- Complete dataset (contacts, projects, estimates, invoices)
- Subscription and billing relationship
- Configuration and customization settings

**Multi-tenancy:**

- All child entities MUST include `company_id` foreign key
- Database-level RLS (Row Level Security) policies enforce isolation
- API middleware validates company_id on every request

**Key Fields:**

- Business information (name, type, contact details)
- Subscription management (Stripe integration, plan, billing cycle)
- System configuration (timezone, currency, custom settings)
- Multi-tenant isolation (all data scoped to company)
- Division management (sub-organization capabilities)

**Business Logic:**

- Employees of 360(admin panel) can manage/view these new created companies, the list of them, see their data, edit,
  provide support etc.
- Customers can only access their own company data
- Company admins can access all company data
- Supports multi-tenant isolation for better security and data integrity

### 2. Division (Sub-Organization Entity)

**Purpose:** Organizational units within companies for better segmentation and statistics

**Key Fields:**

- Division information (name, description, type: geographic/service_line/market_segment/business_unit/operational)
- Contact information (phone, email, address for division-specific communications)
- Management structure (division manager, parent division for hierarchies)
- Business configuration (operating regions, specializations, budget limits, custom settings)
- Performance tracking (target revenue, target margin percentage, employee count, active project count)
- Display configuration (color coding, icons, sort order for a UI organization)

**Division Types:**

- **Geographic**: State, region, city-based organization
- **Service Line**: Paving, sealcoating, maintenance specialization
- **Market Segment**: Commercial, residential, municipal focus
- **Business Unit**: Subsidiary companies or major business lines
- **Operational**: Field ops, sales, administrative separation

**Business Logic:**

- Companies should be created with one default division called "General" (all entities at company level linked to this
  division by
  default)
- Entities can be assigned to divisions
- Division managers can access their division data + company-level data
- Company admins can access all divisions
- Supports parent-child division hierarchies for complex organizations
- Entities like Contacts, Properties, or Users will never be in a state of being linked "directly to the company" in an
  organizational sense. They will always be linked to a specific division, like the default one or new created.
- In the scenario where a user tries to remove all their custom divisions, any entities within those divisions would
  first need to be reassigned (likely to the "General" division). In fact, the onDelete: Restrict setting in the schema
  would prevent the deletion of any division that still has entities linked to it, ensuring data integrity.

### 3. Users (Company Employees)

**Purpose:** Employees of the contracting company who use the SOS360 platform

**Key Fields:**

- Personal information and authentication
- Role-based access control (executive, manager, estimator, foreman, basic_field)
- Division assignment (Should be assigned to a specific division or remain at default division "General" level)
- Session management and security
- Activity tracking
- "General" Division as Default: If a user doesn't assign an entity to a specific, custom-created division (e.g., "Texas
  Operations" or "Sealcoating Division"), it will be assigned to the "General" Division by default. This "General"
  division effectively represents the company-wide or top-level scope.

### 3. Contacts (Potential/Actual Customers)

**Purpose:** People representing businesses that may hire the contracting company

**Key Fields:**

- Personal and business contact information (name, email, phone, job title, company)
- Lead classification (commercial/residential/hoa/municipal/industrial)
- Lead source tracking (website, referral, repeat, phone_call, trade_show, etc.)
- Lead status progression (lead → prospect → qualified → customer → inactive)
- Relationship management (assigned user, follow-up dates, contact history)
- Communication preferences (preferred method: phone/email/text, opt-out settings)

### 4. Properties (Work Locations)

**Purpose:** Physical locations where asphalt/exterior work will be performed

**Key Fields:**

- Location details (address, coordinates, size)
- Property characteristics (type, surface types, access restrictions)
- Documentation (photos, site plans, work history)
- SpotOnSite integration for mapping

### 5. Working Categories (Types of Work)

**Purpose:** Standardized classification of different types of asphalt/exterior work with hierarchical organization

**Key Fields:**

- Category definition (name, description, parent/child hierarchy for subcategories)
- Measurement configuration (primary unit: SF/SY/LF/tons/gallons/each, secondary units, conversion factors)
- Business rules (typical crew size, production rate ranges, seasonal restrictions)
- Cost configuration (default markup percentages, cost factors, display settings)
- Unit pricing options (per SF, per SY, per ton, lump sum - customizable per category)

**Hierarchical Structure Examples:**

- **Milling (Parent)** → Asphalt Removal (Subcategory)
- **Asphalt Repair (Parent)** → Infrared Patching (Subcategory)
- **Surface Treatments (Parent)** → Sealcoating, Crack Sealing (Subcategories)

### 6. Pipeline Stages (Sales Process Steps)

**Purpose:** Customizable stages that opportunities progress through with automation and business logic

**Key Fields:**

- Stage definition (name, description, stage type: lead/prospect/opportunity/won/lost)
- Probability percentage (0-100% likelihood of closing)
- Business requirements (mapping required, estimate required, approval required)
- Automation rules (auto follow-up days, entry/exit actions, notification triggers)
- Workflow configuration (allowed previous/next stages, minimum values)
- Color coding and visual design (customizable per company for UI consistency)
- Email template assignments (stage-specific communication templates)
- Company customization (add/remove stages, rename stages, custom workflows)
- Industry adaptation (different stage sets for paving vs sealcoating companies)

### 7. Opportunities (Potential Sales)

**Purpose:** Specific potential projects when contacts express interest in work with complete lifecycle tracking

**Key Fields:**

- Project details (name, description, auto-generated opportunity number)
- Financial tracking (estimated value, actual value when won, probability percentage)
- Timeline management (expected close date, project start/end dates, timeline notes)
- Pipeline tracking (current stage, stage history with timestamps, assigned user)
- Competition analysis (competitor count, competitive situation, competition notes)
- Mapping integration (requires mapping flag, SpotOnSite project ID, mapping completion tracking)
- Project type assessment (maintenance vs plan work determination for routing)
- Mapping method routing (existing property → SpotOnSite, new build → takeoff programs)
- Interactive visual features (line item to map area correlation, category filtering)
- Proposal management (generation timestamp, sent tracking, email opens, view count, expiration dates)
- Follow-up automation (last contact date, next follow-up date, follow-up count, automated sequences)
- Electronic signature integration (DocuSign-style capability for proposal acceptance)
- Closure tracking (won/lost timestamps, loss reasons, closure notes)
- Metadata (tags, custom fields, notes for relationship context)
- Document attachments (proposals, maps, supporting files, takeoff plans)
- Web form source data (service preferences, property type, timeline requirements)

### 8. Projects (Actual Work)

**Purpose:** Concrete work execution when opportunities are won with comprehensive tracking

**Key Fields:**

- Project identification (auto-generated job number format: YYYY-####, project name, description)
- Contract management (contract value, signed date, terms, payment schedule, electronic signatures)
- Financial tracking (estimated vs actual costs, committed costs, profit calculations, change orders)
- Scheduling (planned vs actual start/end dates, duration tracking, weather delay accounting)
- Team assignments (project manager, foreman, crew assignments with roles and dates)
- Stakeholder sharing (foremen, superintendents, project managers, operations team)
- Quality management (safety incidents, quality issues, customer satisfaction scores, approval workflows)
- Documentation (work orders, progress photos, completion photos, customer signatures, invoices)
- Daily cost tracking (material usage, labor hours, equipment hours, trucking, additional costs)
- Customer notifications (automated schedule emails with attachments like phasing maps)
- Status management (scheduled/in_progress/completed/billed/closed with completion percentages)
- Integration (SpotOnSite project linkage, mapping data synchronization)
- Document repository (RFP details, site maps, material tickets, receipts, vendor invoices)

### 9. Line Items (Work Components)

**Purpose:** Individual, measurable work components within projects/opportunities

**Key Fields:**

- Item definition (description, work area, quantities)
- Pricing (unit price, totals, production rates)
- Scheduling (start/end dates, completion tracking)
- Quality control and change management
- SpotOnSite measurement integration

### 10. Cost Categories (Pricing Structure)

**Purpose:** Framework for applying costs to line items with five primary categories

**Core Category Types:**

1. **Labor:** Hourly rates with burden calculations (base wage × burden rate multiplier)
2. **Materials:** Unit costs with plant location factors, application rates, waste factors
3. **Equipment:** Daily/hourly rates with fuel costs and operator requirements
4. **Subcontractors:** Specialized work by working category with vendor management
5. **Trucking:** Regional rates based on distance, volume, and round-trip time calculations

**Key Fields:**

- Category definition (name, type: labor/materials/equipment/subcontractors/trucking)
- Cost calculation methods (per_unit, per_hour, lump_sum, percentage, per_load)
- Labor-specific (burden rates, base hourly rates, overtime multipliers)
- Material-specific (vendor information, markup percentages, waste factors, plant locations)
- Equipment-specific (daily/hourly rates, fuel costs, operator requirements)
- Geographic factors (location multipliers, regional cost adjustments)
- Seasonal adjustments (weather-based cost modifications)
- Business rules (minimum charges, quantity breaks, lead times, availability schedules)

### 11. Line Item Costs (Cost Application)

**Purpose:** Junction table applying specific costs from cost categories to line items

**Key Fields:**

- Cost application (quantities, unit costs, totals)
- Applied factors (burden rates, markups, adjustments)
- Vendor and resource tracking
- Status and approval workflow

---

## Entity Relationship Hierarchy

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                 COMPANY                                      ║
║                        (Root Multi-Tenant Entity)                            ║
╠══════════════════════════════════════════════════════════════════════════════╣

  ┌────────────────────────────────────────────────────────────────────────────┐
  │                           SYSTEM CONFIGURATION                             │
  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
  │ │  DIVISIONS   │ │  WORKING     │ │  PIPELINE    │ │    COST      │        │
  │ │ (Org Units)  │ │ CATEGORIES   │ │  STAGES      │ │ CATEGORIES   │        │
  │ │              │ │ (Types of    │ │ (Sales Flow) │ │ (Pricing     │        │
  │ │              │ │    Work)     │ │              │ │ Framework)   │        │
  │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
  └────────────────────────────────────────────────────────────────────────────┘
              │
              ▼ (division assignment)
  ┌────────────────────────────────────────────────────────────────────────────┐
  │                             HUMAN RESOURCES                                │
  │ ┌──────────────┐                                                           │
  │ │    USERS     │ ◄── should be assigned to divisions, or remain at         │
  │ │ (Employees)  │     default division called "General"                     │
  │ └──────────────┘                                                           │
  └────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────────────────────────┐
  │                          CUSTOMER MANAGEMENT                             │
  │ ┌──────────────┐        ┌──────────────┐                                 │
  │ │  CONTACTS    │ ──1:N─→│ PROPERTIES   │ ◄── can be tied to divisions    │
  │ │ (Decision-   │        │ (Work        │     for regional mgmt           │
  │ │  Makers)     │        │ Locations)   │                                 │
  │ └──────────────┘        └──────────────┘                                 │
  │       │ ▲                      │ ▲                                       │
  │       │ │                      │ │                                       │
  │       │ └─ division assignment ┘ │                                       │
  │       └────── creates (1:N) ─────┘                                       │
  └──────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
  ┌────────────────────────────────────────────────────────────────────────────┐
  │                             SALES PIPELINE                                 │
  │ ┌────────────────────────────────────────────────────────────────────────┐ │
  │ │                            OPPORTUNITIES                               │ │
  │ │                        (Potential Projects)                            │ │
  │ │ Lead → Prospect → Qualified → Proposal → Won/Lost                      │ │
  │ │ ▲── can inherit division from contact/property                         │ │
  │ └────────────────────────────────────────────────────────────────────────┘ │
  └────────────────────────────────────────────────────────────────────────────┘
                                  │
                            when Won ▼
  ┌────────────────────────────────────────────────────────────────────────────┐
  │                           PROJECT EXECUTION                                │
  │ ┌──────────────┐                  ┌──────────────┐                         │
  │ │  PROJECTS    │ ──contains (1:N)→│ LINE ITEMS   │                         │
  │ │ (Actual Work)│                  │ (Work Units) │                         │
  │ │ ▲ division   │                  └──────────────┘                         │
  │ │  tracking    │                         │                                 │
  │ └──────────────┘                         │ applies costs                   │
  │                                          ▼                                 │
  │                                ┌──────────────────┐                        │
  │                                │ LINE ITEM COSTS  │                        │
  │                                │ (Cost Allocation)│                        │
  │                                └──────────────────┘                        │
  └────────────────────────────────────────────────────────────────────────────┘

KEY RELATIONSHIPS
══════════════════════════════════════════════════════════════════════════════

HIERARCHICAL (Parent → Child)
- Company → Divisions, Users, Contacts, Properties, Working Categories, Pipeline Stages, Cost Categories
- Division → Users (users should be scoped to default division or assigned to another created divisions)
- Division → Contacts (for regional assignment; should be scoped to default division or assigned to another created divisions)
- Division → Properties (for regional assignment; should be scoped to default division or assigned to another created divisions)
- Division → Opportunities (inherited from Contact/Property or explicit; should be scoped to default division or assigned to another created divisions)
- Division → Projects (inherited from Opportunity or explicit; should be scoped to default division or assigned to another created divisions)
- Contact → Properties (1:N; one contact manages multiple properties)
- Property → Opportunities (1:N; one location can have many projects)
- Opportunity → Project (1:1; won opp becomes a project)
- Project → Line Items (1:N; projects split into components)

CROSS-REFERENCE (Many:Many)
- Line Items ↔ Cost Categories (via Line Item Costs junction table)
- Users ↔ Opportunities (assignment/ownership)
- Working Categories ↔ Line Items (classification of work)

STATE TRANSITIONS
- Contact: Lead → Prospect → Qualified → Customer
- Opportunity: Lead → Prospect → Qualified → Proposal → Won/Lost
- Project: Scheduled → In Progress → Completed
- Line Item: Pending → In Progress → Completed

DATA FLOW PATTERNS
- Sales: Contact → Property → Opportunity → Project → Line Items
- Costing: Cost Categories → Line Item Costs → Project Totals
- Execution: Work Orders → Field Data → Actual Costs → Profitability
```

---

## Application Flow Architectures

### Flow 1: SOS360 Employee Application (Admin/Support)

**Purpose**: Internal application for SOS360 employees to manage platform, customers, and support

**User Types**: Super Admin, Support Staff, Sales Team, Technical Support

**Architecture**:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                             SOS360 ADMIN PORTAL                              ║
╠══════════════════════════════════════════════════════════════════════════════╣

  DASHBOARD OVERVIEW
  ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
  │   PLATFORM        │ │   CUSTOMER        │ │   BUSINESS        │
  │   METRICS         │ │   HEALTH          │ │   OPERATIONS      │
  │                   │ │                   │ │                   │
  │ • Total Users     │ │ • Active Tenants  │ │ • Support Queue   │
  │ • System Load     │ │ • MRR / ARR       │ │ • Bug Reports     │
  │ • API Requests    │ │ • Churn Rate      │ │ • Feature Reqs    │
  │ • Uptime          │ │ • Usage Stats     │ │ • Deployments     │
  └───────────────────┘ └───────────────────┘ └───────────────────┘


  CUSTOMER MANAGEMENT
  ┌────────────────────────────────────────────────────────────────────────────┐
  │                           COMPANY DIRECTORY                                │
  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
  │ │   SEARCH     │ │   FILTER     │ │    SORT      │ │   ACTIONS    │        │
  │ │              │ │              │ │              │ │              │        │
  │ │ • By Name    │ │ • By Plan    │ │ • By MRR     │ │ • Impersonate│        │
  │ │ • By Email   │ │ • By Status  │ │ • By Usage   │ │ • Suspend    │        │
  │ │ • By Domain  │ │ • By Region  │ │ • By Date    │ │ • Support    │        │
  │ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
  └────────────────────────────────────────────────────────────────────────────┘

╚══════════════════════════════════════════════════════════════════════════════╝
```

**Key Features for SOS360 Employees**:

1. **Cross-Customer Visibility**: View all companies and their data
2. **Customer Impersonation**: Log in as customer to troubleshoot issues
3. **Billing Management**: Handle subscriptions, upgrades, downgrades
4. **Platform Monitoring**: System health, performance, usage analytics
5. **Support Tools**: Ticket management, knowledge base, customer communication
6. **Business Intelligence**: Revenue analytics, customer metrics, growth tracking

**Data Access Pattern**:

- Full database access across all companies
- Audit logging of all admin actions
- Role-based permissions for different admin functions
- Customer data export/import capabilities

---

### Flow 2: Customer Application (Contractor CRM)

**Purpose**: Multi-tenant SaaS application for asphalt contractors to manage their business operations

**User Types**: Executive, Manager, Estimator, Foreman, Basic Field User

**Architecture**:

```
╔═════════════════════════════════════════════════════════════════════════════╗
║                       CONTRACTOR BUSINESS PORTAL                            ║
║                    (Company: ABC Paving Solutions)                          ║
╠═════════════════════════════════════════════════════════════════════════════╣

  ┌───────────────────────────────┐
  │       ROLE-BASED DASHBOARDS   │
  └───────────────────────────────┘

  ┌───────────────────────────────────────────────────────────────────────────┐
  │ EXECUTIVE DASHBOARD                 │ ESTIMATOR DASHBOARD                 │
  │ ┌───────────────┐ ┌───────────────┐ │ ┌──────────────┐ ┌────────────────┐ │
  │ │   FINANCIAL   │ │   PIPELINE    │ │ │ MY ACTIVE    │ │   MAPPING      │ │
  │ │ • Revenue:1.2M│ │ • Open Ops:45 │ │ │ OPPORTUNITIES│ │   TOOLS        │ │
  │ │ • Profit: 32% │ │ • Close: 65%  │ │ │ • Proposals:3│ │ • SpotOnSite   │ │
  │ │ • Backlog:800K│ │ • Avg Deal:18K│ │ │ • Follow-ups:7││ • Takeoffs     │ │
  │ └───────────────┘ └───────────────┘ │ └──────────────┘ └────────────────┘ │
  ├─────────────────────────────────────┼─────────────────────────────────────┤
  │ MANAGER DASHBOARD                   │ FOREMAN DASHBOARD                   │
  │ ┌───────────────┐ ┌───────────────┐ │ ┌──────────────┐ ┌────────────────┐ │
  │ │ OPERATIONS    │ │ TEAM METRICS  │ │ │ TODAY’S JOBS │ │   FIELD        │ │
  │ │ • Jobs Today:8│ │ • Crew Util:85%││ │ • Job:2024-  │ │   REPORTS      │ │
  │ │ • Equipment:12│ │ • Efficiency   ││ │   0847       │ │ • Progress     │ │
  │ │ • Materials   │ │ • Safety Score ││ │ • Materials  │ │   Photos       │ │
  │ └───────────────┘ └───────────────┘ │ │   Needed     │ │ • Time Entry   │ │
  │                                     │ └──────────────┘ └────────────────┘ │
  └───────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────┐
  │ CUSTOMER RELATIONSHIP MGMT    │
  └───────────────────────────────┘
  ┌────────────────────────────────────────────────────────────────────────────┐
  │ ┌───────────────┐ ┌──────────────┐ ┌────────────────┐ ┌──────────────┐     │
  │ │  CONTACTS     │ │  PROPERTIES  │ │ OPPORTUNITIES  │ │  PIPELINE    │     │
  │ │ • Add / Import│ │ • Location   │ │ • Lead→Prospect│ │ • Stages     │     │
  │ │ • Search      │ │ • Gallery    │ │ • Mapping Req? │ │ • Follow-up  │     │
  │ │ • Filter/Export││ • History    │ │ • Estimate     │ │  Rules       │     │
  │ └──────────────┘  └──────────────┘ └────────────────┘ └──────────────┘     │
  └────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────┐
  │ ESTIMATION & MAPPING WORKFLOW │
  └───────────────────────────────┘
  ┌───────────────────────────────────────────────────────────────────────────┐
  │ SPOTONSITE INTEGRATION                                                    │
  │ Property: Walmart Plaza Shopping Center                                   │
  │ [Satellite View] [Measurement Tools] [Area Classification]                │
  │                                                                           │
  │ Measured Areas            → Line Items                                    │
  │ • Main Lot: 45,000 SF     → Sealcoating: 45,000 SF                        │
  │ • Loading Zone: 8,000 SF  → Crack Sealing: 2,500 LF                       │
  │ • Fire Lanes: 2,500 LF    → Fire Lane Striping: 2,500 LF                  │
  │ • Parking Spaces: 180     → Parking Spaces: 180                           │
  ├───────────────────────────────────────────────────────────────────────────┤
  │ COST ENGINE                                                               │
  │ Line Item: Sealcoating 45,000 SF                                          │
  │ • Labor: 32 hrs @ $65/hr   = $2,080                                       │
  │ • Materials: 675 gal @4.50= $3,038                                        │
  │ • Equipment: 2 days @250  = $500                                          │
  │ • Trucking: 4 loads @125  = $500                                          │
  │ → TOTAL COST: $6,118 | SELL PRICE: $9,900 | MARGIN: 38%                   │
  └───────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────┐
  │ PROJECT EXECUTION & TRACKING  │
  └───────────────────────────────┘
  ┌────────────────────────────────────────────────────────────────────────────┐
  │ PROJECT DASHBOARD                                                          │
  │ Job #2024-0847: Walmart Plaza Sealcoating                                  │
  │ Status: In Progress | Crew: Team Alpha | Foreman: Mike Rodriguez           │
  │ [Schedule] [Materials] [Labor] [Equipment] [Progress] [Photos]             │
  │ COST: Estimated $6,118 | Actual $5,950 | Variance: -$168 (2.7% under)      │
  │ COMPLETION: ███████████████░░░ 75% | ETA: Tomorrow 3:00 PM                 │
  ├────────────────────────────────────────────────────────────────────────────┤
  │ FIELD DATA COLLECTION                                                      │
  │ Daily Report: Jan 15, 2024                                                 │
  │ • Materials: Sealer 425 gal | Crack Fill 15 lbs | Sand 2 tons              │
  │ • Labor: Crew 6×8 hrs | Equipment 8 hrs | Trucking 2 loads                 │
  │ • Progress: Main lot prep ✓ | 60% sealed | Striping ready                  │
  │ [Upload Photos] [Record Issues] [Submit Report]                            │
  └────────────────────────────────────────────────────────────────────────────┘

  ┌───────────────────────────────┐
  │ REPORTING & ANALYTICS         │
  └───────────────────────────────┘
  ┌───────────────────────────────────────────────────────────────────────────┐
  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                        │
  │ │ FINANCIAL    │ │ OPERATIONAL  │ │ SALES & MKTG │                        │
  │ │ • Profit     │ │ • Job Costing│ │ • Pipeline   │                        │
  │ │ • Cash Flow  │ │ • Crew Prod. │ │ • Lead Srcs  │                        │
  │ │ • Margins    │ │ • Equipment  │ │ • Conversion │                        │
  │ │ • Backlog    │ │ • Materials  │ │ • Win/Loss   │                        │
  │ └──────────────┘ └──────────────┘ └──────────────┘                        │
  └───────────────────────────────────────────────────────────────────────────┘

╚═════════════════════════════════════════════════════════════════════════════╝
```

**Key Business Workflows for Customers**:

1. **Lead Intake**: Web form → Contact creation → Property linking → Opportunity creation
2. **Lead Distribution**: Unassigned pool → Lead/prospect column separation → Account manager assignment
3. **Project Type Routing**: Maintenance work → Auto SpotOnSite creation | Plan work → Takeoff program
4. **Mapping Workflow**: Existing property → SpotOnSite | New build → Takeoff program (PlanSwift preferred)
5. **Sales Process**: Qualification → Mapping → Estimation → Proposal → Follow-up → Electronic signature → Close
6. **Project Execution**: Won opportunity → Project creation → Stakeholder sharing → Scheduling → Customer
   notification → Field work → Daily cost tracking → Completion
7. **Visual Integration**: Line items match repair areas → Category filtering → Cost reflection → Customer portal access
8. **Cost Tracking**: Estimated costs → Actual field data → Real-time variance analysis → Profitability reporting
9. **Document Flow**: Proposal generation → Electronic signature → Contract storage → Project documentation → Invoice
   generation → Payment tracking
10. **Customer Portal**: Project sharing → Real-time updates → Document access → Communication tracking

**Data Security & Isolation**:

- Row-level security ensuring companies only see their data
- Role-based permissions within each company
- API rate limiting per tenant
- Audit logging of all user actions
- Data backup and recovery per tenant

**Integration Points**:

- **SpotOnSite**: Comprehensive mapping integration with:
    - **Bidirectional Sync**: Real-time data synchronization between systems
    - **Automatic Project Creation**: Maintenance work triggers auto-creation
    - **Interactive Visual Mapping**: Category building and line-item granularity
    - **State Persistence**: Map visibility maintained throughout workflow
    - **Dual-Screen Support**: Simultaneous SOS & SOS360 access during estimation
- **Takeoff Programs**: PlanSwift (preferred) and BlueBeam integration for:
    - **Architectural Plan Processing**: Scale measurement and unit conversion
    - **Direct Import**: Automatic population of SOS360 line items
    - **Blueprint Workflows**: New build and engineered plan handling
- **Electronic Signature**: DocuSign-style integration for contract execution and proposal acceptance
- **Web Form System**: Lead capture with:
    - **4-Section Structure**: Contact info, project details, additional info, call-to-action
    - **Automatic Routing**: CRM population with lead type classification
    - **Validation Logic**: Required field enforcement and data quality checks
- **Stripe**: Subscription billing and payment processing with multi-tenant support
- **Email/SMS**: Major email provider compatibility with automated follow-ups and escalation
- **Document Storage**: Comprehensive document management (S3/CloudFlare) for contracts, invoices, project files
- **Calendar**: Scheduling integration (Google Calendar, Outlook) with automated notifications
- **Communication Tracking**: Email open/click tracking with conversation history
- **Customer Portal**: White-label portal for client access to project information

---

[//]: # (!!!Future features, out of MVP scope, skip for now!!!)

## !!!Future features, out of MVP scope, skip for now!!!

## Advanced System Features

### Customer Portal Architecture

**Purpose**: Multi-level portal system allowing customers' customers to access project information

**Key Components:**

- **Access Control**: Portal linked to specific point of contact emails with multiple contact support
- **Information Display**: RFPs sent, awarded jobs, project schedules, site maps, project documentation
- **Real-Time Updates**: Live project status synchronization
- **White-Label Branding**: Reflects contractor's branding and company colors
- **Security**: Role-based access with secure authentication

**Portal Features:**

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                              CUSTOMER PORTAL                                 ║
║                   (Example: CBRE Property Management)                        ║
╠══════════════════════════════════════════════════════════════════════════════╣

  DASHBOARD VIEW
  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
  │   ACTIVE RFPs    │ │   AWARDED JOBS   │ │    SCHEDULES     │
  │                  │ │                  │ │                  │
  │ • Westfield      │ │ • Gateway Plaza  │ │ • Upcoming Work  │
  │   Shopping       │ │   Sealcoating    │ │ • Crew Assign.   │
  │ • Metro Office   │ │ • Downtown       │ │ • Weather Deps   │
  │   Complex        │ │   Repairs        │ │                  │
  └──────────────────┘ └──────────────────┘ └──────────────────┘


  PROJECT DETAILS
  ┌────────────────────────────────────────────────────────────────────────────┐
  │ Project: Gateway Plaza Sealcoating                                         │
  │ Status: In Progress | Completion: 75% | Expected: Tomorrow 3 PM            │
  │                                                                            │
  │ [Site Maps] [Progress Photos] [Schedule Updates] [Contact Crew]            │
  │                                                                            │
  │ Recent Updates:                                                            │
  │ • 01/15: Prep work completed, sealcoating 60% done                         │
  │ • 01/14: Weather delay, rescheduled from Wednesday                         │
  │ • 01/13: Crew arrived on-site, crack sealing completed                     │
  └────────────────────────────────────────────────────────────────────────────┘

╚══════════════════════════════════════════════════════════════════════════════╝
```

### Document Management System

**Architecture**: Comprehensive file storage and organization system

**Document Categories:**

1. **Contract Documents**
    - Signed contracts (electronic signature integration)
    - Change orders with approval workflows
    - Legal agreements and amendments

2. **Financial Documents**
    - Customer invoices with payment tracking
    - Supplier/vendor invoices with cost allocation
    - Subcontractor invoices and payment records

3. **Project Documents**
    - RFP details and specifications
    - Site maps and phasing plans
    - Material tickets and delivery records
    - Trucking tickets and logistics documentation
    - Receipts and expense records
    - Progress photos with timestamps
    - Completion documentation

**Technical Implementation:**

- **Storage**: Cloud-based with CDN distribution
- **Organization**: Job-specific filing with automatic categorization
- **Search**: Full-text search and metadata filtering
- **Version Control**: Document revision tracking
- **Access Control**: Role-based permissions per document type
- **Integration**: Automatic document generation from workflow actions

### Electronic Signature Integration

**Capability**: DocuSign-style electronic signature system

**Features:**

- **Proposal Signing**: Customers sign proposals through trackable links
- **Contract Execution**: Full contract signing workflows
- **Change Order Approvals**: Electronic approval for project modifications
- **Legal Compliance**: Audit trails and signature verification
- **Mobile Support**: Sign on any device
- **Status Tracking**: Real-time signature status updates

### Critical System Integration Requirements

**SOS360 ↔ SpotOnSite Synchronization:**

- **Pipeline Stage Matching:** Pipeline stages must match Opportunity Statuses & Job Statuses in SOS360
- **Terminology Alignment:** System uses "Add Opportunity" (not "New Lead") to match SOS360
- **Auto-Population:** Job numbers created in 360 auto-populate in CRM system
- **Navigation Integration:** CRM module click in 360 → Direct redirect to pipeline Kanban view
- **Line Item Synchronization:** Line items must match project summary items in SOS
- **Dual-Screen Architecture:** Support simultaneous SOS & SOS360 access for estimators

**Global System Rules:**

- **Map Visibility Persistence:** Maps remain visible throughout workflow (job-level = all layers, line item = filtered
  view)
- **State Preservation:** Back button returns to exact prior state (filters, pagination intact)
- **Bidirectional Communication:** Email/SMS in both Executive and Contractor CRMs
- **Activity Tracking:** All email activity logged (sent, opened, unopened)
- **Automated Escalation:** Unopened emails trigger SMS or manual follow-up reminders
- **Configurable Inactivity:** Triggers for SOS360 (login/activity) and CRM (deal movement)
- **AI Integration:** AI calls preferred for scheduling; fallback to manual task triggers
- **Cost Library:** Preloaded materials/equipment data with placeholder estimation capability
- **Complete Separation:** Executive and Contractor CRMs have distinct dashboards and data
- **Role-Based Security:** Permissions defined by user role from system launch

---

### Web Form Lead Capture System

**Architecture**: Comprehensive lead capture system with automatic CRM integration

**4-Section Form Structure:**

1. **Section 1: Contact Information**
    - Full Name (Required - text input with validation)
    - Company Name (Optional - text input)
    - Phone Number (Required - formatted input with validation)
    - Email Address (Required - email validation)
    - Preferred Contact Method (Dropdown: Phone, Email, Text)

2. **Section 2: Project Details**
    - Type of Service Needed (Multi-select checkboxes):
        - Asphalt Paving
        - Sealcoating
        - Crack Sealing
        - Striping
        - Repairs/Maintenance
        - Other (with expandable text field)
    - Property Type (Single-select dropdown):
        - Commercial
        - Residential
        - Industrial
        - HOA/Community
    - Project Location (Address validation with geocoding)
    - Estimated Project Size (Dropdown with custom input option)
    - Timeline for Project (Priority dropdown):
        - ASAP (high priority flag)
        - Within 1 Month (medium priority)
        - 1-3 Months (normal priority)
        - Flexible (low priority)

3. **Section 3: Additional Information**
    - File Upload (Photos/Site Plans - multiple file support, image optimization)
    - Notes/Special Requests (Rich text area with character limit)

4. **Section 4: Call to Action**
    - Submit Button: "Submit Request for Quote" (with loading states)
    - Confirmation Message: "Thanks! Our team will reach out within 24 hours."
    - Follow-up Actions: Automatic email confirmation + internal notifications

**Technical Features:**

- **Data Validation**: Real-time field validation with error messaging
- **Lead Classification**: Automatic assignment based on property type and service selection
- **CRM Integration**: Direct population of Contact and Opportunity records
- **Notification System**: Instant alerts to assigned sales team members
- **Analytics Tracking**: Form completion rates, abandonment analysis
- **Mobile Optimization**: Responsive design with touch-friendly inputs
- **Spam Protection**: reCAPTCHA integration and duplicate submission prevention

### Customization & Branding System

**Company Customization:**

- **Pipeline Stages**: Add, remove, rename stages per company
- **Color Schemes**: Custom color palettes for company branding
- **Logo Integration**: Company logos in portals and proposals
- **Email Templates**: Custom templates for all communication types
- **Workflow Rules**: Company-specific automation settings

**Industry Adaptation:**

- **Service Types**: Customize for paving, sealcoating, striping, maintenance
- **Measurement Units**: Industry-specific units and calculations
- **Cost Categories**: Adapt cost structures to company operations
- **Reporting**: Industry-specific KPIs and metrics

---

This technical specification provides the complete foundation for database schema design, API endpoint creation, and
application architecture for both the customer-facing SaaS platform and internal admin tools.