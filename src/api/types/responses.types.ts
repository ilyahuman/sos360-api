// API Response types for standardized HTTP responses
export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  errors?: ApiError[];
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    version?: string;
    statusCode?: number;
    requestId?: string;
    [key: string]: any;
  };
}

export interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  field?: string;
  details?: Record<string, unknown>;
}