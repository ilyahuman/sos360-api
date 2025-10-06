/**
 * Auth Repository
 *
 * Data access layer for authentication and user management.
 * Handles database queries for User, Company, and Division entities.
 */

import { PrismaClient } from '@prisma/client';

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find user by email (case-insensitive).
   * Returns user with related company and division data.
   */
  async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        isActive: true,
        deletedAt: null,
      },
      include: {
        company: true,
        division: true,
      },
    });
  }

  /**
   * Find user by ID.
   * Returns user with related company and division data.
   */
  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId, isActive: true, deletedAt: null },
      include: {
        company: true,
        division: true,
      },
    });
  }

  /**
   * Check if company email already exists.
   * Case-insensitive check to prevent duplicate registrations.
   */
  async companyEmailExists(email: string): Promise<boolean> {
    const count = await this.prisma.company.count({
      where: {
        email: { equals: email, mode: 'insensitive' },
        deletedAt: null,
      },
    });
    return count > 0;
  }

  /**
   * Check if user email exists within a company.
   * Case-insensitive check for multi-tenant email uniqueness.
   */
  async userEmailExistsInCompany(email: string, companyId: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email: { equals: email, mode: 'insensitive' },
        companyId,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  /**
   * Register a new company with default division and first admin user.
   *
   * This operation performs the following steps atomically in a transaction:
   * 1. Create Company
   * 2. Create Default Division ("General")
   * 3. Create Division Closure record (self-referencing, depth = 0)
   * 4. Create First User (with EXECUTIVE role)
   *
   * @param data - Registration data for company and user
   * @returns Created company, division, and user entities
   */
  async registerCompanyWithUser(data: {
    company: {
      businessName: string;
      email: string;
      phone?: string;
    };
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      passwordHash: string;
    };
  }) {
    return this.prisma.$transaction(async tx => {
      // Step 1: Create Company
      const company = await tx.company.create({
        data: {
          businessName: data.company.businessName,
          email: data.company.email,
          phone: data.company.phone ?? null,
          subscriptionStatus: 'TRIAL',
          subscriptionPlan: 'BASIC',
          isActive: true,
        },
      });

      // Step 2: Create Default Division
      const division = await tx.division.create({
        data: {
          companyId: company.id,
          name: 'General',
          description: 'Default division for company-level operations',
          divisionType: 'OPERATIONAL',
          isActive: true,
        },
      });

      // Step 3: Create Division Closure (self-referencing record for tree queries)
      await tx.divisionClosure.create({
        data: {
          ancestorId: division.id,
          descendantId: division.id,
          depth: 0,
        },
      });

      // Step 4: Create First User (Executive)
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          divisionId: division.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
          phone: data.user.phone ?? null,
          passwordHash: data.user.passwordHash,
          role: 'EXECUTIVE', // First user is always executive
          isActive: true,
          emailVerified: false, // MVP: Allow login without verification
        },
      });

      return { company, division, user };
    });
  }

  /**
   * Update user's last login timestamp and increment login count.
   * Also resets failed login attempts counter.
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastLogin: new Date(),
        loginCount: { increment: 1 },
        failedLoginAttempts: 0, // Reset failed attempts on successful login
      },
    });
  }

  /**
   * Increment failed login attempts counter.
   * Post-MVP: Add account lockout logic if attempts exceed threshold.
   */
  async incrementFailedLoginAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: { increment: 1 },
      },
    });
  }
}
