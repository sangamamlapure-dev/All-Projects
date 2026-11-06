import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import '../types/auth';

/**
 * Ensures user is authenticated via server-side session
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session || !req.session.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Active session not found or expired.',
    });
    return;
  }
  next();
}

/**
 * Enforces Role-Based Access Control for specified permitted roles
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !req.session.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required.',
      });
      return;
    }

    const userRole = req.session.user.role;
    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Insufficient permissions. Role '${userRole}' is not authorized to perform this operation. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

/**
 * Enforces Department-Level Isolation for HOD operations (Prevents cross-department IDOR)
 */
export function requireDepartment(paramKey = 'departmentId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session || !req.session.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
      return;
    }

    const user = req.session.user;
    const requestedDeptId = req.params[paramKey] || req.body[paramKey] || req.query[paramKey];

    // If user is HOD, they can only administer their assigned department
    if (user.role === Role.HOD) {
      if (!user.departmentId || user.departmentId !== requestedDeptId) {
        res.status(403).json({
          error: 'Forbidden',
          message: 'Cross-Department Access Denied: You cannot administer resources belonging to another academic department.',
        });
        return;
      }
    }

    next();
  };
}
