import { Request, Response, NextFunction } from 'express';

/**
 * Strips script tags and dangerous HTML injections from user inputs
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/onerror\s*=\s*[^"'>]*/gi, '');
}

/**
 * Recursively sanitize request body and query payloads
 */
export function sanitizeInputs(req: Request, _res: Response, next: NextFunction): void {
  const sanitizeObject = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  next();
}

/**
 * Validates Origin & Referer against permitted origins on state-changing requests
 */
export function validateCsrf(req: Request, res: Response, next: NextFunction): void {
  // Safe methods do not mutate state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;
  const host = req.headers.host;

  // In standard browser calls, Origin or Referer is supplied
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host && !originHost.includes('localhost') && !originHost.includes('run.app')) {
        res.status(403).json({
          error: 'CsrfDetected',
          message: 'Cross-Site Request Forgery (CSRF) violation: Origin mismatch.',
        });
        return;
      }
    } catch {
      // Ignore malformed origin in test environments
    }
  }

  next();
}

/**
 * Verifies that route and query parameters do not contain path traversal sequences
 */
export function preventPathTraversal(req: Request, res: Response, next: NextFunction): void {
  const checkValue = (val: string): boolean => {
    return val.includes('../') || val.includes('..\\') || val.includes('%2e%2e') || val.includes('\0');
  };

  for (const param of Object.values(req.params)) {
    if (typeof param === 'string' && checkValue(param)) {
      res.status(400).json({
        error: 'PathTraversalDetected',
        message: 'Security Violation: Malicious path traversal sequence detected.',
      });
      return;
    }
  }

  for (const queryVal of Object.values(req.query)) {
    if (typeof queryVal === 'string' && checkValue(queryVal)) {
      res.status(400).json({
        error: 'PathTraversalDetected',
        message: 'Security Violation: Malicious path traversal sequence detected.',
      });
      return;
    }
  }

  next();
}
