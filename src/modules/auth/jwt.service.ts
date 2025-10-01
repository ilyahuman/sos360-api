/**
 * JWT Service using JOSE library
 * Provides secure JWT creation and verification with modern cryptographic standards
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { config } from '@/config/environment';
import { UnauthorizedError } from '@/api/types';
import { logger } from '@/shared/utils/logger';
import { JWTTokenPayload, TokenOptions } from './auth.types';

export class JWTService {
  private static readonly DEFAULT_ISSUER = 'sos360-api';
  private static readonly DEFAULT_AUDIENCE = 'sos360-client';

  private static accessTokenSecret: Uint8Array;
  private static refreshTokenSecret: Uint8Array;

  static {
    // Initialize secrets as Uint8Array for better security
    this.accessTokenSecret = new TextEncoder().encode(config.JWT_SECRET);
    this.refreshTokenSecret = new TextEncoder().encode(config.JWT_REFRESH_SECRET);
  }

  /**
   * Generate an access token
   */
  public static async generateAccessToken(
    payload: Omit<JWTTokenPayload, 'type' | 'iat' | 'exp' | 'iss' | 'aud'>,
    options: TokenOptions = {}
  ): Promise<string> {
    try {
      const jwt = new SignJWT({
        ...payload,
        type: 'access',
      })
        .setProtectedHeader({
          alg: 'HS256',
          typ: 'JWT',
        })
        .setIssuedAt()
        .setIssuer(options.issuer || this.DEFAULT_ISSUER)
        .setAudience(options.audience || this.DEFAULT_AUDIENCE);

      // Set subject if provided
      if (options.subject || payload.userId) {
        jwt.setSubject(options.subject || String(payload.userId));
      }

      // Set expiration
      const expiresIn = options.expiresIn || config.JWT_EXPIRES_IN;
      jwt.setExpirationTime(expiresIn);

      return await jwt.sign(this.accessTokenSecret);
    } catch (error) {
      logger.error('Failed to generate access token', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: payload.userId,
      });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Verify an access token
   */
  public static async verifyAccessToken(token: string): Promise<JWTTokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.accessTokenSecret, {
        issuer: this.DEFAULT_ISSUER,
        audience: this.DEFAULT_AUDIENCE,
      });

      const jwtPayload = payload as JWTTokenPayload;

      // Verify token type
      if (jwtPayload.type !== 'access') {
        throw new UnauthorizedError('Invalid token type. Expected access token.');
      }

      // Validate required fields
      if (!jwtPayload.userId) {
        throw new UnauthorizedError('Invalid token payload. Missing userId.');
      }

      return jwtPayload;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      logger.warn('Access token verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tokenPrefix: token.substring(0, 20) + '...',
      });

      // Map jose errors to our error types
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new UnauthorizedError('Access token has expired');
        }
        if (error.message.includes('signature')) {
          throw new UnauthorizedError('Invalid token signature');
        }
      }

      throw new UnauthorizedError('Invalid access token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  public static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }
    const bearerMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (bearerMatch) {
      return bearerMatch[1] || null;
    }
    if (authHeader.includes('.')) {
      return authHeader;
    }
    return null;
  }
}
