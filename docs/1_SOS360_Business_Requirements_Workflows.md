# 1_SOS360_Business_Requirements_Workflows

## Executive Summary

**SOS360** is a cloud-based, all-in-one ERP and CRM platform specifically designed for building contractors and exterior
service companies. The platform replaces fragmented tools with a unified solution that manages the entire customer
lifecycle from initial lead capture through project completion and profitability analysis.

### Target Market

- **Primary:** Small to medium-sized asphalt paving companies
- **Secondary:** Exterior service contractors (sealcoating, striping, maintenance)
- **End Users:** Company executives, managers, estimators, sales teams, field crews

### Core Value Proposition

- Replace 5-7 separate tools with one integrated platform
- Reduce estimation time by 60% through mapping integration
- Improve profit margins through real-time cost tracking
- Increase sales conversion with automated follow-ups

---

## Core Business Entities (What They Represent)

### Company

**What it is:** The asphalt contracting business that subscribes to and uses SOS360.

**Real-world examples:**

- "ABC Paving Solutions" - a company that does asphalt paving, sealcoating, and striping
- "Metro Sealcoating LLC" - a business specializing in driveway and parking lot maintenance
- "City Pavement Contractors" - a contractor focusing on municipal and commercial work

**Business characteristics:**

- Each company has completely separate data (ABC Paving cannot see Metro Sealcoating's information)
- Contains subscription and billing information managed through Stripe
- Can customize their own settings like pipeline stages, email templates, and follow-up rules
- Has multiple employees (Users), customers (Contacts), work locations (Properties), and sales opportunities
- Can optionally create Divisions for better organization and statistics

### Division (Sub-Organization)

**What it is:** Organizational units within a company that allow for better segmentation and statistics
gathering.

**Real-world examples:**

- **Geographic Divisions**: "Texas Operations", "Northeast Division", "California Region"
- **Service Line Divisions**: "Paving Division", "Sealcoating Division", "Maintenance Division"
- **Market Segment Divisions**: "Commercial Division", "Municipal Division", "Residential Division"
- **Operational Divisions**: "Field Operations", "Sales Division", "Administrative Division"

**Key Characteristics:**

- **Required**: Companies start with one division called "General' (all data at company level)
- **Flexible Assignment**: Users, contacts, opportunities, projects can be assigned to specific divisions
- **Company Boundaries**: Divisions exist within company scope - Division A cannot see Division B's data, but company
  admins see all
- **Statistics Segmentation**: Enable division-specific reporting while maintaining company totals
- **Reassignment Capability**: Entities can be moved between company-level and division-level or between divisions
- **Hierarchical Structure**: Divisions can have parent-child relationships

**Business Benefits:**

- **Performance Tracking**: Compare division performance (revenue, margins, efficiency)
- **Resource Management**: Allocate users and resources to specific divisions
- **Geographic Organization**: Organize operations by state, region, or territory
- **Service Specialization**: Separate different types of work (paving vs maintenance)
- **Scalability**: As company grows, divisions help maintain organization

### Contact/Lead

**What it is:** A person representing a business or property who may become a customer of the asphalt contractor.

**Real-world examples:**

- Sarah Johnson, Property Manager at Westfield Shopping Center
- Mike Rodriguez, HOA Board President at Sunset Community
- Jennifer Chen, Facilities Manager at TechCorp Office Building
- David Smith, Homeowner needing driveway work

**Lifecycle progression:**

- **Lead:** Someone who just filled out a web form or called - we know about them but haven't qualified them yet
- **Prospect:** We've spoken with them and confirmed they have real projects and budget
- **Qualified:** They have confirmed need, budget, authority, and timeline
- **Customer:** They've hired us for work (have completed projects)

**Lead Type Classification System:**
| Lead Type | Color Code | Note Style | Special Features |
|-----------|------------|------------|------------------|
| **Commercial Property Owner** | Blue | Bold header + bullet points | Standard processing |
| **HOAs & Residential Communities** | Green | Italicized for softer tone | Community-focused messaging |
| **Municipal & Government Contracts** | Purple | Includes compliance checklist | Regulatory requirements tracking |
| **General Contractors / Builders** | Orange | Tag with "Bid Required" | Competitive bidding workflows |
| **Facility Managers / Maintenance** | Red | Emphasize scheduling needs | Priority scheduling features |
| **Repeat Clients / Referrals** | Yellow | Add icon for quick ID | Relationship history integration |
| **Inbound Digital Leads** | White | Include "Needs Qualification" tag | Qualification workflow triggers |

**Key information tracked:**

- Personal details (name, phone, email, job title)
- Company they work for and their role
- Type of properties they manage (Commercial, HOA, Municipal, Residential, Industrial)
- How they found us (website, referral, repeat customer, trade show, etc.)
- Communication preferences and contact history
- Lead source classification and visual coding system

### Property

**What it is:** A physical location where asphalt or exterior work will be performed.

**Real-world examples:**

- Walmart Plaza Shopping Center - 123 Main Street, Dallas, TX (45,000 SF parking lot)
- Sunset Community Pool Area - 456 Oak Drive, Austin, TX (12,000 SF surrounding pavement)
- Corporate Headquarters Parking Structure - 789 Business Blvd, Houston, TX (3-level garage)
- Residential home - 321 Elm Street, Springfield (2,400 SF driveway)

**Key characteristics:**

- Always linked to a Contact (the person who manages or makes decisions about the property)
- Contains detailed address and location information for crew routing
- Includes property specifications: total size, surface types, access restrictions
- May include photos, site plans, or documentation from previous work
- Can have multiple projects over time (sealcoating this year, repairs next year)

### Opportunity

**What it is:** A specific potential project - when a Contact expresses interest in getting particular work done at a
specific Property.

**Real-world example:**
Sarah Johnson (Contact) calls ABC Paving saying Westfield Shopping Center (Property) needs sealcoating work done next
month with an estimated budget of \$25,000.

**Key characteristics:**

- Always connected to both a Contact and a Property
- Contains project details: estimated value, timeline, specific services needed
- Has a current pipeline stage (Lead → Prospect → Opportunity → Won/Lost)
- Tracks probability of closing and expected close date
- Includes competitive information (how many other contractors are bidding)
- Has a "Mapping Needed?" flag to determine if satellite measurement is required

### Project/Job

**What it is:** The actual work that gets performed when an Opportunity is won and a customer accepts a proposal.

**Real-world example:**
When Sarah Johnson accepts ABC Paving's proposal for \$23,000, Opportunity "Westfield Sealcoating 2024" becomes Project
#2024-0847 with specific work specifications, crew assignments, and delivery schedule.

**Key characteristics:**

- Created automatically when an Opportunity status changes to "Won"
- Has a unique Job Number for tracking and reference (format: YYYY-####, like 2024-0847)
- Contains all work specifications broken down into detailed Line Items
- Tracks both estimated costs (from the original proposal) and actual costs (as work is performed)
- Includes scheduling information, crew assignments, and progress tracking
- Links to work orders, invoices, photos, and completion documentation

### Line Item

**What it is:** Individual, measurable components of work within a Project or Opportunity.

**Real-world examples:**

- Crack Sealing: 2,500 linear feet at \$1.50 per LF = \$3,750
- Sealcoating: 45,000 square feet at \$0.35 per SF = \$15,750
- Parking Space Striping: 125 spaces at \$15 per space = \$1,875
- Asphalt Patching: 200 square yards at \$12 per SY = \$2,400

**Key characteristics:**

- Each has a specific unit of measurement (SF, SY, LF, gallons, tons, each)
- Connected to Working Categories (defines what type of work this is)
- Contains both estimated quantities (from mapping/scoping) and actual quantities (from field crews)
- Has estimated costs (used in proposals) and actual costs (tracked during execution)
- Can be scheduled independently (different line items might happen on different days)

### Working Category

**What it is:** A standardized classification system for different types of asphalt and exterior work.

**Real-world examples:**

- **Sealcoating:** Applying protective coating to asphalt surfaces
- **Crack Sealing:** Filling cracks to prevent water damage
- **Striping:** Painting parking space lines and traffic markings
- **Paving:** Installing new asphalt surfaces
- **Concrete:** Sidewalk, curb, or dumpster pad work

**Business purpose:**

- Helps organize different types of work for estimating and scheduling
- Each category has specific measurement units and pricing methods
- Determines what equipment and crew skills are needed
- Affects production rates and seasonal restrictions
- Can have parent/child relationships (Milling → Asphalt Removal)

### Cost Category

**What it is:** The framework for applying different types of costs to Line Items.

**The five main cost categories:**

1. **Labor:** Crew wages with burden rates (taxes, benefits, overhead)
2. **Materials:** Asphalt, sealcoat, paint, aggregates with supplier pricing
3. **Equipment:** Daily/hourly rates for pavers, rollers, sealcoating machines
4. **Subcontractors:** Specialized work contracted to other companies
5. **Trucking:** Hauling costs based on distance, volume, and round-trip time

**Business purpose:**

- Ensures accurate cost estimation by breaking down all expense types
- Allows for different pricing methods (per hour, per unit, lump sum)
- Accounts for geographic factors (city work costs more than rural)
- Includes seasonal adjustments (winter work costs more)
- Tracks vendor relationships and preferred supplier pricing

### Pipeline Stage

**What it is:** Customizable steps that track how Opportunities progress through the sales process.

**Typical progression:**

- **Lead:** Initial inquiry, not yet qualified
- **Prospect:** Qualified contact with confirmed need and budget
- **Proposal Sent:** Estimate completed and proposal delivered to customer
- **Negotiation:** Customer reviewing proposal, may request changes
- **Won:** Customer accepted proposal, becomes a Project
- **Lost:** Customer declined or went with competitor

**Customization features:**

- Each company can customize stage names and order
- Each stage has probability percentage (how likely to close)
- Automation rules (automatic follow-up emails, task creation)
- Color coding for visual pipeline management
- Requirements (mapping needed, estimate required, approval needed)

---

## Industry Context & Terminology

### Working Categories (Comprehensive Types of Work)

#### Primary Asphalt Categories

**Milling**

- **Description:** Removal of existing asphalt surface prior to paving using specialized milling machines
- **Measured in:** Square Feet (SF), Square Yards (SY), Tons
- **Material calculation:** Expected tons = (SF ÷ 9) × depth_inches × 0.0833 × 145_lbs_per_CF ÷ 2000
- **Typical projects:** Parking lot resurfacing, road rehabilitation, surface preparation
- **Equipment required:** Milling machine, loader, dump trucks
- **Pricing factors:** Depth of cut, accessibility, disposal costs, trucking distance
- **Production rates:** 1,000-3,000 SF/hour depending on depth and conditions
- **Quality considerations:** Surface texture, grade maintenance, debris removal

**Paving (New Construction)**

- **Description:** Installing fresh asphalt surfaces over prepared aggregate base
- **Measured in:** SF, SY, Tons (conversion: 1 ton covers ~80-100 SF at 3" depth)
- **Material types:** Hot Mix Asphalt (HMA), Warm Mix Asphalt (WMA), Stone Matrix Asphalt (SMA)
- **Typical projects:** New parking lots, road construction, driveway installation
- **Equipment required:** Paver, rollers (breakdown, intermediate, finish), material transfer vehicle
- **Temperature requirements:** HMA: 275-325°F at plant, min 225°F at placement
- **Compaction standards:** 92-96% of theoretical maximum density
- **Weather restrictions:** No paving below 40°F air temp, dry conditions required

**Overlay/Resurfacing**

- **Description:** Applying new asphalt layer over existing pavement without removal
- **Thickness range:** 1.5" - 4" typically
- **Pre-work requirements:** Crack sealing, pothole repair, surface cleaning
- **Tack coat application:** 0.05-0.10 gallons per SY between layers
- **Adjustment considerations:** Drainage patterns, curb height, utility covers

**Patching (Removal & Replace)**

- **Description:** Full-depth removal and replacement of failed asphalt sections
- **Types:** Utility cuts, pothole repairs, isolated failures, edge repairs
- **Depth considerations:** Match existing pavement or full-depth to base
- **Base repair:** Often requires aggregate base repair/replacement
- **Compaction challenges:** Limited space, hand tamping, plate compactors
- **Joint treatment:** Proper tie-in to existing pavement edges

**Infrared Patching**

- **Description:** Heating existing asphalt to 300°F+, scarifying, adding new material, re-compacting
- **Applications:** Pothole repair, utility cuts, seamless repairs
- **Material requirements:** Compatible asphalt mix, rejuvenating agents
- **Weather advantages:** Can work in cooler temperatures than conventional paving
- **Production rate:** 8-12 patches per hour per unit
- **Cost factors:** Equipment mobilization, fuel costs, new material percentage

#### Surface Treatment Categories

**Sealcoating**

- **Description:** Application of protective emulsion coating to preserve asphalt surfaces
- **Types:** Coal tar emulsion, asphalt emulsion, acrylic, polymer-modified
- **Coverage rates:** 0.12-0.18 gallons per SF (varies by surface condition and coat count)
- **Application methods:** Spray application, squeegee application
- **Weather requirements:** 50°F+ air temp, no rain for 24 hours, low humidity preferred
- **Drying time:** 4-8 hours traffic restriction, 24 hours full cure
- **Frequency:** Every 2-3 years for optimal protection
- **Surface prep:** Crack sealing, cleaning, oil spot treatment required

**Crack Sealing**

- **Description:** Filling pavement cracks with rubberized sealant to prevent water infiltration
- **Crack types:** Transverse, longitudinal, block, alligator, reflection
- **Material types:** Hot-applied rubberized, cold-applied liquid crack fillers
- **Application temperature:** 375-400°F for hot-applied materials
- **Routing:** Clean and widen cracks 0.25"-0.5" for better adhesion
- **Coverage calculation:** Linear feet × average width × depth ÷ 12 = gallons needed
- **Quality standards:** No air bubbles, proper adhesion, slight crown above surface

**Slurry Seal & Microsurfacing**

- **Description:** Thin surface treatment combining asphalt emulsion, aggregate, and additives
- **Applications:** Surface texture, minor crack filling, rejuvenation
- **Aggregate gradation:** Specific ISSA (International Slurry Surfacing Association) mixes
- **Set time:** 1-4 hours depending on weather and traffic
- **Thickness:** 1/8" to 3/8" typically

#### Pavement Markings

**Striping (Traffic Paint)**

- **Paint types:** Water-based, solvent-based, thermoplastic
- **Application rates:**
    - Standard paint: 15-20 wet mils thickness
    - Thermoplastic: 90-125 mils thickness
- **Retroreflectivity:** Glass beads applied at 6-8 lbs per gallon
- **Line widths:** 4" (standard), 6" (emphasis), 12" (stop bars)
- **Durability:** Water-based (6-12 months), Thermoplastic (3-7 years)

**Parking Space Layout**

- **Standard dimensions:** 9'×18' (compact: 8'×16', large: 9'×20')
- **Handicap spaces:** 8' wide + 5' access aisle (van: 11' wide + 5' aisle)
- **Fire lanes:** 20' minimum width, "NO PARKING FIRE LANE" text
- **Arrows and symbols:** Turn arrows, handicap symbols, directional markings

#### Concrete Work

**Sidewalks & Walkways**

- **Standard thickness:** 4" residential, 5-6" commercial
- **Reinforcement:** #3 rebar 18" on center or 6×6 W2.9×W2.9 welded wire mesh
- **Concrete strength:** 3,000-4,000 PSI minimum
- **Joint spacing:** Control joints every 5-6 feet
- **Finishing:** Broom finish for slip resistance

**Curb & Gutter**

- **Types:** Barrier curb, mountable curb, integral curb and gutter
- **Dimensions:** 6" height standard, various profiles available
- **Concrete strength:** 4,000 PSI minimum
- **Reinforcement:** Continuous #4 rebar in barrier curbs

**Dumpster Pads**

- **Thickness:** 6-8" reinforced concrete
- **Size:** Typically 12'×30' or 12'×50'
- **Reinforcement:** #4 rebar 12" on center both ways
- **Surface treatment:** Smooth trowel finish, optional sealer

#### Specialized Categories

**Trucking & Logistics**

- **Truck types:**
    - Tandem axle: 13-15 ton capacity
    - Tri-axle: 18-20 ton capacity
    - End dump: 20-25 ton capacity
    - Transfer truck: Maintains material temperature
- **Cost factors:** Round-trip time, fuel, driver wages, equipment amortization
- **Production impact:** Trucks should not wait; paver should not wait for trucks
- **Scheduling critical:** Stack jobs geographically, plan material delivery

**Base Work**

- **Materials:** Crushed aggregate base (CAB), recycled concrete aggregate (RCA)
- **Lift thickness:** 6-8" maximum per lift for proper compaction
- **Compaction requirements:** 95% Standard Proctor density
- **Grading:** Laser or GPS-guided equipment for precision

**Drainage Work**

- **Catch basins:** Precast concrete or cast-in-place
- **Pipe materials:** HDPE, concrete, PVC (varies by application)
- **Grading requirements:** Minimum 0.5% slope for drainage
- **Integration:** Must coordinate with paving elevations

### Units of Measurement (Detailed)

**Area Measurements**

- **Square Feet (SF):** Primary unit for area-based work
    - Applications: Sealcoating, paving, patching, concrete
    - Conversion: 1 acre = 43,560 SF
    - Typical project ranges: 5,000-100,000 SF
- **Square Yards (SY):** Alternative area measurement
    - Conversion: 1 SY = 9 SF
    - Common in: Asphalt removal, heavy repairs
    - DOT contracts often use SY pricing

**Linear Measurements**

- **Linear Feet (LF):** Length-based work
    - Applications: Crack sealing, curb work, striping lines
    - Measurement considerations: Follow pavement centerline/edge
    - Quality factor: Crack width affects material quantity
- **Linear Square Feet (LSF):** Specialized measurement
    - Applications: Sidewalks with standard width, trench restoration
    - Calculation: Length × standard width
    - Note: Verify standard width assumptions with client

**Volume/Weight Measurements**

- **Tons:** Material quantity measurement
    - Asphalt: 1 ton covers ~80-100 SF at 3" depth
    - Aggregate: 1 ton covers ~100-120 SF at 3" depth
    - Concrete: 1 CY = ~2 tons, covers 81 SF at 4" depth
- **Cubic Yards (CY):** Volume measurement
    - Concrete: Primary unit for concrete work
    - Excavation: Soil removal, base preparation
    - Conversion: 1 CY = 27 cubic feet

**Liquid Measurements**

- **Gallons:** Sealcoat, striping paint, crack sealer
    - Sealcoat coverage: 0.15 gal/SF average (varies by surface)
    - Paint coverage: 150-200 LF per gallon for 4" lines
    - Crack sealer: Varies significantly by crack width/depth

**Count Measurements**

- **Each:** Discrete items
    - Parking spaces: Count includes restriping existing
    - Signs: Installation and materials separate line items
    - Catch basins/manholes: Include adjustment to grade

### Specialized Measurement: Linear Square Feet (LSF)

**Definition:** Used in specialized contexts where both length and a fixed width are relevant, but measurement is
treated as area.

**Applications:**

- **Sidewalks & Walkways:** Standard width (e.g., 4 feet) multiplied by length
- **Trench Backfill & Restoration:** Asphalt/concrete used to restore narrow trenches after utility work
- **Concrete Flatwork Along Curbs:** Curbside aprons or gutters with consistent width
- **Striping Zones:** Wide directional arrows or stop bars with consistent width

**Industry Note:** Linear Square Footage is not a standard industry term but is useful for specific applications with
fixed widths.

### Advanced Material Categories

**Asphalt Mix Types:**

- **Hot Mix Asphalt (HMA):** High-temperature mix, durable, used for roads and commercial lots
- **Warm Mix Asphalt (WMA):** Lower production temperatures, eco-friendly, ideal for urban or night work
- **Cold Mix Asphalt (CMA):** Pre-mixed without heating, used for temporary patches
- **Porous Asphalt:** Allows water drainage, used in green infrastructure and parking lots
- **Stone Matrix Asphalt (SMA):** High stone content, polymer-modified, resists rutting
- **Open-Graded Friction Course (OGFC):** High air voids for skid resistance and drainage
- **Recycled Asphalt Pavement (RAP):** Milled material reused in new mix, cost-effective and sustainable

**Asphalt Additives & Modifiers:**

- **Polymer Modifiers:** Enhance elasticity and durability (e.g., SBS, EVA)
- **Rubberized Asphalt:** Uses recycled tires for flexibility and noise reduction
- **Fibers:** Improve crack resistance and structural integrity (cellulose, synthetic)
- **Anti-Stripping Agents:** Improve binder-aggregate adhesion (lime, liquid additives)
- **Color Additives:** Used for aesthetic or safety purposes (iron oxide pigments)

**Specialty Materials:**

- **Sealcoat Emulsion:** Protects and enhances surface appearance
- **Crack Filler:** Seals cracks to prevent water infiltration
- **Tack Coat:** Adhesive layer between old and new asphalt
- **Prime Coat:** Stabilizes base before paving
- **Fog Seal:** Rejuvenates aged asphalt surfaces
- **Slurry Seal / Micro-Surfacing:** Thin surface treatments for texture and protection
- **LF (Linear Feet):** Length-based work (crack sealing, curb work)
- **Tons:** Asphalt material, aggregate, millings
- **Gallons:** Sealcoat, striping paint
- **Each:** Countable items (parking spaces, signs)
- **CY (Cubic Yards):** Concrete work

### Key Business Terminology (Client-Validated)

**Burden Rate**

- **Definition:** Total employment cost including wages, taxes, benefits, workers compensation, overhead
- **Real Example:** \$25/hour base wage becomes \$65/hour burden rate (2.6x multiplier)
- **Critical Importance:** Essential for accurate labor costing and maintaining profitability
- **Components:** Base wage + payroll taxes + benefits + workers comp + overhead allocation

**Plant (Material Supply Location)**

- **Definition:** Supplier facility where materials are purchased and loaded
- **Impact on Costs:** Transportation costs depend heavily on round-trip time from plant to jobsite
- **Strategic Importance:** Plant selection directly affects material costs and project efficiency
- **Example:** "Asphalt plant 15 miles north" vs "Plant 45 minutes south" - significant cost difference
- **Material Variety:** Each plant can offer multiple material types (base course vs surface course hot mix)
- **Estimation Strategy:** Always choose closest suitable plant to maximize efficiency and minimize trucking costs

**Application Factor/Coverage Ratio**

- **Definition:** Amount of material needed per unit area
- **Variability:** Depends on surface condition, material type, and application method
- **Examples:**
    - Sealcoat: 0.15 gallons per SF (varies by surface porosity and coat count)
    - Paint: 150-200 linear feet per gallon for 4" striping lines
    - Crack sealer: Highly variable based on crack width and depth

**Working Season**

- **Definition:** Time period when asphalt work can be performed effectively
- **Geographic Variation:**
    - Northern climates: April through October
    - Southern climates: Year-round with summer heat restrictions
- **Impact on Business:** Affects project scheduling, pricing, and cash flow planning
- **Weather Considerations:** Temperature, precipitation, and humidity all affect work quality

**Hot Mix vs Cold Mix Asphalt**

- **Hot Mix:** Fresh from plant at 275-325°F, higher quality, requires immediate use
    - Applications: Standard for paving, overlays, permanent repairs
    - Scheduling: Must coordinate delivery timing with paving operations
- **Cold Mix:** Pre-made patching material, lower quality, can be stored
    - Applications: Temporary patches, off-season repairs, emergency work
    - Advantages: Available year-round, no temperature restrictions

**Trucking Economics (Critical Profitability Factor)**

- **Truck Capacity Variations by Region:**
    - Tandem axle trucks: ~13 tons of asphalt capacity
    - End dump trucks: ~22 tons of asphalt capacity
- **Cost Factors:** Round-trip time, fuel costs, driver wages, equipment amortization
- **Production Relationship:** Crew productivity depends entirely on truck availability and timing
- **Industry Rule:** "Never let trucks sit idle without material - get trucks in, get them out"
- **Scheduling Strategy:** Stagger truck arrival times for maximum efficiency

---

## Complete Business Workflow (Client-Validated Process)

### The Project Lifecycle (Comprehensive 15-Stage Process)

1. **Lead In**
    - **Sources:** Website form requests, direct phone calls, email campaigns, tradeshows, referrals, repeat customers,
      word of mouth, landing page requests
    - **Entry Methods:**
        - **Internal Entry**: Manual input via "Add Opportunity" or "Add Bid" by Sales/Estimator
        - **External Entry**: Customer web form submission with auto-population
    - **System Action:** Lead automatically entered into CRM with source tracking and type classification
    - **Timing:** Immediate capture and routing with automatic SpotOnSite project preparation
    - **Data Capture:** Company name & address, property/jobsite details, point of contact information, initial scope
      description

2. **Lead Entry & Set Up**
    - **Web Form Specifications (4-Section Structure):**
        - **Section 1: Contact Information**
            - Full Name (Required)
            - Company Name (Optional)
            - Phone Number (Required)
            - Email Address (Required)
            - Preferred Contact Method (Dropdown: Phone, Email, Text)
        - **Section 2: Project Details**
            - Type of Service Needed (Checkboxes): Asphalt Paving, Sealcoating, Crack Sealing, Striping,
              Repairs/Maintenance, Other
            - Property Type (Dropdown): Commercial, Residential, Industrial, HOA/Community
            - Project Location (Address or Zip Code)
            - Estimated Project Size (Dropdown: sqft, # of lots, etc.)
            - Timeline for Project (Dropdown): ASAP, Within 1 Month, 1-3 Months, Flexible
        - **Section 3: Additional Information**
            - Upload Photos or Site Plans (Optional)
            - Notes or Special Requests (Open Text Field)
        - **Section 4: Call to Action**
            - [Submit Request for Quote] button
            - Confirmation: "Thanks! Our team will reach out within 24 hours."
    - **Manual Entry Requirements:**
        - Company Details: Company Name, Company Address, Business contact information
        - Property/Jobsite Information: Property/Jobsite Name, Property/Jobsite Address, Site-specific details
        - Point of Contact Details: Contact Name, Address, Phone number, Email address
    - **Scope Documentation:** Detailed description of services needed, budget information, service categories
    - **Example Entry:** "Looking to seal and stripe parking lot, budget is \$25,000"

3. **Scope Created/Takeoffs Completed**
    - **Project Type Assessment:** System asks "Is this maintenance or plan work?"
        - **Maintenance Work** → Automatic SpotOnSite project creation
        - **Plan Work** → Takeoff program routing (PlanSwift preferred over BlueBeam)
    - **Mapping Method Determination:** "Mapping Needed? (Yes/No)" + "What kind of mapping?"
        - **Existing Property** → SpotOnSite mapping tool with satellite imagery
        - **New Build/Set of Plans** → Takeoff program for architectural/engineered scaled drawings
    - **SpotOnSite Integration:**
        - **Satellite Imagery Analysis:** High-resolution satellite mapping
        - **Interactive Mapping:** Real-time scoping with visual repair area identification
        - **Category Building:** Top-level categories (e.g., Asphalt) with detailed line items (e.g., Asphalt RR 4")
        - **Visual Documentation:** Photo integration with mapping coordinates
    - **Takeoff Program Features:**
        - **Recommended Tool:** PlanSwift (superior to BlueBeam)
        - **Capability:** Scale different units and measure architectural plans
        - **Integration:** Direct import of measurements into SOS360 line items
    - **Output:** Detailed scope with visual documentation, category summarization, repair type classification, and
      coordinate-based mapping

4. **Estimate Costs**
    - **Methodology:** Cost-based estimation considering multiple critical factors
    - **Estimating Process:** Each bid item estimated individually based on quantities, accessibility, production rates,
      labor requirements, equipment needs
    - **Key Factors:** Site accessibility, material quantities and types, phasing requirements, expected production
      rates, mobilization costs
    - **Tool Integration:** Scope summary automatically feeds into cost estimation engine
    - **Accuracy Target:** ±5% variance from final actual costs

5. **Proposal Generation**
    - **Components:** Cost estimate + attachments (SOS shareable link, PDF documents)
    - **Rich Content Support:** Document attachments, external links, photo integration, maps and diagrams
    - **Interactive Visual Integration:**
        - SpotOnSite assessment links embedded in proposals
        - SOS shareable link populated in proposal preface
        - Each line item carries visual map representation
        - Repair areas visually matched to cost breakdowns
        - PDF format attachments auto-generated from SOS
    - **Visual Line Item Integration:** Each repair item matched to line item in proposal to give customer visual of
      line items and cost associated with each repair area when viewing map
    - **Work Order Integration:** In proposal, work order and scheduling, each line item carries visual of map showing
      repair areas in SOS MAP
    - **Customer Experience:** Visual correlation between pricing and mapped repair areas for complete transparency
    - **Automated Generation:** System creates proposals from estimates with detailed pricing information, work
      descriptions, terms and conditions

6. **Proposal Send**
    - **Delivery Methods:** SOS360 Link System with trackable links, email integration with major providers
    - **Tracking Capabilities:** Proposal open notifications, view time tracking, recipient engagement metrics
    - **Integration:** SpotOnSite maps embedded in proposals for visual impact
    - **Professional Presentation:** Branded proposal delivery with conversation history tracking

7. **Proposal Follow-Up**
    - **Status Management:** Change project status to "Proposal Sent"
    - **Follow-Up Options:**
        - Manual Tasks: User-assigned follow-up activities
        - Automated Follow-Up System: Company-wide automation rules, customizable timing (48 hours, 5 days, 2 weeks, 1
          month)
    - **Communication Methods:** Email, phone calls, text messages in coordinated sequence
    - **Escalation:** SMS sent if emails remain unopened after threshold period
    - **Template System:** Customizable follow-up email templates

8. **Job Awarded**
    - **Award Process:** Update project status to "Awarded", automatic job number assignment
    - **Electronic Signature:** DocuSign-style electronic signing capability through proposal link
    - **Contract Management:** Store signed contracts and change orders
    - **Decision Point Outcomes:**
        - Job Awarded: Customer signs proposal electronically or sends contract to proceed
        - Job Tabled: Customer holding off due to budget constraints or timing
        - Job Not Awarded: Lost due to price, scope, presentation, or competitor selection

9. **Job Set Up & Review**
    - **Information Transfer:** Salesperson shares SOS projects with stakeholders (foremen, superintendents, project
      managers)
    - **Team Access:**
        - Accounting Team: Contract values, bid items, material quantities, cost breakdowns
        - Operations Team: Bid item values, production rates, project notes, scheduling information
    - **Job Number Assignment:** Unique identifier created for costing, scheduling, and tracking
    - **Equipment Planning:** Determine equipment needs and availability
    - **Review Intensity Varies:** Simple vs complex project planning requirements

10. **Job Scheduled & Customer Notification**
    - **Scheduling Features:** Operations team schedules work dates with project scheduling capabilities
    - **Customer Communication:** Automated schedule emails with schedule date auto-population
    - **Attachment Support:** Phasing maps, site plans, and other project documents
    - **Resource Coordination:** Balance crew capacity, equipment availability, and material delivery
    - **Geographic Optimization:** Schedule multiple jobs in same area to minimize mobilization

11. **Job Produced/Performed**
    - **Work Execution:** Crews perform work using sitemap, work order, and phasing plan
    - **Daily Operations Tracking:** Operations team and foreman enter real-time cost and progress data
    - **Cost Entry Categories:** Material usage, labor hours, equipment hours, trucking hours, additional costs
    - **Field Data Collection:** Real-time cost tracking during production
    - **Crew Specialization:** Teams specialized by skill (concrete crews vs asphalt crews)
    - **Multi-Category Tracking:** Comprehensive cost category coverage

12. **Job Costing**
    - **Real-Time Analysis:** Ongoing cost tracking during production with budget monitoring
    - **Cost Categories:** Materials, labor, equipment, transportation, miscellaneous expenses
    - **Financial Controls:** Track against original estimates, cost overrun alerts, profitability analysis
    - **Performance Measurement:** Actual vs estimated cost comparison
    - **Estimator Accuracy:** Track individual estimator performance for improvement

13. **Job Completed**
    - **Completion Process:** Change job status to "Completed" with team notification
    - **Quality Assurance:** Final project review process, completion records and photos
    - **Documentation:** Work verification and completion confirmation
    - **Customer Approval:** Final sign-off process

14. **Job Invoicing/Billing**
    - **Invoice Generation:** Create customer invoices with detailed billing
    - **Status Management:** Update job status to "Billed"
    - **Payment Terms:** Flexible payment arrangements including deposit + completion, full payment upon completion,
      progress invoicing
    - **Progress Invoicing:** Bill for completed work up to specific milestones
    - **Integration:** Connect with accounting systems
    - **Documentation:** Final invoices tied to completion photos and customer signatures

15. **Job Close Out**
    - **Final Stage Process:** Job status updated when paid in full
    - **Project Archive:** Complete project documentation
    - **Performance Analysis:** Final project metrics review
    - **Customer Relationship:** Transition to future opportunities and relationship maintenance

### CRM Pipeline Stages & Actions

```
1. LEAD CAPTURE
   ├── Web form submission (auto-creates Lead)
   ├── Manual entry by sales team
   └── Import from external source

2. LEAD QUALIFICATION
   ├── Initial contact (email/phone)
   ├── Needs assessment
   └── Convert to Opportunity or Archive

3. OPPORTUNITY CREATION
   ├── Link to Property
   ├── Determine if mapping needed
   ├── Create Project in SpotOnSite
   └── Assign to Estimator

4. SCOPE & ESTIMATE
   ├── Use mapping tool for measurements
   ├── Generate line items from map
   ├── Apply costs from database
   └── Calculate total estimate

5. PROPOSAL GENERATION
   ├── Auto-generate from estimate
   ├── Add terms, attachments
   ├── Send via email with tracking
   └── Monitor opens/views

6. FOLLOW-UP
   ├── Automated reminders (configurable)
   ├── SMS if email unopened
   ├── AI call scheduling (optional)
   └── Manual task creation

7. JOB AWARD
   ├── Status change to "Won"
   ├── Generate Job Number
   ├── Share with operations team
   └── Create Work Orders

8. EXECUTION
   ├── Schedule resources
   ├── Track actual costs
   ├── Upload progress photos
   └── Complete job

9. CLOSE-OUT
   ├── Generate invoice
   ├── Track payment
   ├── Calculate profitability
   └── Archive project
```

---

## User Roles & Permissions Matrix

| Role                 | Access Level      | Key Permissions                                                       |
|----------------------|-------------------|-----------------------------------------------------------------------|
| **Super Admin**      | SOS Company Level | View all user data across platform                                    |
| **Executive**        | Full Access       | All CRM data, financial reports, SaaS metrics, company settings       |
| **Manager**          | Department Level  | Manage team, approve estimates, schedule resources, view performance  |
| **Estimator/Sales**  | Project Level     | Create opportunities, use mapping, generate estimates, track pipeline |
| **Foreman**          | Field Level       | View work orders, input costs, upload photos, mark tasks complete     |
| **Basic Field User** | Read Only         | View assigned jobs, submit time entries, view instructions            |

### Module Access Matrix

| Module                  | Executive | Manager | Estimator | Foreman   | Basic     |
|-------------------------|-----------|---------|-----------|-----------|-----------|
| Executive CRM Dashboard | ✅         | ❌       | ❌         | ❌         | ❌         |
| Contractor CRM          | ✅         | ✅       | ✅         | View Only | ❌         |
| Mapping/Scoping         | ✅         | ✅       | ✅         | View Only | View Only |
| Cost Database           | ✅         | ✅       | ✅         | ❌         | ❌         |
| Estimation              | ✅         | ✅       | ✅         | ❌         | ❌         |
| Proposals               | ✅         | ✅       | ✅         | ❌         | ❌         |
| Scheduling              | ✅         | ✅       | View Only | View Only | View Only |
| Work Orders             | ✅         | ✅       | View Only | ✅         | View Only |
| Reporting               | ✅         | Limited | Own Data  | ❌         | ❌         |

---

## Real-World Workflow Scenarios

### Scenario 1: Simple Residential Sealcoating

**Contact:** Jennifer Smith (Homeowner)  
**Property:** 123 Oak Street (2,400 SF driveway)  
**Services:** Sealcoating only  
**Value:** \$750  
**Timeline:** 2 weeks  
**Mapping:** Not required (visual estimate)

**Line Items:**

- Driveway Sealcoating: 2,400 SF @ \$0.31/SF = \$750

**Cost Analysis:**

- Labor: 6 hrs @ \$65/hr = \$390
- Materials: 36 gal @ \$4.50/gal = \$162
- Equipment: 1 day @ \$75/day = \$75
- **Total Cost:** \$627 | **Profit:** \$123 (16.4% margin)

### Scenario 2: Complex Commercial Project

**Contact:** David Rodriguez (Property Manager)  
**Property:** Sunset Shopping Plaza (180,000 SF)  
**Services:** Full renovation (paving, sealcoating, striping)  
**Value:** \$82,500  
**Timeline:** Fall 2024  
**Mapping:** Required (SpotOnSite integration)

**Line Items:**

- Asphalt Removal: 5,000 SF @ \$3.50/SF = \$17,500
- New Paving: 5,000 SF @ \$4.25/SF = \$21,250
- Crack Sealing: 3,200 LF @ \$2.00/LF = \$6,400
- Sealcoating: 135,000 SF @ \$0.22/SF = \$29,700
- Striping: 380 spaces @ \$12/ea + 40 handicap @ \$18/ea = \$5,280
- Fire Lane Striping: 1,800 LF @ \$1.25/LF = \$2,250

**Results:**

- Estimated Cost: \$65,200 | Actual Cost: \$67,100
- **Final Profit:** \$15,400 (18.7% margin)

### Scenario 3: Repeat Customer with Multiple Properties (Client Example)

**Contact:** Maria Gonzalez (Regional Facilities Manager, Premier Property Management)  
**Properties:** 15 locations under management  
**Relationship:** Preferred vendor status (2+ years)  
**Services:** Annual maintenance + new property assessments

**Opportunity #1 - Oakwood Office Complex (Existing Property):**

- **Services:** Annual sealcoating maintenance (routine work)
- **Value:** \$12,500
- **Timeline:** April 2024 (scheduled annual work)
- **Mapping Required:** No (measurements on file from previous work)
- **Pipeline Stage:** Auto-advanced to Opportunity (trusted relationship)

**Line Items:**

- Sealcoating: 55,000 SF
- Crack sealing: 800 LF
- Touch-up striping: 45 spaces

**Opportunity #2 - Gateway Business Park (New Acquisition):**

- **Services:** Assessment + immediate repairs + full renovation planning
- **Value:** \$45,000 (Phase 1), additional phases planned
- **Timeline:** Immediate repairs needed, full renovation summer 2024
- **Mapping Required:** Yes (comprehensive assessment of new property)

**Phase 1 Line Items:**

- Emergency pothole repair: 1,200 SF
- Crack sealing: 4,500 LF
- Temporary striping: 200 spaces
- Sealcoating high-traffic areas: 25,000 SF
- **Actual Value:** \$18,750 (reduced scope for immediate needs)

**Relationship Benefits:**

- **Streamlined Approvals:** Maria has decision-making authority
- **Preferred Pricing:** 5% volume discount across all properties
- **Priority Scheduling:** Jobs prioritized during busy season
- **Reduced Sales Cycle:** Ongoing maintenance contracts accelerate pipeline

### Scenario 4: Lost Municipal Opportunity (Learning Example)

**Contact:** Robert Chen (Public Works Director, City of Riverside)  
**Property:** Municipal Parking Garage Level 2 (85,000 SF)  
**Services:** Deck coating, crack repair, striping  
**Competition:** 6 contractors (public bid process)

**Bid Development Process:**

- SpotOnSite mapping for precise measurements
- Detailed quantity takeoffs for bid compliance
- Prevailing wage rates applied per municipal requirements
- Union labor requirements factored into costs
- Specialized materials specified per government standards
- Multi-phase plan developed for minimal public disruption

**Line Items Breakdown:**

- Surface Preparation: 85,000 SF @ \$0.75/SF = \$63,750
- Crack Repair: 8,500 LF @ \$3.25/LF = \$27,625
- Deck Coating: 85,000 SF @ \$1.85/SF = \$157,250
- Striping: 340 spaces @ \$15/each = \$5,100
- Traffic Control: 30 days @ \$450/day = \$13,500
- **Total Bid:** \$267,225

**Outcome Analysis:**

- **Result:** Lost (4th place out of 7 bidders)
- **Winning Bid:** \$198,500 (25% lower than our bid)
- **Loss Reasons:** Price too high, competitor had municipal experience advantage

**Learning Opportunities:**

- Municipal work requires different cost structure understanding
- Need relationships with union subcontractors for competitive pricing
- Specialized equipment rental costs were underestimated
- Consider partnerships with experienced municipal contractors

**Relationship Maintenance:**

- Thank you email sent requesting feedback
- Contact added to newsletter for future opportunities
- Relationship maintained for next bid cycle
- Opportunity data preserved for competitive intelligence

### Scenario 5: Emergency Repair - Crisis Response (Client Example)

**Contact:** Lisa Thompson (Facilities Director, MegaMart Distribution Center)  
**Property:** MegaMart Loading Dock Area (200,000 SF facility)  
**Issue:** 12' × 8' × 6" deep pothole causing truck damage and \$5,000/hour downtime  
**Timeline:** Same day emergency service

**Fast-Track Process:**

- **Pipeline Acceleration:** Lead → Opportunity (skipped prospect stage)
- **Emergency Assessment:** Site visit within 2 hours
- **Safety Impact:** Trucks blocked from loading dock, operations halted
- **Mobilization:** Crew dispatched within 3 hours

**Emergency Line Items:**

- Emergency Mobilization: \$1,500 (immediate response fee)
- Asphalt Removal: 96 SF @ \$8.50/SF = \$816
- Base Repair: 96 SF @ \$12.00/SF = \$1,152
- Hot Mix Asphalt: 96 SF @ \$18.50/SF = \$1,776
- Compaction & Finishing: 96 SF @ \$6.25/SF = \$600
- Traffic Control: 8 hours @ \$125/hour = \$1,000
- After-hours Premium: 8 hours @ \$45/hour = \$360
- Material Rush Charge: 4 tons @ \$75/ton = \$300
- **Total Value:** \$8,500

**Cost Analysis:**

- **Standard Cost:** \$4,200 (normal conditions)
- **Emergency Premiums:** \$4,300 (justified by urgency)
- **Total Project Cost:** \$8,500 (break-even for relationship building)

**Long-Term Relationship Impact:**

- Proved reliability during crisis situation
- Generated referral to corporate facilities team
- Led to \$35,000 annual maintenance contract
- Emergency contact status across all MegaMart facilities
- Comprehensive facility assessment scheduled
- Preventive maintenance program developed
- Corporate preferred vendor application submitted

---

## System Customization & Features

### Pipeline Customization Requirements

- **Stage Management:** Companies can rename, add, or remove pipeline stages
- **Custom Workflows:** Adapt system to company-specific processes and industry variations
- **Stage Naming:** Flexible naming conventions for different service types
- **Industry Adaptation:** Customize for paving, sealcoating, striping, maintenance companies

### Email Template Management System

- **Template Categories:** Proposal sending, follow-up, scheduling, work completion, custom templates
- **Automation Integration:** Templates work with automated follow-up sequences
- **Personalization:** Company-specific messaging and branding
- **Multi-Purpose:** Support for various communication scenarios

### Branding & Appearance Customization

- **Color Customization:** Each user can customize company colors in portal
- **Logo Integration:** Company branding in customer portals and proposals
- **Professional Presentation:** Maintain brand consistency across customer interactions
- **White-Label Capability:** Customer portals reflect contractor's branding

### Document Management System

- **Contract Documents:** Signed contracts, change orders, legal agreements
- **Financial Documents:** Customer invoices, supplier/vendor invoices, subcontractor invoices
- **Project Documents:** RFP details, site maps, phasing maps, material tickets, trucking tickets, receipts
- **Organization:** Job-specific filing with category classification and search functionality
- **Version Control:** Track document updates and changes

### Customer Portal Features

- **Multi-Level Access:** Portal for customers' customers (e.g., CBRE Property Management)
- **Information Display:** All RFPs sent, awarded jobs, project schedules, site maps, project documentation
- **Contact Management:** Portal linked to specific point of contact emails with multiple contact support
- **Real-Time Updates:** Live project status updates with secure, role-based access
- **Brand Integration:** Portal reflects contractor's branding and colors

## Key System Requirements

### Critical Technical Integration Rules

1. **Pipeline Stage Synchronization:** Pipeline stages must match Opportunity Statuses & Job Statuses in SOS360
2. **Terminology Alignment:** Change "New Lead" to "Add Opportunity" to match SOS360 nomenclature
3. **Auto-Population:** Job numbers created in 360 system must auto-populate in CRM
4. **Navigation Integration:** When user clicks CRM module in 360 → Direct to pipeline Kanban view
5. **Line Item Matching:** Line items must match the items in project summary in SOS
6. **Dual System Access:** Estimator must have one screen with SOS & another with SOS360 for bid building

### Critical Business Rules

1. **Map Persistence:** Map visibility persists through entire workflow - job-level shows all layers, line item view
   filters to specific item
2. **State Preservation:** Back button returns user to exact prior state (including filters and pagination)
3. **Email Tracking:** All emails tracked for open/click rates with engagement metrics
4. **SMS Fallback:** Unopened emails trigger SMS after configurable period
5. **Electronic Signatures:** DocuSign-style capability required for proposal acceptance
6. **Inactivity Monitoring:** Configurable triggers for both SOS360 (user login/activity) and Contractor CRM (deal stage
   movement)
7. **Cost Flexibility:** Costs library preloaded with default materials/equipment data; contractors can estimate with
   placeholders
8. **Role Isolation:** Executive and Contractor CRMs have completely separate dashboards and data
9. **Maximum Customization:** Settings must be highly customizable for different industries
10. **Real-Time Sync:** Live data synchronization across all modules
11. **AI Communication:** AI call preferred for scheduling notifications; fallback is task trigger for manual calls

### Lead Distribution & Management

- **Unassigned Lead Pool:** All leads and prospects populate in central location for general requests not assigned to
  account manager
- **Lead vs Prospect Storage:** Leads and prospects stored differently in separate lead/prospect columns
- **Assignment Workflow:** Lead distribution manager assigns leads to specific team members for estimation
- **Category Filtering:** Top-level categories (e.g., Asphalt) with individual line items (e.g., Asphalt RR 4")
- **Layered Filtering:** Users and customers can filter by category and drill down to specific repair types
- **Cost Reflection:** Filter usage reflects cost of chosen areas and populates accordingly
- **Customer Portal Access:** All data shareable via link for customer filtering and full project bird's eye view

### Advanced Automation Rules

- **Lead Assignment:** Based on territory/type with automatic routing
- **Follow-Up Sequences:** Configurable timing (48 hours, 5 days, 2 weeks, 1 month)
- **Status Change Triggers:** Automatic notifications and task creation
- **Proposal Expiration:** Warnings and automatic follow-up
- **Payment Reminders:** Automated billing and collection sequences
- **Rule-Based Workflows:** Company-wide automation settings
- **Escalation Logic:** Progressive follow-up intensity based on engagement

### Integration Requirements

1. **SpotOnSite Mapping** - Comprehensive satellite measurement tool with:
    - **Bidirectional Data Sync:** Real-time sync between SOS360 and SpotOnSite
    - **Automatic Project Creation:** Maintenance work triggers auto-creation in SpotOnSite
    - **Interactive Visual Mapping:** Category building with top-level and line-item granularity
    - **State Persistence:** Map visibility maintained throughout entire workflow
    - **Dual-Screen Capability:** Simultaneous access to SOS & SOS360 during estimation
    - **Visual Correlation:** Line items matched to specific map areas for customer clarity
2. **Takeoff Program Integration** - PlanSwift (preferred) or BlueBeam for:
    - **Architectural Plan Processing:** Scale different units and measure scaled drawings
    - **Direct Import:** Measurements automatically populate SOS360 line items
    - **Blueprint Integration:** Handle new build and engineered plan workflows
3. **Electronic Signature** - DocuSign-style integration for contract execution
4. **Stripe** - Payment processing & subscriptions with billing management
5. **Email Services** - Major provider compatibility with conversation history
6. **SMS Gateway** - Twilio for text notifications and escalation
7. **Google Maps API** - Distance calculations for trucking and routing
8. **Document Storage** - Cloud storage integration for project files
9. **Calendar Systems** - Scheduling integration (Google Calendar, Outlook)
10. **Web Form Integration** - Lead capture with automatic CRM population and routing
11. **Accounting Software** - Connect with popular accounting platforms

---

## Success Metrics & KPIs

### Platform Performance Targets

- User adoption rate: 80% DAU
- Pipeline velocity improvement (lead to close time)
- Estimation accuracy: ±5% variance
- Customer satisfaction: NPS > 40

### Business Impact Goals

- Revenue per user increase: 25%
- Operational efficiency: 30% time savings
- Profit margin improvement: 3-5% increase
- Customer retention: <10% annual churn

### Technical Performance Requirements

- Multi-tenant architecture
- Page load: <2 seconds
- Real-time data synchronization
- API response: <500ms
- Uptime: 99.9% SLA
- Concurrent users: 10,000 support

### Security Requirements

- SOC 2 compliance
- Role-based access control
- Data encryption at rest/transit
- Audit logging
- GDPR compliance for data handling

---

### Glossary

- ARR - Annual Recurring Revenue
- MRR - Monthly Recurring Revenue
- CAC - Customer Acquisition Cost
- LTV - Lifetime Value
- SF - Square Feet
- SY - Square Yards
- LF - Linear Feet
- Working Category - Type of work (paving, sealing, striping, etc.)
- Burden Rate - Total cost of employee including taxes, benefits
- Plant - Material supply location

---

## Core Reporting Framework

**All reports support daily, weekly, monthly, annual, and custom date ranges**

### Operations Reports

- **Site Reports:** Job-specific progress and completion data
- **Daily Jobs Reports:** By Work Order # or by Job
- **Daily Crew Reports:** Crew productivity and resource utilization
- **Materials Reports:** Usage, waste, and supplier performance

### Sales & Marketing Reports (Client-Specified)

- **Proposals Sent vs Goal:** Track daily, weekly, monthly, annually, custom date ranges
- **Proposal Dollar Amount Sent vs Goals:** Revenue pipeline tracking across all time periods
- **Average Proposal Size vs Goals:** Monitor deal size trends against targets
- **Awarded Jobs vs Goal:** Win rate tracking across all time periods
- **Awarded Dollar Amount vs Goal:** Revenue achievement tracking
- **Closing Percentage vs Goal:** Conversion rate performance monitoring
- **Average Job Size vs Goal:** Project value trend analysis
- **Average Time to Bid:** Measure efficiency from lead entry to proposal sent (in days)
- **Average Time to Win:** Track sales cycle from proposal sent to job award (in days)
- **Lead Source Analysis:** Breakdown by source type
    - Example: "65 leads from repeat customers, 10 from website inquiries, 5 from tradeshows"

### Operations Reports (Client-Specified)

- **Scheduled Work (Backlog):** Revenue pipeline across all time periods
- **Revenue (Produced Work):** Completed work revenue tracking daily through annually
- **Revenue & Gross Profitability per Category:** Detailed breakdown by work type
    - Example: "Concrete: \$500,000 revenue, \$200,000 profit, 40% gross profit margin"
    - Example: "Asphalt Paving: \$1,500,000 revenue, \$600,000 profit, 40% gross profit margin"
- **Labor Hours:** Crew productivity tracking across all time periods
- **Daily Jobs Reports:** Available by Work Order number or by Job number
- **Daily Crew Reports:** Individual crew performance and resource utilization

### Financial Reports (Client-Specified)

- **Job Profitability:** Gross profitability vs estimated profitability during specific periods
- **Category Profitability:** Revenue and profit analysis by working category across all time periods
- **Work in Progress (WIP) Report:** Tracks financial status of ongoing projects
    - Compares actual costs vs budgets
    - Monitors billed amounts vs earned revenue
    - Identifies over/under-billing situations
    - Supports cash flow management decisions
- **Site Reports:** Job-specific progress and completion documentation
- **Materials Reports:** Usage tracking, waste analysis, supplier performance
- **Payroll Reports:** Clocked-in hours daily, weekly, monthly, annually

### Client-Requested Advanced Analytics

**360 Executive Layer Reporting (Beyond Core)**

1. **Predictive Analytics & Forecasting**
    - **Revenue Forecasting:** Based on pipeline velocity, close rates, and seasonal trends
    - **Crew Capacity Forecast:** Predict labor shortages or overages based on upcoming scheduled jobs
    - **Material Demand Forecast:** Auto-calculate future material needs based on scheduled work and vendor lead times

2. **KPI Scorecards by Role**
    - **Sales Leaderboard:** Bids submitted, closed deals, average margin, conversion rates
    - **Foreman Scorecard:** Jobs completed on time, crew productivity, safety incidents
    - **Estimator Accuracy:** Estimated vs actual cost variance, change order frequency

3. **Change Order Intelligence**
    - **Change Order Tracker:** Reason codes, client approval time, impact on profit margin
    - **Change Order Heatmap:** Visualize which clients, crews, or job types trigger the most changes

**Workflow Automation Enhancements**

4. **Auto-Triggered Reports**
    - **Daily Crew Summary:** Automatically emailed to Operations Manager
    - **Weekly Profitability Snapshot:** Sent to CEO every Friday
    - **Bid Win/Loss Analysis:** Pushed to Sales Director monthly

5. **Role-Based Dashboards**
    - **CEO View:** Margin trends, project backlog, pipeline health, top business risks
    - **Operations Manager View:** Crew schedules, equipment usage, job delays, safety metrics
    - **Sales View:** Open bids, follow-ups due, client feedback, pipeline progression

**Field-Driven Intelligence**

6. **Photo-to-Report Integration**
    - **Process:** Foremen upload site photos → auto-tagged to specific job → automatically included in daily reports
    - **AI Enhancement:** System flags safety issues, quality concerns, or progress milestones

7. **Voice-to-Note Logging**
    - **Process:** Foremen dictate job notes → transcribed and automatically added to job survey or crew report
    - **Efficiency:** Reduces administrative time for field personnel

**Strategic Business Intelligence**

8. **Client Health Dashboard**
    - **Metrics:** Customer satisfaction scores, repeat business frequency, payment speed, referral likelihood
    - **Alerts:** Early warning system for at-risk client relationships

9. **Vendor Performance Tracker**
    - **Metrics:** Delivery timeliness, material quality consistency, pricing stability
    - **Impact:** Helps optimize supplier relationships and material costs

10. **Risk Radar**
    - **Flags:** Jobs with low profit margins, high change order probability, scheduling conflicts
    - **Proactive Management:** Early intervention for problematic projects

---

This document provides the complete business context and requirements for the SOS360 platform, serving as the
authoritative reference for understanding the industry, workflows, and system requirements from a business perspective.