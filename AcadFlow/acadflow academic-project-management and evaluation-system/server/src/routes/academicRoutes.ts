import { Router, Request, Response } from 'express';
import { Role, ReviewStage } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { AcademicLifecycleService } from '../services/academicLifecycleService';

export const academicRouter = Router();

// 1. Student creates team
academicRouter.post('/teams', requireAuth, requireRole(Role.STUDENT), async (req: Request, res: Response) => {
  const { teamName, memberEmails } = req.body;
  if (!teamName || !memberEmails || !Array.isArray(memberEmails)) {
    res.status(400).json({ error: 'ValidationError', message: 'teamName and memberEmails array are required.' });
    return;
  }

  try {
    const result = await AcademicLifecycleService.createTeam(req.session.user!, teamName, memberEmails);
    res.status(201).json({ message: 'Team formed successfully.', team: result });
  } catch (err: any) {
    res.status(400).json({ error: 'TeamCreationError', message: err.message });
  }
});

// 2. Student submits project proposal
academicRouter.post('/teams/:teamId/proposals', requireAuth, requireRole(Role.STUDENT), async (req: Request, res: Response) => {
  const { teamId } = req.params;
  const { title, abstract, objectives, techStack } = req.body;

  if (!title || !abstract || !objectives || !techStack) {
    res.status(400).json({ error: 'ValidationError', message: 'title, abstract, objectives, and techStack are required.' });
    return;
  }

  try {
    const result = await AcademicLifecycleService.submitProposal(req.session.user!, teamId, {
      title,
      abstract,
      objectives,
      techStack,
    });
    res.status(201).json({ message: 'Proposal submitted successfully.', proposal: result });
  } catch (err: any) {
    res.status(400).json({ error: 'ProposalError', message: err.message });
  }
});

// 3. Similarity check utility query
academicRouter.get('/similarity-check', requireAuth, (req: Request, res: Response) => {
  const title = (req.query.title as string) || '';
  const existing = [
    'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
    'Autonomous Mobile Robot Path Planning in Dynamic Environments',
    'Decentralized Academic Credential Verification System',
    'Smart Grid Energy Consumption Forecasting',
  ];
  const result = AcademicLifecycleService.checkProposalSimilarity(title, existing);
  res.status(200).json(result);
});

// 4. HOD allocates faculty mentor
academicRouter.post('/projects/:projectId/allocate-mentor', requireAuth, requireRole(Role.HOD), async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { mentorId } = req.body;

  if (!mentorId) {
    res.status(400).json({ error: 'ValidationError', message: 'mentorId is required.' });
    return;
  }

  try {
    const result = await AcademicLifecycleService.allocateMentor(req.session.user!, projectId, mentorId);
    res.status(200).json({ message: 'Mentor allocated successfully.', result });
  } catch (err: any) {
    res.status(403).json({ error: 'AllocationError', message: err.message });
  }
});

// 5. Schedule review session
academicRouter.post('/projects/:projectId/reviews/schedule', requireAuth, requireRole(Role.HOD, Role.PROJECT_MENTOR), async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { stage, scheduledDate, venue } = req.body;

  if (!stage || !scheduledDate) {
    res.status(400).json({ error: 'ValidationError', message: 'stage and scheduledDate are required.' });
    return;
  }

  try {
    const result = await AcademicLifecycleService.scheduleReview(
      req.session.user!,
      projectId,
      stage as ReviewStage,
      scheduledDate,
      venue || 'Seminar Hall'
    );
    res.status(201).json({ message: 'Review scheduled successfully.', schedule: result });
  } catch (err: any) {
    res.status(403).json({ error: 'ScheduleError', message: err.message });
  }
});

// 6. Mentor submits feedback & required corrections
academicRouter.post('/reviews/:reviewId/feedback', requireAuth, requireRole(Role.PROJECT_MENTOR), async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { comments, requiredCorrections } = req.body;

  if (!comments) {
    res.status(400).json({ error: 'ValidationError', message: 'comments are required.' });
    return;
  }

  try {
    const result = await AcademicLifecycleService.submitReviewFeedback(req.session.user!, reviewId, {
      comments,
      requiredCorrections,
    });
    res.status(201).json({ message: 'Review feedback recorded successfully.', feedback: result });
  } catch (err: any) {
    res.status(403).json({ error: 'FeedbackError', message: err.message });
  }
});

// 7. HOD assigns external evaluator
academicRouter.post('/projects/:projectId/assign-evaluator', requireAuth, requireRole(Role.HOD), async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { evaluatorId } = req.body;

  if (!evaluatorId) {
    res.status(400).json({ error: 'ValidationError', message: 'evaluatorId is required.' });
    return;
  }

  try {
    const result = await AcademicLifecycleService.assignEvaluator(req.session.user!, projectId, evaluatorId);
    res.status(200).json({ message: 'External evaluator assigned successfully.', assignment: result });
  } catch (err: any) {
    res.status(403).json({ error: 'AssignmentError', message: err.message });
  }
});

// 8. Evaluator submits rubric scores
academicRouter.post('/evaluations/:evaluationId/score', requireAuth, requireRole(Role.EXTERNAL_EVALUATOR), async (req: Request, res: Response) => {
  const { evaluationId } = req.params;
  const { scores, outcomeComments } = req.body;

  if (!scores || !Array.isArray(scores)) {
    res.status(400).json({ error: 'ValidationError', message: 'scores array is required.' });
    return;
  }

  try {
    const result = await AcademicLifecycleService.submitEvaluationScores(
      req.session.user!,
      evaluationId,
      scores,
      outcomeComments || 'Standard evaluation recorded.'
    );
    res.status(200).json({ message: 'Evaluation scores submitted successfully.', evaluation: result });
  } catch (err: any) {
    res.status(400).json({ error: 'EvaluationError', message: err.message });
  }
});

// 9. HOD moderates and publishes results
academicRouter.post('/results/:projectId/publish', requireAuth, requireRole(Role.HOD), async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { totalMarks, moderatedMarks, justification } = req.body;

  if (totalMarks === undefined || totalMarks === null) {
    res.status(400).json({ error: 'ValidationError', message: 'totalMarks is required.' });
    return;
  }

  try {
    const result = await AcademicLifecycleService.moderateAndPublishResult(
      req.session.user!,
      projectId,
      totalMarks,
      moderatedMarks,
      justification
    );
    res.status(200).json({ message: 'Academic result moderated and published successfully.', result });
  } catch (err: any) {
    res.status(403).json({ error: 'PublishError', message: err.message });
  }
});
