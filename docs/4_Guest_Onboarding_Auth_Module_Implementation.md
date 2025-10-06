# 4_Guest_Onboarding_Auth_Module_Implementation

## Overview

This document specifies the implementation of the **Guest Company Onboarding & Authentication Module** for the SOS360 CRM API. This is a foundational MVP module that enables new contractor companies to register on the platform and enables users to authenticate.

**Module Scope:**
- Guest company registration (public endpoint, no authentication required)
- User authentication (login/logout with JWT tokens)
- Atomic creation of Company + Default Division + First Admin User
- Token-based session management (access + refresh tokens)

**Out of Scope (Post-MVP):**
- Email invitation system with token validation
- Email verification workflow
- Password reset via email
- Multi-factor authentication (MFA)
- OAuth/SSO integration
- User invitation system for adding team members

---

## Business Flow: Guest Company Onboarding

### Current Implementation (MVP - Simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│                    GUEST REGISTRATION FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. Guest Access
   │
   ├─ Guest navigates to public registration page
   │  (No invitation link required for MVP)
   │
   └─ Fills out registration form:
      • Company Information (businessName, phone, email)
      • User Information (firstName, lastName, email, password)
      • Agrees to Terms of Service


2. Backend Processing (Single Transaction)
   │
   ├─ Validate input data (Zod schemas)
   ├─ Check for duplicate company email
   ├─ Check for duplicate user email
   │
   └─ Atomic Transaction:
      │
      ├─ Step 1: Create Company
      │  • businessName, email, phone
      │  • subscriptionStatus = TRIAL
      │  • isActive = true
      │
      ├─ Step 2: Create Default Division
      │  • name = "General"
      │  • divisionType = OPERATIONAL
      │  • companyId = [created company ID]
      │  • isDefault = true
      │
      ├─ Step 3: Create First User (Admin)
      │  • firstName, lastName, email
      │  • passwordHash = bcrypt(password)
      │  • companyId = [created company ID]
      │  • divisionId = [created division ID]
      │  • role = EXECUTIVE (first user is always executive)
      │  • isActive = true
      │  • emailVerified = false (for MVP, allow login without verification)
      │
      └─ Step 4: Create Self-Referencing Division Closure Record
         • ancestorId = [division ID]
         • descendantId = [division ID]
         • depth = 0


3. Response to Guest
   │
   ├─ Return success response with:
   │  • Company ID
   │  • User ID
   │  • Message: "Company created successfully. You can now login."
   │
   └─ [Post-MVP: Send welcome email with login link]


4. Guest Becomes Authenticated User
   │
   └─ User proceeds to login with email + password
```

### Post-MVP Enhancement (Invitation-Based)

```
┌─────────────────────────────────────────────────────────────────┐
│              INVITATION-BASED REGISTRATION FLOW                 │
└─────────────────────────────────────────────────────────────────┘

1. SOS360 Sales Team Creates Invitation
   │
   ├─ Admin creates invitation record in database
   │  • invitationToken (UUID, expires in 7 days)
   │  • invitedEmail
   │  • inviterName (sales rep)
   │
   └─ Email sent to prospect with registration link:
      https://app.sos360.com/register?token={invitationToken}


2. Guest Clicks Link → Validates Token
   │
   ├─ Frontend: GET /api/v1/auth/validate-invitation?token={token}
   ├─ Backend checks:
   │  • Token exists and not expired
   │  • Email not already registered
   │
   └─ If valid: Pre-populate email field, allow registration


3. Same transaction flow as MVP, plus:
   │
   └─ Mark invitation as "used" with timestamp
```

---

## Authentication Flow (Login)

### JWT-Based Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                                 │
└─────────────────────────────────────────────────────────────────┘

1. User Submits Credentials
   │
   POST /api/v1/auth/login
   {
     "email": "john@acmepaving.com",
     "password": "SecurePass123!"
   }


2. Backend Validation
   │
   ├─ Find user by email
   ├─ Check isActive = true
   ├─ Verify password with bcrypt.compare()
   ├─ Update lastLogin timestamp
   ├─ Reset failedLoginAttempts to 0
   │
   └─ Generate JWT tokens


3. Token Generation
   │
   ├─ Access Token (short-lived: 15 minutes)
   │  {
   │    "sub": userId,
   │    "email": user.email,
   │    "companyId": user.companyId,
   │    "divisionId": user.divisionId,
   │    "role": user.role,
   │    "type": "access",
   │    "iat": timestamp,
   │    "exp": timestamp + 15min
   │  }
   │
   └─ Refresh Token (long-lived: 7 days)
      {
        "sub": userId,
        "type": "refresh",
        "iat": timestamp,
        "exp": timestamp + 7days
      }


4. Response to User
   │
   └─ 200 OK
      {
        "success": true,
        "message": "Login successful",
        "data": {
          "accessToken": "eyJhbGciOiJIUzI1NiIs...",
          "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
          "expiresIn": 900, // seconds
          "user": {
            "id": "uuid",
            "email": "john@acmepaving.com",
            "firstName": "John",
            "lastName": "Smith",
            "role": "EXECUTIVE",
            "companyId": "uuid",
            "divisionId": "uuid"
          }
        }
      }


5. Subsequent Authenticated Requests
   │
   ├─ Client includes access token in header:
   │  Authorization: Bearer {accessToken}
   │
   ├─ Authentication middleware validates token
   ├─ Extracts user identity
   ├─ Attaches to req.context.user
   │
   └─ Request proceeds to protected routes
```

---

## Module Structure

Following the established module-based architecture pattern (see `src/modules/companies/`):

```
src/modules/auth/
├── auth.types.ts                    # TypeScript interfaces and types
├── auth.schema.ts                   # Zod validation schemas
├── auth.repository.ts               # Data access layer for User + Company + Division
├── auth.service.ts                  # Business logic for registration and authentication
├── auth.controller.ts               # HTTP request/response handling
├── auth.routes.ts                   # Route definitions and DI factory
└── utils/
    ├── jwt.utils.ts                 # JWT token generation and verification
    ├── password.utils.ts            # Password hashing and verification (bcrypt)
    └── validation.utils.ts          # Custom validation helpers
```

**Note:** This module combines User and Auth concerns. In a larger system, you might separate them into `src/modules/users/` and `src/modules/auth/`, but for MVP, combining them reduces complexity.

---

## Data Models (Prisma Schema Review)

### User Model (Existing - No Changes Required)

```prisma
model User {
  id         String @id @default(uuid())
  companyId  String
  divisionId String

  // Personal Information
  firstName String  @db.VarChar(100)
  lastName  String  @db.VarChar(100)
  email     String  @db.VarChar(255)
  phone     String? @db.VarChar(20)

  // Authentication
  passwordHash           String    @db.VarChar(255)
  emailVerified          Boolean   @default(false)
  emailVerifiedAt        DateTime?
  passwordResetToken     String?   @db.VarChar(255)
  passwordResetExpiresAt DateTime?

  // Session Management
  lastLogin           DateTime?
  loginCount          Int       @default(0)
  failedLoginAttempts Int       @default(0)
  lockedUntil         DateTime?

  // Authorization
  role        UserRoleType @default(BASIC_FIELD)
  permissions Json         @default("[]")

  // Status
  isActive       Boolean   @default(true)
  lastActivityAt DateTime?
  deletedAt      DateTime?

  // Audit Trail
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?
  updatedBy String?

  // Relationships
  company  Company  @relation(fields: [companyId], references: [id], onDelete: Restrict)
  division Division @relation(fields: [divisionId], references: [id], onDelete: Restrict)

  @@unique([companyId, email]) // Email unique per company
  @@index([companyId, role])
  @@index([companyId, isActive])
  @@map("users")
}
```

**Key Points:**
- `emailVerified` defaults to `false`, but for MVP we allow login without verification
- `role` defaults to `BASIC_FIELD`, but registration logic must set to `EXECUTIVE` for first user
- `passwordHash` stores bcrypt hash (NOT plain text)
- `failedLoginAttempts` and `lockedUntil` support account lockout (Post-MVP feature)
- Email is unique per company (multi-tenant support)

### Division Model (Existing - Used for Default Division)

```prisma
model Division {
  id        String @id @default(uuid())
  companyId String

  name         String           @db.VarChar(150)
  description  String?
  divisionType DivisionTypeEnum @default(GEOGRAPHIC)

  // ... (other fields)

  @@unique([companyId, name])
  @@map("divisions")
}
```

**Default Division Creation:**
- `name = "General"`
- `divisionType = OPERATIONAL`
- `isDefault = true` (not in schema, but use convention or add field)

### Company Model (Existing - No Changes)

```prisma
model Company {
  id String @id @default(uuid())

  businessName String
  businessType CompanyBusinessType @default(CONTRACTOR)

  phone   String?
  email   String?
  website String?

  subscriptionStatus SubscriptionStatusType @default(ACTIVE)
  subscriptionPlan   SubscriptionPlanType   @default(BASIC)

  isActive  Boolean   @default(true)
  deletedAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relationships
  divisions Division[]
  users     User[]
  // ...
}
```

---

## API Endpoints Specification

### 1. Register Company (Public Endpoint)

**Endpoint:** `POST /api/v1/auth/register`

**Authentication:** None (public endpoint)

**Request Body:**
```typescript
{
  company: {
    businessName: string;      // Required, min 2 chars
    email: string;             // Required, valid email, company contact
    phone?: string;            // Optional, E.164 format
  },
  user: {
    firstName: string;         // Required, min 1 char
    lastName: string;          // Required, min 1 char
    email: string;             // Required, valid email, user login
    password: string;          // Required, min 8 chars, complexity rules
    phone?: string;            // Optional
  },
  agreeToTerms: boolean;       // Required, must be true
}
```

**Validation Rules:**
- `company.businessName`: 2-255 characters
- `company.email`: Valid email format, unique across companies
- `user.email`: Valid email format, unique per company
- `user.password`:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (@$!%*?&#)
- `agreeToTerms`: Must be `true`

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Company registration successful. You can now login.",
  "data": {
    "company": {
      "id": "uuid",
      "businessName": "ACME Paving Solutions",
      "email": "contact@acmepaving.com"
    },
    "user": {
      "id": "uuid",
      "email": "john@acmepaving.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "EXECUTIVE"
    },
    "division": {
      "id": "uuid",
      "name": "General"
    }
  },
  "meta": {
    "timestamp": "2025-10-06T12:00:00Z",
    "path": "/api/v1/auth/register",
    "method": "POST",
    "requestId": "uuid"
  }
}
```

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed. Please check your input.",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Password must be at least 8 characters long",
      "field": "user.password"
    }
  ]
}
```

**409 Conflict - Duplicate Company Email:**
```json
{
  "success": false,
  "message": "A company with this email already exists.",
  "error": {
    "code": "CONFLICT",
    "details": {
      "field": "company.email"
    }
  }
}
```

**409 Conflict - Duplicate User Email:**
```json
{
  "success": false,
  "message": "A user with this email already exists in this company.",
  "error": {
    "code": "CONFLICT",
    "details": {
      "field": "user.email"
    }
  }
}
```

---

### 2. Login (Public Endpoint)

**Endpoint:** `POST /api/v1/auth/login`

**Authentication:** None (public endpoint)

**Request Body:**
```typescript
{
  email: string;        // Required, valid email
  password: string;     // Required
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "john@acmepaving.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "EXECUTIVE",
      "companyId": "uuid",
      "divisionId": "uuid"
    }
  },
  "meta": {
    "timestamp": "2025-10-06T12:05:00Z",
    "path": "/api/v1/auth/login",
    "method": "POST",
    "requestId": "uuid"
  }
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password.",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

**401 Unauthorized - Account Inactive:**
```json
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support.",
  "error": {
    "code": "UNAUTHORIZED",
    "details": {
      "reason": "account_inactive"
    }
  }
}
```

**429 Too Many Requests - Account Locked (Post-MVP):**
```json
{
  "success": false,
  "message": "Account locked due to too many failed login attempts. Try again in 15 minutes.",
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "details": {
      "lockedUntil": "2025-10-06T12:20:00Z"
    }
  }
}
```

---

### 3. Refresh Access Token (Public Endpoint)

**Endpoint:** `POST /api/v1/auth/refresh`

**Authentication:** Requires valid refresh token

**Request Body:**
```typescript
{
  refreshToken: string;  // Required, valid refresh token
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Error Responses:**

**401 Unauthorized - Invalid Refresh Token:**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token.",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

---

### 4. Logout (Protected Endpoint)

**Endpoint:** `POST /api/v1/auth/logout`

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Request Body:**
```typescript
{
  refreshToken: string;  // Optional, for token blacklist (Post-MVP)
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**MVP Implementation:**
- Client-side: Delete tokens from storage
- Server-side: No action required (stateless JWT)
- Post-MVP: Implement token blacklist using Redis

---

### 5. Get Current User Profile (Protected Endpoint)

**Endpoint:** `GET /api/v1/auth/me`

**Authentication:** Required (Bearer token)

**Request Headers:**
```
Authorization: Bearer {accessToken}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid",
    "email": "john@acmepaving.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+12145551234",
    "role": "EXECUTIVE",
    "permissions": [],
    "companyId": "uuid",
    "divisionId": "uuid",
    "isActive": true,
    "emailVerified": false,
    "lastLogin": "2025-10-06T12:05:00Z",
    "createdAt": "2025-10-01T10:00:00Z",
    "company": {
      "id": "uuid",
      "businessName": "ACME Paving Solutions",
      "subscriptionPlan": "BASIC",
      "subscriptionStatus": "TRIAL"
    },
    "division": {
      "id": "uuid",
      "name": "General",
      "divisionType": "OPERATIONAL"
    }
  }
}
```

---

## Implementation Details

### 1. Password Security (password.utils.ts)

**Hashing Algorithm:** bcrypt with salt rounds = 12

```typescript
import bcrypt from 'bcryptjs';

export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  /**
   * Hash a plain-text password using bcrypt.
   */
  static async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
  }

  /**
   * Compare a plain-text password with a hashed password.
   */
  static async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Validate password complexity (MVP rules).
   */
  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[@$!%*?&#]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&#)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

---

### 2. JWT Token Management (jwt.utils.ts)

**Library:** `jose` (recommended by Node.js security best practices)

**Token Specifications:**
- **Algorithm:** HS256 (HMAC with SHA-256)
- **Access Token Expiry:** 15 minutes (900 seconds)
- **Refresh Token Expiry:** 7 days (604800 seconds)

```typescript
import * as jose from 'jose';
import { config } from '@/config/environment';

export interface AccessTokenPayload {
  sub: string;           // User ID
  email: string;
  companyId: string;
  divisionId: string;
  role: string;
  type: 'access';
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;           // User ID
  type: 'refresh';
  iat: number;
  exp: number;
}

export class JwtUtils {
  private static readonly ACCESS_TOKEN_SECRET = new TextEncoder().encode(config.JWT_SECRET);
  private static readonly REFRESH_TOKEN_SECRET = new TextEncoder().encode(config.JWT_REFRESH_SECRET);
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';  // 900 seconds
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';  // 7 days

  /**
   * Generate an access token.
   */
  static async generateAccessToken(payload: Omit<AccessTokenPayload, 'type' | 'iat' | 'exp'>): Promise<string> {
    return new jose.SignJWT({ ...payload, type: 'access' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.ACCESS_TOKEN_EXPIRY)
      .sign(this.ACCESS_TOKEN_SECRET);
  }

  /**
   * Generate a refresh token.
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
   */
  static async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const { payload } = await jose.jwtVerify<AccessTokenPayload>(token, this.ACCESS_TOKEN_SECRET, {
      algorithms: ['HS256'],
    });

    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return payload;
  }

  /**
   * Verify a refresh token.
   */
  static async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    const { payload } = await jose.jwtVerify<RefreshTokenPayload>(token, this.REFRESH_TOKEN_SECRET, {
      algorithms: ['HS256'],
    });

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return payload;
  }
}
```

---

### 3. Authentication Middleware (authentication.ts)

**Responsibilities:**
1. Extract JWT from `Authorization` header
2. Verify token signature and expiration
3. Fetch user from database (security: don't trust token payload alone)
4. Attach user identity to `req.context.user`
5. Pass control to next middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@/api/types';
import { JwtUtils } from '@/modules/auth/utils/jwt.utils';
import databaseService from '@/infrastructure/database/prisma.client';
import { logger } from '@/shared/utils/logger';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token is required');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token signature and expiration
    const payload = await JwtUtils.verifyAccessToken(token);

    // 3. Fetch user from database (critical security step)
    const user = await databaseService.user.findUnique({
      where: { id: payload.sub, isActive: true, deletedAt: null },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
        divisionId: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found or account is inactive');
    }

    // 4. Attach user identity to request context
    req.context.user = {
      id: user.id,
      email: user.email,
      companyId: user.companyId,
      divisionId: user.divisionId,
      role: user.role,
    };

    // 5. Pass control to next middleware
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      logger.warn('JWT verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      next(new UnauthorizedError('Invalid or expired authentication token'));
    }
  }
};
```

---

### 4. Repository Layer (auth.repository.ts)

**Responsibilities:**
- Database queries for User, Company, Division
- Transaction handling for atomic registration
- No business logic (that belongs in service layer)

```typescript
import { Prisma, PrismaClient } from '@prisma/client';
import { ConflictError, NotFoundError } from '@/api/types';

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find user by email (case-insensitive).
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
   * Create company, default division, first user, and division closure record.
   * All operations are performed in a single transaction for atomicity.
   */
  async registerCompanyWithUser(data: {
    company: Prisma.CompanyCreateInput;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      passwordHash: string;
    };
  }) {
    return this.prisma.$transaction(async (tx) => {
      // Step 1: Create Company
      const company = await tx.company.create({
        data: {
          businessName: data.company.businessName,
          email: data.company.email,
          phone: data.company.phone,
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

      // Step 3: Create Division Closure (self-referencing record)
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
          phone: data.user.phone,
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
   * Increment failed login attempts.
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
```

---

### 5. Service Layer (auth.service.ts)

**Responsibilities:**
- Business logic for registration and authentication
- Validation of business rules
- Orchestration of repository calls
- Password hashing and verification
- JWT token generation

```typescript
import { ConflictError, UnauthorizedError, ValidationError } from '@/api/types';
import { AuthRepository } from './auth.repository';
import { PasswordUtils } from './utils/password.utils';
import { JwtUtils } from './utils/jwt.utils';
import { logger } from '@/shared/utils/logger';

export interface RegisterCompanyInput {
  company: {
    businessName: string;
    email: string;
    phone?: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  };
  agreeToTerms: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Register a new company with first admin user.
   */
  async registerCompany(input: RegisterCompanyInput) {
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
        phone: input.company.phone,
      },
      user: {
        firstName: input.user.firstName,
        lastName: input.user.lastName,
        email: input.user.email,
        phone: input.user.phone,
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
        email: result.company.email,
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
   */
  async login(input: LoginInput) {
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
      expiresIn: 900, // 15 minutes in seconds
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
   */
  async refreshAccessToken(refreshToken: string) {
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
        expiresIn: 900,
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Get user profile by user ID.
   */
  async getUserProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
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
```

---

### 6. Controller Layer (auth.controller.ts)

**Responsibilities:**
- Handle HTTP requests and responses
- Validate request schemas with Zod
- Delegate to service layer
- Return standardized API responses

```typescript
import { Request, Response, NextFunction } from 'express';
import { BaseController } from '@/api/controllers/baseController';
import { AuthService } from './auth.service';
import {
  registerCompanySchema,
  loginSchema,
  refreshTokenSchema,
} from './auth.schema';
import { status } from 'http-status';

export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * POST /api/v1/auth/register
   * Register a new company with first admin user.
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      if (!this.validateRequestBody(req, res, registerCompanySchema)) {
        return;
      }

      // Delegate to service layer
      const result = await this.authService.registerCompany(req.body);

      // Send success response
      this.sendSuccessResponse(
        res,
        'Company registration successful. You can now login.',
        result,
        status.CREATED
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/login
   * Authenticate user and return JWT tokens.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      if (!this.validateRequestBody(req, res, loginSchema)) {
        return;
      }

      // Delegate to service layer
      const result = await this.authService.login(req.body);

      // Send success response
      this.sendSuccessResponse(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token.
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      if (!this.validateRequestBody(req, res, refreshTokenSchema)) {
        return;
      }

      // Delegate to service layer
      const result = await this.authService.refreshAccessToken(req.body.refreshToken);

      // Send success response
      this.sendSuccessResponse(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/v1/auth/logout
   * Logout user (client-side token deletion for MVP).
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // MVP: No server-side action (stateless JWT)
      // Post-MVP: Add token to blacklist in Redis

      this.sendSuccessResponse(res, 'Logout successful', null);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/v1/auth/me
   * Get current user profile (protected route).
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User ID is extracted from JWT by authentication middleware
      const userId = req.context.user!.id;

      // Delegate to service layer
      const result = await this.authService.getUserProfile(userId);

      // Send success response
      this.sendSuccessResponse(res, 'User profile retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  };
}
```

---

### 7. Validation Schemas (auth.schema.ts)

```typescript
import { z } from 'zod';

/**
 * Register Company Schema
 */
export const registerCompanySchema = z.object({
  company: z.object({
    businessName: z
      .string()
      .min(2, 'Business name must be at least 2 characters')
      .max(255, 'Business name must not exceed 255 characters'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
      .optional(),
  }),
  user: z.object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(100, 'First name must not exceed 100 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(100, 'Last name must not exceed 100 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[@$!%*?&#]/, 'Password must contain at least one special character'),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format (E.164)')
      .optional(),
  }),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms of service' }),
  }),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Refresh Token Schema
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Export inferred types
export type RegisterCompanyInput = z.infer<typeof registerCompanySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
```

---

### 8. Route Configuration (auth.routes.ts)

```typescript
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { authenticate } from '@/api/middleware/authentication';

export default (prisma: PrismaClient): Router => {
  const router = Router();

  // Dependency Injection
  const authRepository = new AuthRepository(prisma);
  const authService = new AuthService(authRepository);
  const authController = new AuthController(authService);

  // Public Routes (No authentication required)
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  router.post('/refresh', authController.refresh);

  // Protected Routes (Authentication required)
  router.post('/logout', authenticate, authController.logout);
  router.get('/me', authenticate, authController.getProfile);

  return router;
};
```

---

### 9. Mount Routes in RouteConfigurator

**File:** `src/api/routes/RouteConfigurator.ts`

```typescript
// Add to imports
import authRoutes from '@/modules/auth/auth.routes';

// Add to configureRoutes() method
private configureRoutes(): void {
  // Mount module routes with explicit base paths
  this.app.use(`${this.apiPrefix}/auth`, authRoutes(databaseService));
  this.app.use(`${this.apiPrefix}/companies`, companyRoutes(databaseService));
  // ... other routes
}
```

---

### 10. Update Environment Configuration

**File:** `src/config/environment.ts`

Ensure these environment variables are defined:

```typescript
export const config = {
  // ... existing config

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_ACCESS_TOKEN_EXPIRY: '15m',
  JWT_REFRESH_TOKEN_EXPIRY: '7d',

  // Password Security
  BCRYPT_SALT_ROUNDS: 12,
};

// Validation
const envSchema = z.object({
  // ... existing validations

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
});
```

**`.env` file:**
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_REFRESH_SECRET=your-different-refresh-secret-key-min-32-chars-long
```

**Security Note:**
- `JWT_SECRET` and `JWT_REFRESH_SECRET` MUST be different
- Generate secure random strings: `openssl rand -base64 64`

---

## Testing Strategy

### Unit Tests (Service Layer)

```typescript
describe('AuthService', () => {
  describe('registerCompany', () => {
    it('should create company, division, and user in a transaction', async () => {
      // Test implementation
    });

    it('should throw ConflictError if company email already exists', async () => {
      // Test implementation
    });

    it('should throw ValidationError if password is weak', async () => {
      // Test implementation
    });

    it('should set first user role to EXECUTIVE', async () => {
      // Test implementation
    });
  });

  describe('login', () => {
    it('should return tokens and user data on successful login', async () => {
      // Test implementation
    });

    it('should throw UnauthorizedError if credentials are invalid', async () => {
      // Test implementation
    });

    it('should update lastLogin timestamp', async () => {
      // Test implementation
    });

    it('should increment failedLoginAttempts on failed login', async () => {
      // Test implementation
    });
  });
});
```

### Integration Tests (End-to-End)

```typescript
describe('Auth API Integration', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new company and return 201', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          company: {
            businessName: 'Test Paving Co',
            email: 'test@testpaving.com',
          },
          user: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@testpaving.com',
            password: 'SecurePass123!',
          },
          agreeToTerms: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.data.company).toBeDefined();
      expect(response.body.data.user.role).toBe('EXECUTIVE');
      expect(response.body.data.division.name).toBe('General');
    });

    it('should return 409 if company email already exists', async () => {
      // Test implementation
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return tokens on successful login', async () => {
      // Test implementation
    });

    it('should return 401 if credentials are invalid', async () => {
      // Test implementation
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return user profile if authenticated', async () => {
      // Test implementation
    });

    it('should return 401 if token is missing', async () => {
      // Test implementation
    });
  });
});
```

### Manual Testing Checklist

- [ ] Register new company successfully
- [ ] Verify default "General" division is created
- [ ] Verify first user role is EXECUTIVE
- [ ] Verify division closure record is created (depth = 0)
- [ ] Login with registered user credentials
- [ ] Verify access token and refresh token are returned
- [ ] Access protected endpoint `/api/v1/auth/me` with valid token
- [ ] Verify 401 error when accessing protected endpoint without token
- [ ] Verify 401 error when token is expired
- [ ] Refresh access token using refresh token
- [ ] Verify duplicate company email returns 409 error
- [ ] Verify weak password returns 400 validation error
- [ ] Logout and verify token is no longer valid (client-side)

---

## Security Considerations

### 1. Password Security
- ✅ Use bcrypt with salt rounds = 12
- ✅ Never store plain-text passwords
- ✅ Enforce password complexity rules
- ⚠️ Post-MVP: Implement password history (prevent reuse of last 5 passwords)
- ⚠️ Post-MVP: Implement password expiration (e.g., 90 days)

### 2. JWT Token Security
- ✅ Use separate secrets for access and refresh tokens
- ✅ Short expiry for access tokens (15 minutes)
- ✅ Longer expiry for refresh tokens (7 days)
- ✅ Verify token signature on every request
- ✅ Fetch user from database (don't trust token payload alone)
- ⚠️ Post-MVP: Implement token blacklist using Redis
- ⚠️ Post-MVP: Implement token rotation on refresh

### 3. Rate Limiting (Post-MVP)
- ⚠️ Limit login attempts per IP (e.g., 5 attempts per 15 minutes)
- ⚠️ Limit registration attempts per IP (e.g., 3 per day)
- ⚠️ Implement account lockout after 5 failed login attempts

### 4. Input Validation
- ✅ Validate all inputs with Zod schemas
- ✅ Sanitize user inputs to prevent XSS
- ✅ Use parameterized queries (Prisma handles this)

### 5. HTTPS Enforcement
- ✅ Use HTTPS in production (handled by reverse proxy)
- ✅ Set `Secure` flag on cookies (if using cookie-based auth)
- ✅ Set `HttpOnly` flag on refresh token cookies (Post-MVP)

---

## Dependencies (package.json)

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.6",
    "zod": "^3.23.8",
    "http-status": "^1.7.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6"
  }
}
```

---

## Environment Variables

**`.env` (Development):**
```bash
# JWT Configuration
JWT_SECRET=development-secret-key-minimum-32-characters-long
JWT_REFRESH_SECRET=development-refresh-secret-different-from-jwt-secret-32-chars
```

**`.env.production` (Production):**
```bash
# JWT Configuration (MUST be different from development)
JWT_SECRET=production-secret-key-use-openssl-rand-base64-64-to-generate
JWT_REFRESH_SECRET=production-refresh-secret-use-different-value-than-jwt-secret
```

**Generate Secure Secrets:**
```bash
openssl rand -base64 64
```

---

## Post-MVP Enhancements

### Phase 1: Email Integration
- Email verification workflow
- Welcome email after registration
- Password reset via email
- Email templates

### Phase 2: Advanced Security
- Token blacklist (Redis)
- Token rotation on refresh
- Account lockout after failed attempts
- Rate limiting per IP

### Phase 3: Invitation System
- Invitation token generation
- Invitation expiry handling
- Pre-populated registration form

### Phase 4: User Management
- Invite team members
- Role-based permissions matrix
- User activation/deactivation
- Audit log for user actions

---

## Success Criteria

**The Auth Module is complete when:**

✅ Guests can register a company without authentication
✅ Company, Division ("General"), and User (EXECUTIVE) are created atomically
✅ Division closure record is created for the default division
✅ Users can login with email + password
✅ JWT access and refresh tokens are generated and returned
✅ Protected endpoints require valid access token
✅ Authentication middleware validates tokens and attaches user to request context
✅ `/api/v1/auth/me` returns authenticated user profile
✅ Passwords are hashed with bcrypt (salt rounds = 12)
✅ Duplicate company email returns 409 Conflict
✅ Invalid credentials return 401 Unauthorized
✅ Weak passwords return 400 Bad Request with validation errors
✅ All endpoints return standardized API responses
✅ Integration tests pass for registration and authentication flows

---

## Appendix: Request/Response Examples

### Example 1: Successful Registration

**Request:**
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "company": {
    "businessName": "ACME Paving Solutions",
    "email": "contact@acmepaving.com",
    "phone": "+12145551234"
  },
  "user": {
    "firstName": "John",
    "lastName": "Smith",
    "email": "john@acmepaving.com",
    "password": "SecurePass123!",
    "phone": "+12145555678"
  },
  "agreeToTerms": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Company registration successful. You can now login.",
  "data": {
    "company": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "businessName": "ACME Paving Solutions",
      "email": "contact@acmepaving.com"
    },
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "john@acmepaving.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "EXECUTIVE"
    },
    "division": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "General"
    }
  },
  "meta": {
    "timestamp": "2025-10-06T12:00:00.000Z",
    "path": "/api/v1/auth/register",
    "method": "POST",
    "requestId": "req-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

---

### Example 2: Successful Login

**Request:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@acmepaving.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJlbWFpbCI6ImpvaG5AYWNtZXBhdmluZy5jb20iLCJjb21wYW55SWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJkaXZpc2lvbklkIjoiNzcwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAyIiwicm9sZSI6IkVYRUNVVElWRSIsInR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3MjgyMTg0MDAsImV4cCI6MTcyODIxOTMwMH0.signature",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDEiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcyODIxODQwMCwiZXhwIjoxNzI4ODIzMjAwfQ.signature",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "email": "john@acmepaving.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "EXECUTIVE",
      "companyId": "550e8400-e29b-41d4-a716-446655440000",
      "divisionId": "770e8400-e29b-41d4-a716-446655440002"
    }
  },
  "meta": {
    "timestamp": "2025-10-06T12:05:00.000Z",
    "path": "/api/v1/auth/login",
    "method": "POST",
    "requestId": "req-223e4567-e89b-12d3-a456-426614174000"
  }
}
```

---

**End of Guest Onboarding & Auth Module Implementation Document**
