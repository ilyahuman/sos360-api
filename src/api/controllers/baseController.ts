/**
 * Base Controller
 *
 * Provides reusable methods for all controllers to standardize
 * API responses, validation handling, and error processing.
 * This promotes consistency and reduces boilerplate code in feature controllers.
 */
import { Request, Response } from 'express';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { ApiResponse } from '@/api/types';
import { status } from 'http-status';

export abstract class BaseController {
  /**
   * Sends a standardized success response.
   * @param res The Express response object.
   * @param message A success message.
   * @param data The data payload to send.
   * @param statusCode The HTTP status code (defaults to 200 OK).
   */
  protected sendSuccessResponse<T>(
    res: Response,
    message: string,
    data: T,
    statusCode: number = status.OK
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        path: res.req.originalUrl,
        method: res.req.method,
        requestId: res.req.context.requestId,
      },
    };
    res.status(statusCode).json(response);
  }

  /**
   * A convenience method for sending a 204 No Content response,
   * typically used for successful DELETE operations.
   * @param res The Express response object.
   */
  protected sendNoContentResponse(res: Response): void {
    res.status(status.NO_CONTENT).send();
  }

  /**
   * Validates a Zod schema against the request body and handles errors.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param schema The Zod schema to validate against.
   * @returns True if validation passes, false otherwise (and sends error response).
   */
  protected validateRequestBody(req: Request, res: Response, schema: z.ZodSchema): boolean {
    const validationResult = schema.safeParse(req.body);

    if (!validationResult.success) {
      const validationError = fromZodError(validationResult.error);
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Validation failed. Please check your input.',
        errors: validationError.details.map(d => ({
          code: 'VALIDATION_ERROR',
          message: d.message,
          field: d.path.join('.'),
        })),
        meta: {
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
          method: req.method,
          requestId: req.context.requestId,
        },
      };
      res.status(status.BAD_REQUEST).json(errorResponse);
      return false;
    }
    return true;
  }
}
