/**
 * Authentication Application Service
 * Handles user authentication and registration using Prisma.
 */

import bcrypt from 'bcryptjs';
import { ValidationError, UnauthorizedError } from '@/api/types';
import { config } from '@/config/environment';
import { logger } from '@/shared/utils/logger';
import { AuthRepository } from './auth.repository';
import { JWTService } from './jwt.service';
import { LoginRequest, RegisterRequest } from '@/api/types/requests.types';
import { LoginResponse, RegisterResponse } from './auth.types';

// --- Service ---

export class AuthService {
  private authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  /**
   * Authenticate user with email and password
   */
  public async login(request: LoginRequest): Promise<LoginResponse> {
    logger.info('Login attempt', { email: request.email });

    const user = await this.authRepository.findUserByEmail(request.email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(request.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate an access token
    const accessToken = await JWTService.generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    logger.info(`User logged in successfully: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
    };
  }

  /**
   * Register a new user and a default company
   */
  public async register(request: RegisterRequest): Promise<RegisterResponse> {
    logger.info('Registration attempt', { email: request.email });

    const emailExists = await this.authRepository.findUserByEmail(request.email);

    if (emailExists) {
      throw new ValidationError('Email address already registered', 'email');
    }

    const passwordHash = await bcrypt.hash(request.password, config.BCRYPT_ROUNDS);

    const newUser = await this.authRepository.createUserAndCompany(
      {
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        companyName: request.companyName,
      },
      passwordHash
    );

    logger.info(`User registered successfully: ${newUser.email}`);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    };
  }
}
