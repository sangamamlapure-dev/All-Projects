import { Router, Request, Response } from 'express';
import { Role, TaskStatus } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { DashboardService } from '../services/dashboardService';

export const dashboardRouter = Router();

// 1. HOD Department Admin Dashboard
dashboardRouter.get('/hod', requireAuth, requireRole(Role.HOD), async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getHodDashboard(req.session.user!);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// 2. Student Portal Dashboard
dashboardRouter.get('/student', requireAuth, requireRole(Role.STUDENT), async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getStudentDashboard(req.session.user!);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// 3. Project Mentor Dashboard
dashboardRouter.get('/mentor', requireAuth, requireRole(Role.PROJECT_MENTOR), async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getMentorDashboard(req.session.user!);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// 4. External Evaluator Dashboard
dashboardRouter.get('/evaluator', requireAuth, requireRole(Role.EXTERNAL_EVALUATOR), async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getEvaluatorDashboard(req.session.user!);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// Action: HOD Proposal Approval / Rejection
dashboardRouter.post('/hod/proposals/:proposalId/decision', requireAuth, requireRole(Role.HOD), async (req: Request, res: Response) => {
  const { proposalId } = req.params;
  const { decision, feedback } = req.body;

  if (!decision || !['APPROVED', 'REJECTED', 'REVISION_REQUESTED'].includes(decision)) {
    res.status(400).json({ error: 'ValidationError', message: 'Valid decision (APPROVED, REJECTED, REVISION_REQUESTED) is required.' });
    return;
  }

  try {
    const result = await DashboardService.handleProposalDecision(req.session.user!, proposalId, decision, feedback);
    res.status(200).json({
      message: `Proposal ${proposalId} has been ${decision}.`,
      result,
    });
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// Action: Student Task Status Update
dashboardRouter.post('/student/tasks/:taskId/status', requireAuth, requireRole(Role.STUDENT), async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { status } = req.body;

  if (!status || !Object.values(TaskStatus).includes(status)) {
    res.status(400).json({ error: 'ValidationError', message: 'Valid status (TODO, IN_PROGRESS, COMPLETED) is required.' });
    return;
  }

  try {
    const result = await DashboardService.updateTaskStatus(req.session.user!, taskId, status);
    res.status(200).json({
      message: `Task ${taskId} updated to ${status}.`,
      result,
    });
  } catch (err: any) {
    res.status(400).json({ error: 'UpdateError', message: err.message });
  }
});
