// /**
//  * Authentication Middleware
//  *
//  * This middleware is responsible for validating the user's identity.
//  * It runs BEFORE the tenantIsolation middleware.
//  *
//  * Responsibilities:
//  * 1. Extract the JWT from the 'Authorization' header.
//  * 2. Verify the JWT's signature and claims using the 'jose' library.
//  * 3. Fetch the user from the database to ensure they are still valid and active.
//  * (This prevents users who have been deleted or suspended from accessing the system).
//  * 4. Construct the `UserIdentity` object (the "ID Badge").
//  * 5. Attach the user's identity to `req.context.user`.
//  * 6. If the token is missing, invalid, or the user doesn't exist, it throws an `UnauthorizedError`.
//  */
// import { Request, Response, NextFunction } from 'express';
// import * as jose from 'jose';
// import { UserRoleType } from '@prisma/client';
//
// import { config } from '@/config/environment';
// import { UnauthorizedError } from '@/api/types';
// import { prisma } from '@/infrastructure/database/prisma.client';
// import { logger } from '@/shared/utils/logger';
//
// // We need a type for our JWT payload for type safety.
// interface JwtPayload {
//   id: string;
//   role: UserRoleType;
//   email: string;
//   // Standard JWT claims
//   iat?: number;
//   exp?: number;
//   sub?: string;
// }
//
// // Prepare the secret key for JWT verification once.
// const secretKey = new TextEncoder().encode(config.JWT_SECRET);
//
// export const authenticate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     // 1. Extract the token from the Authorization header.
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       throw new UnauthorizedError('Authentication token is required.');
//     }
//     const token = authHeader.split(' ')[1];
//
//     // 2. Verify the token with 'jose'. This checks signature and expiration.
//     const { payload } = await jose.jwtVerify<JwtPayload>(token as string, secretKey, {
//       algorithms: ['HS256'],
//     });
//
//     // 3. Fetch the user from the database to ensure they are still valid.
//     // This is a critical security step. Never trust the JWT payload alone for user data.
//     const user = await prisma.user.findUnique({
//       where: { id: payload.id, isActive: true },
//     });
//
//     if (!user) {
//       throw new UnauthorizedError('User not found or account is inactive.');
//     }
//
//     // 4. Construct the `UserIdentity` object (our "ID Badge").
//     // This is the source of truth for who the user is for this request.
//     req.context.user = {
//       id: user.id,
//       companyId: user.companyId,
//       role: user.role,
//       email: user.email,
//     };
//
//     // 5. Pass control to the next middleware in the chain (e.g., tenantIsolation).
//     next();
//   } catch (error) {
//     // If the error is already one of our custom errors, pass it along.
//     // Otherwise, wrap it in a generic UnauthorizedError.
//     if (error instanceof UnauthorizedError) {
//       next(error);
//     } else {
//       logger.warn('JWT Verification Failed', {
//         error: error instanceof Error ? error.message : 'Unknown auth error',
//       });
//       next(new UnauthorizedError('Invalid or expired authentication token.'));
//     }
//   }
// };
