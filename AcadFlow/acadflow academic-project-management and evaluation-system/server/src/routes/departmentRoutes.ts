import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole, requireDepartment } from '../middleware/auth';
import { AuthService } from '../services/authService';

export const departmentRouter = Router();

// GET /api/departments/:departmentId/summary
// Requires HOD role & strict department ownership (prevents cross-department access)
departmentRouter.get(
  '/:departmentId/summary',
  requireAuth,
  requireRole(Role.HOD),
  requireDepartment('departmentId'),
  (req: Request, res: Response) => {
    const { departmentId } = req.params;
    res.status(200).json({
      departmentId,
      code: 'CSE',
      name: 'Computer Science and Engineering',
      statistics: {
        activeStudents: 48,
        allocatedMentors: 6,
        activeProjects: 12,
        pendingProposals: 2,
        evaluationsCompleted: 0,
      },
      authorizedHOD: req.session.user!.name,
    });
  }
);

// POST /api/departments/:departmentId/users/:userId/suspend
// Requires HOD role & department isolation
departmentRouter.post(
  '/:departmentId/users/:userId/suspend',
  requireAuth,
  requireRole(Role.HOD),
  requireDepartment('departmentId'),
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      await AuthService.suspendUser(req.session.user!, userId);
      res.status(200).json({
        message: `User ${userId} has been suspended by department HOD.`,
        action: 'USER_SUSPEND',
        audited: true,
      });
    } catch (err: any) {
      const isForbidden = err.message.startsWith('Forbidden') || err.message.startsWith('CrossDepartment');
      res.status(isForbidden ? 403 : 400).json({ error: 'GovernanceError', message: err.message });
    }
  }
);

// POST /api/departments/:departmentId/users/:userId/reactivate
// Requires HOD role & department isolation
departmentRouter.post(
  '/:departmentId/users/:userId/reactivate',
  requireAuth,
  requireRole(Role.HOD),
  requireDepartment('departmentId'),
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
      await AuthService.reactivateUser(req.session.user!, userId);
      res.status(200).json({
        message: `User ${userId} has been reactivated by department HOD.`,
        action: 'USER_REACTIVATE',
        audited: true,
      });
    } catch (err: any) {
      const isForbidden = err.message.startsWith('Forbidden') || err.message.startsWith('CrossDepartment');
      res.status(isForbidden ? 403 : 400).json({ error: 'GovernanceError', message: err.message });
    }
  }
);

// POST /api/departments/:departmentId/invitations
// Requires HOD role & department isolation
departmentRouter.post(
  '/:departmentId/invitations',
  requireAuth,
  requireRole(Role.HOD),
  requireDepartment('departmentId'),
  async (req: Request, res: Response) => {
    const { departmentId } = req.params;
    const { email, role } = req.body;

    if (!email || !role) {
      res.status(400).json({ error: 'ValidationError', message: 'Email and role are required.' });
      return;
    }

    try {
      const token = await AuthService.createInvitation(req.session.user!, email, role, departmentId);
      res.status(201).json({
        message: `Invitation issued for ${email} with role ${role}.`,
        invitationToken: token,
      });
    } catch (err: any) {
      res.status(403).json({ error: 'InvitationError', message: err.message });
    }
  }
);
