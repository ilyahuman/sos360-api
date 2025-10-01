import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId: string;
    role: string;
    email: string;
    isActive: boolean;
  };
  userId?: string;
  companyId?: string;
  userRole?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyName: string; // Added for company creation
}

export interface ExtendedRequest extends Request {
  requestId?: string;
  startTime?: number;
  userId?: string;
  companyId?: string;
}

export interface TenantRequest extends Request {
  userId?: string;
  userRole?: string;
  companyId?: string;
  user?: {
    id: string;
    companyId: string;
    role: string;
    isActive: boolean;
  };
}