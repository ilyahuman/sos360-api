/**
 * Script to check contact ownership
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContact() {
  try {
    const contactId = '174d96b3-8ebe-48cd-93bb-ef158c20cf92';
    const companyId = '61aebdca-4e43-475e-97f7-38567973efad';

    // Check if contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        company: true,
        creator: true,
        updater: true,
      }
    });

    if (!contact) {
      console.log(`Contact ${contactId} not found`);
      return;
    }

    console.log('Contact found:');
    console.log('- Contact ID:', contact.id);
    console.log('- Name:', contact.firstName, contact.lastName);
    console.log('- Company ID:', contact.companyId);
    console.log('- Company Name:', contact.company.businessName);
    console.log('- Created by:', contact.creator?.email || 'Unknown');
    console.log('- Updated by:', contact.updater?.email || 'Unknown');
    console.log('');
    console.log('Expected Company ID:', companyId);
    console.log('Match:', contact.companyId === companyId ? '✅ YES' : '❌ NO');

    if (contact.companyId !== companyId) {
      console.log('\n⚠️  Contact belongs to a different company!');
      console.log('This is why the update is failing with 404.');
    }

  } catch (error) {
    console.error('Error checking contact:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContact();