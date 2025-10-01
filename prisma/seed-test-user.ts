/**
 * Script to create a test user for development
 * Run with: npx ts-node prisma/seed-test-user.ts
 */

import { PrismaClient, UserRoleType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser(): Promise<void> {
  try {
    // Check if company exists
    const companyId = '61aebdca-4e43-475e-97f7-38567973efad';

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      console.error('Company not found. Please ensure company exists first.');
      return;
    }

    // Check if test user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        companyId,
        email: 'test@sos360.com'
      }
    });

    if (existingUser) {
      console.log('Test user already exists:', existingUser.id);
      return;
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

    const testUser = await prisma.user.create({
      data: {
        companyId,
        firstName: 'Test',
        lastName: 'User',
        email: 'test@sos360.com',
        passwordHash: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        role: UserRoleType.EXECUTIVE,
        isActive: true,
        permissions: JSON.stringify(['all']),
      }
    });

    console.log('Test user created successfully:', testUser.id);
    console.log('Email:', testUser.email);
    console.log('User ID to use in code:', testUser.id);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();