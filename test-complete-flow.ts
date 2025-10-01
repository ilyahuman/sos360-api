/**
 * Complete Test Flow Script
 * Tests the full workflow: Company → User → Update Company → Contacts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Configuration
const API_BASE = 'http://localhost:3002/api/v1';

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');

  // Delete in reverse dependency order
  await prisma.lineItemCost.deleteMany({});
  await prisma.lineItem.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.pipelineStage.deleteMany({});
  await prisma.costCategory.deleteMany({});
  await prisma.workingCategory.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.webFormSubmission.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.division.deleteMany({});
  await prisma.company.deleteMany({});

  console.log('✅ Database cleaned\n');
}

async function testCompleteFlow() {
  console.log('========================================');
  console.log('🚀 SOS360 Complete Test Flow');
  console.log('========================================\n');

  try {
    // Clean database first
    await cleanDatabase();

    // ============================================
    // Step 1: Create Company
    // ============================================
    console.log('📝 Step 1: Creating Company...');
    console.log('--------------------------------');

    const company = await prisma.company.create({
      data: {
        businessName: 'Premier Paving Solutions Inc.',
        businessType: 'CONTRACTOR',
        taxId: '98-7654321',
        email: 'info@premierpaving.com',
        phone: '+1-469-555-0100',
        website: 'https://www.premierpaving.com',
        address: {
          street: '500 Industrial Way',
          city: 'Irving',
          state: 'TX',
          zip: '75062',
          country: 'US'
        },
        subscriptionPlan: 'ENTERPRISE',
        subscriptionStatus: 'ACTIVE',
        billingCycle: 'ANNUAL',
        mrr: 499.00,
        timezone: 'America/Chicago',
        currency: 'USD',
        settings: {
          branding: {
            primaryColor: '#FF6B35',
            logoUrl: 'https://premierpaving.com/logo.png'
          }
        }
      }
    });

    console.log(`✅ Company created:`);
    console.log(`   Name: ${company.businessName}`);
    console.log(`   ID: ${company.id}`);
    console.log(`   Type: ${company.businessType}`);
    console.log(`   Plan: ${company.subscriptionPlan}\n`);

    // ============================================
    // Step 2: Create Super Admin User
    // ============================================
    console.log('👤 Step 2: Creating Super Admin User...');
    console.log('---------------------------------------');

    // TODO: When User module is implemented, add proper user creation with authentication
    // For now, creating a user directly in the database
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);

    const superAdmin = await prisma.user.create({
      data: {
        companyId: company.id,
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@premierpaving.com',
        phone: '+1-469-555-0101',
        passwordHash: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: 'SUPER_ADMIN',
        permissions: ['ALL'], // TODO: Implement proper permission system
        isActive: true,
        loginCount: 1,
        lastLogin: new Date(),
        lastActivityAt: new Date(),
        // TODO: Add proper authentication tokens when auth module is implemented
      }
    });

    console.log(`✅ Super Admin created:`);
    console.log(`   Name: ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   ⚠️  Note: User authentication module pending implementation\n`);

    // ============================================
    // Step 3: Update Company
    // ============================================
    console.log('🔄 Step 3: Updating Company...');
    console.log('------------------------------');

    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        settings: {
          branding: {
            primaryColor: '#FF6B35',
            logoUrl: 'https://premierpaving.com/logo.png'
          },
          operations: {
            defaultCrewSize: 6,
            workingHours: '6:00 AM - 6:00 PM',
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            holidaySchedule: ['New Year', 'July 4th', 'Thanksgiving', 'Christmas']
          },
          invoicing: {
            paymentTerms: 'Net 30',
            lateFeePercentage: 1.5,
            invoicePrefix: 'PPS',
            nextInvoiceNumber: 1001
          },
          notifications: {
            emailNewLeads: true,
            emailProjectUpdates: true,
            smsUrgentAlerts: true,
            dailyReportTime: '18:00'
          },
          leadManagement: {
            autoAssignLeads: true,
            leadResponseTimeGoal: 24, // hours
            followUpReminderDays: 3
          }
        },
        updatedBy: superAdmin.id,
        updatedAt: new Date()
      }
    });

    console.log(`✅ Company updated with comprehensive settings:`);
    console.log(`   Operations configured`);
    console.log(`   Invoicing rules set`);
    console.log(`   Notifications enabled`);
    console.log(`   Lead management configured\n`);

    // ============================================
    // Step 4: Add Contacts/Leads
    // ============================================
    console.log('📋 Step 4: Adding Contacts/Leads...');
    console.log('------------------------------------');

    const contacts = [];

    // Contact 1: Hot Lead - Commercial
    const contact1 = await prisma.contact.create({
      data: {
        companyId: company.id,
        firstName: 'Robert',
        lastName: 'Anderson',
        email: 'randerson@shoppingcenters.com',
        phone: '+1-214-555-2001',
        jobTitle: 'Director of Operations',
        companyName: 'Premier Shopping Centers',
        contactType: 'COMMERCIAL',
        leadSource: 'WEBSITE',
        leadStatus: 'LEAD',
        leadTypeClassification: 'COMMERCIAL_PROPERTY_OWNER',
        leadColorCode: '#FF0000', // Red - Hot lead
        leadNoteStyle: 'BOLD_HEADER_BULLETS',
        preferredContactMethod: 'EMAIL',
        notes: '🔥 HOT LEAD - Multiple shopping centers, 15+ locations',
        servicePreferences: ['Full Depth Reclamation', 'Overlay', 'Sealcoating', 'Striping'],
        timelinePreference: 'ASAP',
        estimatedProjectSize: '2,000,000+ sq ft',
        propertyTypePreference: 'COMMERCIAL',
        address: {
          street: '1000 Shopping Way',
          city: 'Plano',
          state: 'TX',
          zip: '75024'
        },
        nextFollowUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
        tags: ['high-value', 'urgent', 'multi-location'],
        customFields: {
          numberOfLocations: 15,
          annualBudget: '$2.5M',
          decisionTimeframe: '30 days'
        },
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id
      }
    });
    contacts.push(contact1);
    console.log(`  ✓ ${contact1.firstName} ${contact1.lastName} - ${contact1.leadStatus} (Hot Lead)`);

    // Contact 2: Qualified Municipal Lead
    const contact2 = await prisma.contact.create({
      data: {
        companyId: company.id,
        firstName: 'Jennifer',
        lastName: 'Martinez',
        email: 'jmartinez@cityofrichardson.gov',
        phone: '+1-972-555-3001',
        jobTitle: 'Public Works Manager',
        companyName: 'City of Richardson',
        contactType: 'MUNICIPAL',
        leadSource: 'REFERRAL',
        leadStatus: 'QUALIFIED',
        leadTypeClassification: 'MUNICIPAL_GOVERNMENT_CONTRACTS',
        leadColorCode: '#FFA500', // Orange - Qualified
        leadNoteStyle: 'COMPLIANCE_CHECKLIST',
        qualificationRequired: true,
        preferredContactMethod: 'EMAIL',
        notes: 'City annual paving contract - RFP coming in Q2',
        servicePreferences: ['Street Maintenance', 'Pothole Repair', 'Crack Sealing', 'ADA Compliance'],
        timelinePreference: 'flexible',
        estimatedProjectSize: '5,000,000+ sq ft',
        propertyTypePreference: 'MUNICIPAL',
        address: {
          street: '411 W Arapaho Rd',
          city: 'Richardson',
          state: 'TX',
          zip: '75080'
        },
        relationshipStage: 'Proposal Development',
        tags: ['government', 'rfp-required', 'prevailing-wage'],
        customFields: {
          rfpNumber: 'RFP-2025-PWD-001',
          bondingRequired: true,
          prevailingWage: true,
          mbeRequirement: '25%'
        },
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id
      }
    });
    contacts.push(contact2);
    console.log(`  ✓ ${contact2.firstName} ${contact2.lastName} - ${contact2.leadStatus} (Municipal)`);

    // Contact 3: HOA Prospect
    const contact3 = await prisma.contact.create({
      data: {
        companyId: company.id,
        firstName: 'David',
        lastName: 'Thompson',
        email: 'dthompson@willowcreekhoa.org',
        phone: '+1-469-555-4001',
        jobTitle: 'Board President',
        companyName: 'Willow Creek HOA',
        contactType: 'HOA',
        leadSource: 'PHONE_CALL',
        leadStatus: 'PROSPECT',
        leadTypeClassification: 'HOA_RESIDENTIAL_COMMUNITIES',
        leadColorCode: '#FFFF00', // Yellow - Prospect
        leadNoteStyle: 'SCHEDULING_EMPHASIS',
        preferredContactMethod: 'PHONE',
        notes: '500+ home community, board meeting next month for vendor selection',
        servicePreferences: ['Sealcoating', 'Speed Bump Installation', 'Striping'],
        timelinePreference: '1_3_months',
        estimatedProjectSize: '150,000 - 200,000 sq ft',
        propertyTypePreference: 'RESIDENTIAL',
        address: {
          street: '100 Willow Creek Dr',
          city: 'Allen',
          state: 'TX',
          zip: '75013'
        },
        nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        relationshipStage: 'Initial Contact',
        tags: ['hoa', 'board-approval-needed'],
        customFields: {
          numberOfHomes: 523,
          boardMeetingDate: '2025-02-15',
          currentVendor: 'ABC Paving'
        },
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id
      }
    });
    contacts.push(contact3);
    console.log(`  ✓ ${contact3.firstName} ${contact3.lastName} - ${contact3.leadStatus} (HOA)`);

    // Contact 4: Existing Customer
    const contact4 = await prisma.contact.create({
      data: {
        companyId: company.id,
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'mchen@techcampus.com',
        phone: '+1-214-555-5001',
        jobTitle: 'Facilities Director',
        companyName: 'Tech Campus Dallas',
        contactType: 'COMMERCIAL',
        leadSource: 'REPEAT',
        leadStatus: 'CUSTOMER',
        leadTypeClassification: 'REPEAT_CLIENTS_REFERRALS',
        leadColorCode: '#00FF00', // Green - Customer
        leadNoteStyle: 'QUICK_ID_ICON',
        preferredContactMethod: 'TEXT',
        notes: '⭐ VIP Customer - 3 year contract, quarterly maintenance',
        servicePreferences: ['Preventive Maintenance', 'Sealcoating', 'Emergency Repairs'],
        address: {
          street: '5000 Technology Blvd',
          city: 'Frisco',
          state: 'TX',
          zip: '75034'
        },
        lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        followUpCount: 24,
        relationshipStage: 'Active Contract',
        tags: ['vip', 'contract-customer', 'quarterly-service'],
        customFields: {
          contractNumber: 'PPS-2023-001',
          contractValue: '$450,000',
          contractEndDate: '2026-12-31',
          satisfactionScore: 9.5
        },
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id
      }
    });
    contacts.push(contact4);
    console.log(`  ✓ ${contact4.firstName} ${contact4.lastName} - ${contact4.leadStatus} (VIP Customer)`);

    // Contact 5: General Contractor Partner
    const contact5 = await prisma.contact.create({
      data: {
        companyId: company.id,
        firstName: 'Sarah',
        lastName: 'Williams',
        email: 'swilliams@megabuild.com',
        phone: '+1-817-555-6001',
        jobTitle: 'Project Manager',
        companyName: 'MegaBuild Construction',
        contactType: 'COMMERCIAL',
        leadSource: 'REFERRAL',
        leadStatus: 'QUALIFIED',
        leadTypeClassification: 'GENERAL_CONTRACTORS_BUILDERS',
        leadColorCode: '#800080', // Purple - Partner
        leadNoteStyle: 'ITALICIZED_SOFT',
        preferredContactMethod: 'EMAIL',
        notes: 'Strategic partner - refers 5-10 projects annually',
        servicePreferences: ['New Construction', 'Site Preparation', 'Final Paving'],
        estimatedProjectSize: 'Varies by project',
        address: {
          street: '2000 Builder Ave',
          city: 'Fort Worth',
          state: 'TX',
          zip: '76102'
        },
        relationshipStage: 'Strategic Partner',
        tags: ['partner', 'referral-source', 'preferred-vendor'],
        customFields: {
          partnerSince: '2019',
          projectsCompleted: 18,
          averageProjectSize: '$175,000'
        },
        createdBy: superAdmin.id,
        updatedBy: superAdmin.id
      }
    });
    contacts.push(contact5);
    console.log(`  ✓ ${contact5.firstName} ${contact5.lastName} - ${contact5.leadStatus} (GC Partner)`);

    console.log(`\n✅ Created ${contacts.length} contacts/leads\n`);

    // ============================================
    // Summary
    // ============================================
    console.log('========================================');
    console.log('📊 Test Flow Summary');
    console.log('========================================');
    console.log(`Company: ${company.businessName}`);
    console.log(`  ID: ${company.id}`);
    console.log(`  Plan: ${company.subscriptionPlan}`);
    console.log(`  Status: ${company.subscriptionStatus}`);
    console.log('');
    console.log(`Super Admin: ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`  Email: ${superAdmin.email}`);
    console.log(`  Role: ${superAdmin.role}`);
    console.log('');
    console.log('Contacts Created:');
    console.log(`  - Leads: ${contacts.filter(c => c.leadStatus === 'LEAD').length}`);
    console.log(`  - Prospects: ${contacts.filter(c => c.leadStatus === 'PROSPECT').length}`);
    console.log(`  - Qualified: ${contacts.filter(c => c.leadStatus === 'QUALIFIED').length}`);
    console.log(`  - Customers: ${contacts.filter(c => c.leadStatus === 'CUSTOMER').length}`);
    console.log('');
    console.log('Contact Types:');
    console.log(`  - Commercial: ${contacts.filter(c => c.contactType === 'COMMERCIAL').length}`);
    console.log(`  - Municipal: ${contacts.filter(c => c.contactType === 'MUNICIPAL').length}`);
    console.log(`  - HOA: ${contacts.filter(c => c.contactType === 'HOA').length}`);
    console.log('========================================');
    console.log('');
    console.log('✅ Test flow completed successfully!');
    console.log('');
    console.log('📝 Notes:');
    console.log('  - User authentication module is not yet implemented');
    console.log('  - Using direct database creation for users (placeholder)');
    console.log('  - API endpoints for users will be added when auth module is ready');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Error in test flow:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testCompleteFlow().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});