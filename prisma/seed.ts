/**
 * Prisma Database Seed File
 * Initializes the database with sample data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  // Clear existing data (development only)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing data...');

    await prisma.lineItemCost.deleteMany();
    await prisma.lineItem.deleteMany();
    await prisma.costCategory.deleteMany();
    await prisma.project.deleteMany();
    await prisma.opportunity.deleteMany();
    await prisma.pipelineStage.deleteMany();
    await prisma.workingCategory.deleteMany();
    await prisma.property.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.user.deleteMany();
    await prisma.company.deleteMany();
  }

  // Create one company
  console.log('🏢 Creating company...');

  const company = await prisma.company.create({
    data: {
      businessName: 'Premier Paving Solutions',
      businessType: 'CONTRACTOR',
      email: 'info@premierpaving.com',
      phone: '5551234567',
      address: {
        street: '123 Industrial Park Drive',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        country: 'US',
      },
      website: 'https://www.premierpaving.com',
      taxId: '12-3456789',
      subscriptionPlan: 'PROFESSIONAL',
      subscriptionStatus: 'ACTIVE',
      billingCycle: 'MONTHLY',
      mrr: 299.00,
      stripeCustomerId: 'cus_example_premier',
      settings: {
        timezone: 'America/Chicago',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        measurementSystem: 'IMPERIAL',
        followUpRules: {
          firstFollowUp: 2,
          secondFollowUp: 5,
          smsThreshold: 72
        },
        emailTemplates: {},
        customFields: {}
      },
      timezone: 'America/Chicago',
      currency: 'USD',
      createdBy: 'system',
      updatedBy: 'system',
    },
  });

  // Create one admin user for the company
  console.log('👥 Creating admin user...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@premierpaving.com',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '5551234567',
      role: 'EXECUTIVE',
      permissions: [],
      isActive: true,
      emailVerified: true,
      companyId: company.id,
      createdBy: 'system',
      updatedBy: 'system',
    },
  });

  // Create 4 contacts
  console.log('📞 Creating 4 contacts...');

  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'Jennifer',
      lastName: 'Chen',
      jobTitle: 'Facilities Manager',
      companyName: 'TechCorp Office Building',
      email: 'jennifer.chen@techcorp.com',
      phone: '5551112222',
      contactType: 'COMMERCIAL',
      leadSource: 'WEBSITE',
      leadStatus: 'QUALIFIED',
      preferredContactMethod: 'EMAIL',
      tags: ['HOT_LEAD', 'COMMERCIAL'],
      notes: 'High-value commercial client',
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      firstName: 'David',
      lastName: 'Martinez',
      jobTitle: 'Property Manager',
      companyName: 'Westfield Properties',
      email: 'dmartinez@westfield.com',
      phone: '5554445555',
      contactType: 'COMMERCIAL',
      leadSource: 'REFERRAL',
      leadStatus: 'CUSTOMER',
      lastContactDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      preferredContactMethod: 'PHONE',
      tags: ['REPEAT_CUSTOMER'],
      notes: 'Long-term client with multiple properties',
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Thompson',
      jobTitle: 'HOA President',
      companyName: 'Oakwood Estates HOA',
      email: 'sarah.t@oakwoodhoa.com',
      phone: '5556667777',
      contactType: 'HOA',
      leadSource: 'REFERRAL',
      leadStatus: 'QUALIFIED',
      preferredContactMethod: 'EMAIL',
      tags: ['HOA', 'RESIDENTIAL'],
      notes: 'HOA with 200+ homes',
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const contact4 = await prisma.contact.create({
    data: {
      firstName: 'Michael',
      lastName: 'Brown',
      jobTitle: 'Maintenance Director',
      companyName: 'City of Dallas',
      email: 'mbrown@dallas.gov',
      phone: '5558889999',
      contactType: 'MUNICIPAL',
      leadSource: 'OTHER',
      leadStatus: 'CUSTOMER',
      preferredContactMethod: 'EMAIL',
      tags: ['MUNICIPAL', 'GOVERNMENT'],
      notes: 'City contract bidding contact',
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  // Create 6 properties
  console.log('🏢 Creating 6 properties...');

  const property1 = await prisma.property.create({
    data: {
      name: 'TechCorp Headquarters Parking Lot',
      propertyType: 'COMMERCIAL',
      address: {
        street: '789 Business Blvd',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        country: 'US',
      },
      totalArea: 45000.00,
      surfaceTypes: ['asphalt'],
      parkingSpacesCount: 125,
      accessRestrictions: 'Business hours only, limited weekend access',
      specialRequirements: 'ADA compliance required',
      notes: 'High-traffic corporate parking facility',
      tags: ['commercial', 'high-traffic'],
      primaryContactId: contact1.id,
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Westfield Shopping Plaza',
      propertyType: 'COMMERCIAL',
      address: {
        street: '5600 Commerce Drive',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        country: 'US',
      },
      totalArea: 180000.00,
      surfaceTypes: ['asphalt'],
      parkingSpacesCount: 380,
      notes: 'Large retail shopping center with high traffic',
      tags: ['retail', 'large-project'],
      primaryContactId: contact2.id,
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      name: 'Westfield Office Complex',
      propertyType: 'COMMERCIAL',
      address: {
        street: '5700 Commerce Drive',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        country: 'US',
      },
      totalArea: 85000.00,
      surfaceTypes: ['asphalt', 'concrete'],
      parkingSpacesCount: 200,
      notes: 'Multi-tenant office building',
      tags: ['commercial', 'office'],
      primaryContactId: contact2.id,
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const property4 = await prisma.property.create({
    data: {
      name: 'Oakwood Estates Community',
      propertyType: 'HOA',
      address: {
        street: '100 Oakwood Lane',
        city: 'Plano',
        state: 'TX',
        zip: '75074',
        country: 'US',
      },
      totalArea: 125000.00,
      surfaceTypes: ['asphalt'],
      parkingSpacesCount: 450,
      specialRequirements: 'Multiple entry points, resident-only hours',
      notes: 'HOA community with 200+ homes',
      tags: ['hoa', 'residential'],
      primaryContactId: contact3.id,
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const property5 = await prisma.property.create({
    data: {
      name: 'City Hall Municipal Parking',
      propertyType: 'MUNICIPAL',
      address: {
        street: '1500 Marilla Street',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        country: 'US',
      },
      totalArea: 95000.00,
      surfaceTypes: ['asphalt'],
      parkingSpacesCount: 250,
      accessRestrictions: 'Public access during business hours',
      specialRequirements: 'Government contract requirements, prevailing wage',
      notes: 'Municipal facility - formal bidding process',
      tags: ['municipal', 'government'],
      primaryContactId: contact4.id,
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  const property6 = await prisma.property.create({
    data: {
      name: 'Dallas Public Library - Branch 3',
      propertyType: 'MUNICIPAL',
      address: {
        street: '7700 Park Lane',
        city: 'Dallas',
        state: 'TX',
        zip: '75231',
        country: 'US',
      },
      totalArea: 32000.00,
      surfaceTypes: ['asphalt'],
      parkingSpacesCount: 85,
      accessRestrictions: 'Library hours only',
      specialRequirements: 'Quiet work hours, minimal disruption',
      notes: 'Public facility - community sensitive',
      tags: ['municipal', 'public-facility'],
      primaryContactId: contact4.id,
      companyId: company.id,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    },
  });

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Company: 1 (Premier Paving Solutions)`);
  console.log(`- Users: 1 (Admin User)`);
  console.log(`- Contacts: 4`);
  console.log(`- Properties: 6`);
  console.log(`\n🔑 Login Credentials:`);
  console.log(`Email: admin@premierpaving.com`);
  console.log(`Password: admin123`);
  console.log(`\n🏢 Company ID: ${company.id}`);
  console.log(`👤 Admin User ID: ${adminUser.id}`);
}

main()
  .catch(e => {
    console.error('❌ Seed failed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
