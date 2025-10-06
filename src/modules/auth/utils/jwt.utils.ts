/**
 * JWT Utilities
 *
 * Provides JWT token generation and verification using the 'jose' library.
 * Uses HS256 (HMAC with SHA-256) algorithm with separate secrets for access and refresh tokens.
 */

import * as jose from 'jose';
import { config } from '@/config/environment';
import { UserRoleType } from '@prisma/client';

export interface AccessTokenPayload {
  sub: string; // User ID
  email: string;
  companyId: string;
  divisionId: string;
  role: UserRoleType;
  type: 'access';
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  type: 'refresh';
  iat: number;
  exp: number;
}

export class JwtUtils {
  private static readonly ACCESS_TOKEN_SECRET = new TextEncoder().encode(config.JWT_SECRET);
  private static readonly REFRESH_TOKEN_SECRET = new TextEncoder().encode(
    config.JWT_REFRESH_SECRET
  );
  private static readonly ACCESS_TOKEN_EXPIRY = '15m'; // 900 seconds
  private static readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

  /**
   * Generate an access token.
   *
   * Access tokens are short-lived (15 minutes) and contain user identity information.
   * They are used to authenticate API requests.
   */
  static async generateAccessToken(payload: {
    sub: string;
    email: string;
    companyId: string;
    divisionId: string;
    role: UserRoleType;
  }): Promise<string> {
    return new jose.SignJWT({ ...payload, type: 'access' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.ACCESS_TOKEN_EXPIRY)
      .sign(this.ACCESS_TOKEN_SECRET);
  }

  /**
   * Generate a refresh token.
   *
   * Refresh tokens are long-lived (7 days) and contain only the user ID.
   * They are used to obtain new access tokens without re-authenticating.
   */
  static async generateRefreshToken(userId: string): Promise<string> {
    return new jose.SignJWT({ sub: userId, type: 'refresh' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.REFRESH_TOKEN_EXPIRY)
      .sign(this.REFRESH_TOKEN_SECRET);
  }

  /**
   * Verify an access token.
   *
   * @throws {Error} If the token is invalid, expired, or has wrong type
   */
  static async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jose.jwtVerify<AccessTokenPayload>(
      token,
      this.ACCESS_TOKEN_SECRET,
      {
        algorithms: ['HS256'],
      }
    );

    if (payload.type !== 'access') {
      throw new Error('Invalid token type: expected access token');
    }

    return payload;
  }

  /**
   * Verify a refresh token.
   *
   * @throws {Error} If the token is invalid, expired, or has wrong type
   */
  static async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const { payload } = await jose.jwtVerify<RefreshTokenPayload>(
      token,
      this.REFRESH_TOKEN_SECRET,
      {
        algorithms: ['HS256'],
      }
    );

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type: expected refresh token');
    }

    return payload;
  }

  /**
   * Get the expiry time in seconds for access tokens.
   * Useful for client-side token management.
   */
  static getAccessTokenExpirySeconds(): number {
    return 900; // 15 minutes
  }

  /**
   * Get the expiry time in seconds for refresh tokens.
   * Useful for client-side token management.
   */
  static getRefreshTokenExpirySeconds(): number {
    return 604800; // 7 days
  }
}
