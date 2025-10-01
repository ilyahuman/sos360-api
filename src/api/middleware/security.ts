/**
 * Security Middleware Collection
 * Additional security headers and protections beyond Helmet
 */

import { Request, Response, NextFunction } from 'express';
import { logger, logSecurityEvent } from '@/shared/utils/logger';
import { config } from '@/config/environment';
import { ApiResponse, ApiError } from '@/api/types';

/**
 * Additional security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Remove server signature
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // API version header
  res.setHeader('X-API-Version', config.API_VERSION);
  
  // Security policy headers for API
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  
  next();
};

/**
 * Input sanitization middleware
 */
export const inputSanitizer = (req: Request, res: Response, next: NextFunction): void => {
  // Recursively sanitize object properties
  const sanitizeObject = (obj: any): any => {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? sanitizeString(obj) : obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  };
  
  // Sanitize string inputs
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  };
  
  // Apply sanitization to request body and query
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  next();
};

/**
 * Request size limiter middleware
 */
export const requestSizeLimiter = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);
    
    if (contentLength > maxSize) {
      logSecurityEvent('Request Size Limit Exceeded', {
        contentLength,
        maxSize,
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
      });
      
      res.status(413).json({
        success: false,
        message: 'Request entity too large',
        errors: [{
          code: 'REQUEST_TOO_LARGE',
          message: `Request size exceeds maximum allowed size of ${maxSize} bytes`,
        }],
      });
      return;
    }
    
    next();
  };
};

/**
 * Request timeout middleware
 */
export const requestTimeout = (timeout: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Set request timeout
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        logSecurityEvent('Request Timeout', {
          timeout,
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
          userAgent: req.get('User-Agent'),
        });
        
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          errors: [{
            code: 'REQUEST_TIMEOUT',
            message: `Request timed out after ${timeout}ms`,
          }],
        });
      }
    }, timeout);
    
    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timer);
    });
    
    next();
  };
};

/**
 * Host header validation middleware
 */
export const hostHeaderValidation = (allowedHosts: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const host = req.get('Host');
    
    if (!host) {
      logSecurityEvent('Missing Host Header', {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(400).json({
        success: false,
        message: 'Bad Request',
        errors: [{
          code: 'MISSING_HOST_HEADER',
          message: 'Host header is required',
        }],
      });
      return;
    }
    
    // In development, allow localhost with any port
    if (config.NODE_ENV === 'development' && host.startsWith('localhost:')) {
      next();
      return;
    }
    
    // Check against allowed hosts
    if (allowedHosts.length > 0 && !allowedHosts.includes(host)) {
      logSecurityEvent('Invalid Host Header', {
        host,
        allowedHosts,
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
      });
      
      res.status(400).json({
        success: false,
        message: 'Bad Request',
        errors: [{
          code: 'INVALID_HOST_HEADER',
          message: 'Invalid host header',
        }],
      });
      return;
    }
    
    next();
  };
};

/**
 * User-Agent validation middleware
 */
export const userAgentValidation = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.get('User-Agent');
  
  // Allow OPTIONS requests without User-Agent (CORS preflight)
  if (req.method === 'OPTIONS') {
    next();
    return;
  }
  
  if (!userAgent) {
    logSecurityEvent('Missing User-Agent Header', {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
    });
    
    // Don't block, just log for monitoring
    next();
    return;
  }
  
  // Check for known malicious user agents
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /acunetix/i,
    /netsparker/i,
    /masscan/i,
    /zap/i,
  ];
  
  if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent('Malicious User-Agent Detected', {
      userAgent,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    
    res.status(403).json({
      success: false,
      message: 'Forbidden',
      errors: [{
        code: 'FORBIDDEN_USER_AGENT',
        message: 'Access denied',
      }],
    });
    return;
  }
  
  next();
};

/**
 * Method validation middleware
 */
export const methodValidation = (allowedMethods: string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!allowedMethods.includes(req.method)) {
      logSecurityEvent('Invalid HTTP Method', {
        method: req.method,
        allowedMethods,
        ip: req.ip,
        url: req.originalUrl,
      });
      
      res.status(405).json({
        success: false,
        message: 'Method Not Allowed',
        errors: [{
          code: 'METHOD_NOT_ALLOWED',
          message: `HTTP method ${req.method} is not allowed`,
        }],
      });
      return;
    }
    
    next();
  };
};

/**
 * Content-Type validation middleware
 */
export const contentTypeValidation = (req: Request, res: Response, next: NextFunction): void => {
  // Skip validation for GET, DELETE, and OPTIONS requests
  if (['GET', 'DELETE', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }
  
  const contentType = req.get('Content-Type');
  
  if (!contentType) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      errors: [{
        code: 'MISSING_CONTENT_TYPE',
        message: 'Content-Type header is required',
      }],
    });
    return;
  }
  
  // Allow common content types
  const allowedTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ];
  
  const isAllowed = allowedTypes.some(type => contentType.startsWith(type));
  
  if (!isAllowed) {
    logSecurityEvent('Invalid Content-Type', {
      contentType,
      allowedTypes,
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
    });
    
    res.status(415).json({
      success: false,
      message: 'Unsupported Media Type',
      errors: [{
        code: 'UNSUPPORTED_MEDIA_TYPE',
        message: 'Content-Type not supported',
      }],
    });
    return;
  }
  
  next();
};

/**
 * IP whitelist/blacklist middleware
 */
export const ipFiltering = (options: {
  whitelist?: string[];
  blacklist?: string[];
} = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = req.ip || 'unknown';
    
    // Check blacklist first
    if (options.blacklist && options.blacklist.includes(clientIp)) {
      logSecurityEvent('Blacklisted IP Access Attempt', {
        ip: clientIp,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
      });
      
      const response: ApiResponse = {
        success: false,
        message: 'Forbidden',
        errors: [{
          code: 'IP_BLACKLISTED',
          message: 'Access denied from this IP address',
        }],
        meta: {
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method,
        }
      };
      res.status(403).json(response);
      return;
    }
    
    // Check whitelist if configured
    if (options.whitelist && options.whitelist.length > 0 && !options.whitelist.includes(clientIp)) {
      logSecurityEvent('Non-whitelisted IP Access Attempt', {
        ip: clientIp,
        whitelist: options.whitelist,
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent'),
      });
      
      const response: ApiResponse = {
        success: false,
        message: 'Forbidden',
        errors: [{
          code: 'IP_NOT_WHITELISTED',
          message: 'Access denied from this IP address',
        }],
        meta: {
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method,
        }
      };
      res.status(403).json(response);
      return;
    }
    
    next();
  };
};

/**
 * Security middleware collection for easy application
 */
export const applySecurity = (app: any): void => {
  app.use(securityHeaders);
  app.use(inputSanitizer);
  app.use(requestSizeLimiter());
  app.use(requestTimeout());
  app.use(userAgentValidation);
  app.use(methodValidation());
  app.use(contentTypeValidation);
  
  logger.info('Security middleware applied');
};
