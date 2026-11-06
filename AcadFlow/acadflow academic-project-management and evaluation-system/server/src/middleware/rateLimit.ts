import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

interface ClientRecord {
  timestamps: number[];
}

const clientRecords: Map<string, ClientRecord> = new Map();

/**
 * In-memory sliding window rate limiter
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // In test environment or development, extract IP or test header
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const now = Date.now();
    const windowStart = now - windowMs;

    let record = clientRecords.get(clientIp);
    if (!record) {
      record = { timestamps: [] };
      clientRecords.set(clientIp, record);
    }

    // Filter out timestamps outside sliding window
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.timestamps.length).toString());

    if (record.timestamps.length >= maxRequests) {
      const oldestInWindow = record.timestamps[0];
      const retryAfter = Math.ceil((oldestInWindow + windowMs - now) / 1000);

      res.setHeader('Retry-After', retryAfter.toString());
      res.status(429).json({
        error: 'TooManyRequests',
        message: message || 'Too many authentication attempts. Please wait before retrying.',
        retryAfterSeconds: Math.max(1, retryAfter),
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
}

/**
 * Utility to clear rate limits (used during test teardowns)
 */
export function resetRateLimits(): void {
  clientRecords.clear();
}
