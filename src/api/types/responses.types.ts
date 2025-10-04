/**
 * Response Type Definitions (Final)
 * Defines the standardized structure for all API responses.
 */

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ApiError[];
  meta: {
    timestamp: string;
    path: string;
    method: string;
    requestId: string;
  };
}

// Interface to add optional status code to standard Error object
export interface ErrorWithStatus extends Error {
  statusCode?: number;
}
