import { PrismaClient, User } from '@prisma/client';
import { CreateUserPayload } from './auth.types';

export class AuthRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { 
        email,
        isActive: true,
        deletedAt: null
      },
    });
  }

  public async createUserAndCompany(
    userData: CreateUserPayload,
    passwordHash: string
  ): Promise<User> {
    return this.prisma.$transaction(async tx => {
      const company = await tx.company.create({
        data: {
          businessName: userData.companyName,
          businessType: 'CONTRACTOR',
          email: userData.email,
          subscriptionPlan: 'BASIC',
          subscriptionStatus: 'ACTIVE',
          billingCycle: 'MONTHLY',
          mrr: 99.00,
          settings: {
            followUpRules: {
              firstFollowUp: 2,
              secondFollowUp: 5,
              smsThreshold: 72
            },
            emailTemplates: {},
            customFields: {}
          },
          timezone: 'America/New_York',
          currency: 'USD',
          createdBy: 'system',
          updatedBy: 'system',
        },
      });

      const user = await tx.user.create({
        data: {
          email: userData.email,
          passwordHash,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'EXECUTIVE', // Default role
          permissions: [],
          isActive: true,
          emailVerified: true,
          companyId: company.id,
          createdBy: 'system',
          updatedBy: 'system',
        },
      });

      return user;
    });
  }
}
