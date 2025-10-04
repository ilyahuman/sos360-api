/**
 * Security Middleware Collection (Refactored)
 * A focused set of essential, non-redundant security middleware.
 * CTO Note: Removed dangerous inputSanitizer and redundant securityHeaders.
 */

import { Request, Response, NextFunction, Application } from 'express';
import { logSecurityEvent } from '@/shared/utils/logger';
import { config } from '@/config/environment';

/**
 * Validates the Host header against a list of allowed hosts.
 * Essential for preventing host header injection attacks.
 */
export const hostHeaderValidation = (allowedHosts: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const host = req.get('Host');

    if (!host) {
      logSecurityEvent('Missing Host Header', { ip: req.ip, url: req.originalUrl });
      res.status(400).json({
        success: false,
        message: 'Bad Request: Host header is required',
        errors: [{ code: 'MISSING_HOST_HEADER', message: 'Host header is required' }],
      });
      return;
    }

    // In development, allow localhost with any port for convenience.
    if (config.NODE_ENV === 'development' && host.startsWith('localhost:')) {
      next();
      return;
    }

    if (allowedHosts.length > 0 && !allowedHosts.includes(host)) {
      logSecurityEvent('Invalid Host Header', { host, allowedHosts, ip: req.ip });
      res.status(400).json({
        success: false,
        message: 'Bad Request: Invalid host header',
        errors: [{ code: 'INVALID_HOST_HEADER', message: 'Invalid host header' }],
      });
      return;
    }

    next();
  };
};

/**
 * Blocks requests from user agents known to be associated with security scanning tools.
 */
export const userAgentValidation = (req: Request, res: Response, next: NextFunction): void => {
  // Allow OPTIONS requests (CORS preflight) to pass without a User-Agent.
  if (req.method === 'OPTIONS') {
    return next();
  }

  const userAgent = req.get('User-Agent');
  if (!userAgent) {
    logSecurityEvent('Missing User-Agent Header', { ip: req.ip, url: req.originalUrl });
    // Don't block, just log for monitoring purposes.
    return next();
  }

  const maliciousPatterns = [/sqlmap/i, /nikto/i, /acunetix/i, /netsparker/i, /masscan/i, /nmap/i];

  if (maliciousPatterns.some(pattern => pattern.test(userAgent))) {
    logSecurityEvent('Malicious User-Agent Detected', { userAgent, ip: req.ip });
    res.status(403).json({
      success: false,
      message: 'Forbidden',
      errors: [{ code: 'FORBIDDEN_USER_AGENT', message: 'Access denied' }],
    });
    return;
  }

  next();
};

/**
 * Applies the essential security middleware to the application.
 * This should be configured early in the middleware stack.
 */
export const applySecurity = (app: Application): void => {
  app.use(userAgentValidation);
  // Example for production: app.use(hostHeaderValidation(['api.sos360.com']));
};
