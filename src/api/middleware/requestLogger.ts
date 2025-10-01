/**
 * Request Logger Middleware
 * Enhanced request logging with performance tracking and security audit
 */

import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, logApiRequest, logSecurityEvent } from '@/shared/utils/logger';
import { ExtendedRequest } from '@/api/types';

/**
 * Request logger middleware that tracks performance and security events
 */
export const requestLogger = (
  req: ExtendedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  // Generate unique request ID
  req.requestId = uuidv4();
  req.startTime = Date.now();

  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.requestId);

  // Log suspicious requests
  logSuspiciousActivity(req);

  // Override res.end to capture response details
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    const duration = Date.now() - (req.startTime || 0);
    
    // Log API request
    logApiRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      duration,
      req.userId,
      req.companyId
    );

    // Log slow requests
    if (duration > 5000) { // 5 seconds
      logger.warn(`Slow request detected: ${req.method} ${req.originalUrl}`, {
        duration,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        userId: req.userId,
        companyId: req.companyId,
      });
    }

    // Log security-relevant responses
    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent('Access Denied', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.userId,
        companyId: req.companyId,
      });
    }

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

/**
 * Log potentially suspicious activity
 */
function logSuspiciousActivity(req: ExtendedRequest): void {
  const suspiciousPatterns = [
    // SQL injection attempts
    /(\b(SELECT|INSERT|UPDATE|DELETE|UNION|DROP|CREATE|ALTER)\b)/i,
    // XSS attempts
    /<script[^>]*>.*?<\/script>/gi,
    // Path traversal attempts
    /\.\.\//g,
    // Command injection attempts
    /[;&|`$]/g,
  ];

  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData) || pattern.test(req.originalUrl)) {
      logSecurityEvent('Suspicious Request Pattern', {
        pattern: pattern.toString(),
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        query: req.query,
        params: req.params,
      });
      break;
    }
  }

  // Log excessive request size
  const contentLength = parseInt(req.get('Content-Length') || '0', 10);
  if (contentLength > 50 * 1024 * 1024) { // 50MB
    logSecurityEvent('Large Request Payload', {
      contentLength,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }

  // Log suspicious user agents
  const userAgent = req.get('User-Agent') || '';
  const suspiciousUserAgents = [
    'sqlmap',
    'nikto',
    'burp',
    'acunetix',
    'netsparker',
    'wget',
    'curl', // Be careful with curl - many legitimate tools use it
  ];

  if (suspiciousUserAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    logSecurityEvent('Suspicious User Agent', {
      userAgent,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  // Log requests without proper headers
  if (!req.get('User-Agent') && req.method !== 'OPTIONS') {
    logSecurityEvent('Missing User Agent', {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      headers: req.headers,
    });
  }
}

/**
 * Enhanced request logger for development debugging
 */
export const debugRequestLogger = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`📥 ${req.method} ${req.originalUrl}`, {
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    const originalSend = res.send;
    res.send = function(data: any): Response {
      logger.debug(`📤 ${req.method} ${req.originalUrl} ${res.statusCode}`, {
        response: typeof data === 'string' ? JSON.parse(data) : data,
        duration: Date.now() - (req.startTime || 0),
      });
      return originalSend.call(this, data);
    };
  }

  next();
};

/**
 * Request context middleware - adds useful context to all requests
 */
export const requestContext = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Add useful request context
  (req as any).context = {
    requestId: req.requestId,
    timestamp: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    origin: req.get('Origin'),
  };

  next();
};

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
): void => {
  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

    // Add performance headers
    res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);

    // Log performance metrics
    if (duration > 1000) { // Log requests taking more than 1 second
      logger.warn(`Performance: Slow request ${req.method} ${req.originalUrl}`, {
        duration: `${duration.toFixed(2)}ms`,
        statusCode: res.statusCode,
        contentLength: res.get('Content-Length'),
        userId: req.userId,
        companyId: req.companyId,
      });
    }

    // Log to performance monitoring service (could be integrated with APM tools)
    logger.debug('Performance metric', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
    });
  });

  next();
};
