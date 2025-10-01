import { JWTPayload } from 'jose';

// --- Service-level Interfaces ---

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  accessToken: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// --- Repository-level Interfaces ---

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
};

// --- JWT-related Interfaces ---

export interface JWTTokenPayload extends JWTPayload {
  userId: string;
  companyId?: string;
  role?: string;
  email?: string;
  type: 'access' | 'refresh';
}

export interface TokenOptions {
  expiresIn?: string;
  issuer?: string;
  audience?: string;
  subject?: string;
}
