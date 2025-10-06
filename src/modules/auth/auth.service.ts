/**
 * Auth Service
 *
 * Business logic layer for authentication and user registration.
 * Orchestrates repository calls, password hashing, token generation, and validation.
 */

import { ConflictError, UnauthorizedError, ValidationError } from '@/api/types';
import { AuthRepository } from './auth.repository';
import { PasswordUtils } from './utils/password.utils';
import { JwtUtils } from './utils/jwt.utils';
import { logger } from '@/shared/utils/logger';
import {
  RegisterCompanyInput,
  RegisterCompanyResponse,
  LoginInput,
  LoginResponse,
  RefreshTokenResponse,
  UserProfileResponse,
} from './auth.types';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Register a new company with first admin user.
   *
   * Business Logic:
   * 1. Validate terms agreement
   * 2. Validate password complexity
   * 3. Check for duplicate company email
   * 4. Hash password
   * 5. Create company, division, and user atomically
   *
   * @param input - Registration data
   * @returns Sanitized company, division, and user data
   */
  async registerCompany(input: RegisterCompanyInput): Promise<RegisterCompanyResponse> {
    // 1. Validate terms agreement
    if (!input.agreeToTerms) {
      throw new ValidationError('You must agree to the terms of service', 'agreeToTerms');
    }

    // 2. Validate password complexity
    const passwordValidation = PasswordUtils.validate(input.user.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(passwordValidation.errors.join('; '), 'user.password');
    }

    // 3. Check for duplicate company email
    const companyExists = await this.authRepository.companyEmailExists(input.company.email);
    if (companyExists) {
      throw new ConflictError('A company with this email already exists', {
        field: 'company.email',
      });
    }

    // 4. Hash password
    const passwordHash = await PasswordUtils.hash(input.user.password);

    // 5. Create company, division, and user in a single transaction
    const result = await this.authRepository.registerCompanyWithUser({
      company: {
        businessName: input.company.businessName,
        email: input.company.email,
        ...(input.company.phone && { phone: input.company.phone }),
      },
      user: {
        firstName: input.user.firstName,
        lastName: input.user.lastName,
        email: input.user.email,
        ...(input.user.phone && { phone: input.user.phone }),
        passwordHash,
      },
    });

    logger.info('Company registered successfully', {
      companyId: result.company.id,
      userId: result.user.id,
    });

    // 6. Return sanitized result (no password hash)
    return {
      company: {
        id: result.company.id,
        businessName: result.company.businessName,
        email: result.company.email ?? '',
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
      },
      division: {
        id: result.division.id,
        name: result.division.name,
      },
    };
  }

  /**
   * Authenticate user and generate JWT tokens.
   *
   * Business Logic:
   * 1. Find user by email
   * 2. Verify password
   * 3. Check if account is active
   * 4. Generate JWT tokens
   * 5. Update last login timestamp
   *
   * @param input - Login credentials
   * @returns JWT tokens and user data
   */
  async login(input: LoginInput): Promise<LoginResponse> {
    // 1. Find user by email
    const user = await this.authRepository.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Verify password
    const passwordValid = await PasswordUtils.compare(input.password, user.passwordHash);
    if (!passwordValid) {
      // Increment failed login attempts
      await this.authRepository.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
    }

    // 4. Generate JWT tokens
    const accessToken = await JwtUtils.generateAccessToken({
      sub: user.id,
      email: user.email,
      companyId: user.companyId,
      divisionId: user.divisionId,
      role: user.role,
    });

    const refreshToken = await JwtUtils.generateRefreshToken(user.id);

    // 5. Update last login timestamp
    await this.authRepository.updateLastLogin(user.id);

    logger.info('User logged in successfully', { userId: user.id });

    // 6. Return tokens and user info
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: JwtUtils.getAccessTokenExpirySeconds(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        divisionId: user.divisionId,
      },
    };
  }

  /**
   * Refresh access token using refresh token.
   *
   * Business Logic:
   * 1. Verify refresh token
   * 2. Fetch user from database
   * 3. Generate new access token
   *
   * @param refreshToken - Valid refresh token
   * @returns New access token
   */
  async refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
    try {
      // 1. Verify refresh token
      const payload = await JwtUtils.verifyRefreshToken(refreshToken);

      // 2. Fetch user from database
      const user = await this.authRepository.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedError('User not found or account is inactive');
      }

      // 3. Generate new access token
      const accessToken = await JwtUtils.generateAccessToken({
        sub: user.id,
        email: user.email,
        companyId: user.companyId,
        divisionId: user.divisionId,
        role: user.role,
      });

      return {
        accessToken,
        expiresIn: JwtUtils.getAccessTokenExpirySeconds(),
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Get user profile by user ID.
   *
   * @param userId - User ID extracted from JWT
   * @returns User profile with company and division data
   */
  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? null,
      role: user.role,
      permissions: user.permissions,
      companyId: user.companyId,
      divisionId: user.divisionId,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      company: {
        id: user.company.id,
        businessName: user.company.businessName,
        subscriptionPlan: user.company.subscriptionPlan,
        subscriptionStatus: user.company.subscriptionStatus,
      },
      division: {
        id: user.division.id,
        name: user.division.name,
        divisionType: user.division.divisionType,
      },
    };
  }
}
