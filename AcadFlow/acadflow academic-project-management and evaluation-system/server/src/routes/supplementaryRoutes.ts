import { Router, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { SupplementaryService } from '../services/supplementaryService';
import { AuditService } from '../services/auditService';

export const supplementaryRouter = Router();

// ==========================================
// 1. STUDENT PORTFOLIO & RESUME EXPORT
// ==========================================

// Get Portfolio Data
supplementaryRouter.get('/portfolio/:studentId', requireAuth, (req: Request, res: Response) => {
  const { studentId } = req.params;
  const portfolio = SupplementaryService.getStudentPortfolio(studentId);
  res.status(200).json({ portfolio });
});

// Download Resume-Ready Portfolio (PDF)
supplementaryRouter.get('/portfolio/:studentId/pdf', requireAuth, async (req: Request, res: Response) => {
  const { studentId } = req.params;
  try {
    const pdfBuffer = await SupplementaryService.generateStudentPortfolioPdf(studentId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Student_Project_Portfolio_${studentId}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'PortfolioError', message: err.message });
  }
});

// ==========================================
// 2. PRE-FLIGHT SUBMISSION CHECKLIST
// ==========================================

supplementaryRouter.get('/projects/:projectId/checklist', requireAuth, (req: Request, res: Response) => {
  const { projectId } = req.params;
  const checklist = SupplementaryService.getChecklist(projectId);
  res.status(200).json({ checklist });
});

supplementaryRouter.post('/projects/:projectId/checklist/:itemId/toggle', requireAuth, (req: Request, res: Response) => {
  const { projectId, itemId } = req.params;
  try {
    const item = SupplementaryService.toggleChecklistItem(req.session.user!, projectId, itemId);
    res.status(200).json({ message: 'Checklist item updated.', item });
  } catch (err: any) {
    res.status(404).json({ error: 'NotFound', message: err.message });
  }
});

// Team Contributions
supplementaryRouter.get('/projects/:projectId/contributions', requireAuth, (req: Request, res: Response) => {
  const { projectId } = req.params;
  const contributions = SupplementaryService.getTeamContributions(projectId);
  res.status(200).json({ contributions });
});

// ==========================================
// 3. PROJECT DISCUSSIONS & REPLIES
// ==========================================

supplementaryRouter.get('/projects/:projectId/discussions', requireAuth, (req: Request, res: Response) => {
  const { projectId } = req.params;
  const discussions = SupplementaryService.getDiscussions(projectId);
  res.status(200).json({ discussions });
});

supplementaryRouter.post('/projects/:projectId/discussions', requireAuth, (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'ValidationError', message: 'title and content are required.' });
    return;
  }
  const thread = SupplementaryService.createDiscussion(req.session.user!, projectId, title, content);
  res.status(201).json({ message: 'Discussion thread opened.', thread });
});

supplementaryRouter.post('/projects/:projectId/discussions/:threadId/replies', requireAuth, (req: Request, res: Response) => {
  const { projectId, threadId } = req.params;
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: 'ValidationError', message: 'content is required.' });
    return;
  }
  try {
    const reply = SupplementaryService.addDiscussionReply(req.session.user!, projectId, threadId, content);
    res.status(201).json({ message: 'Reply posted.', reply });
  } catch (err: any) {
    res.status(404).json({ error: 'NotFound', message: err.message });
  }
});

// ==========================================
// 4. MEETING NOTES & ACTION ITEMS
// ==========================================

supplementaryRouter.get('/projects/:projectId/meeting-notes', requireAuth, (req: Request, res: Response) => {
  const { projectId } = req.params;
  const notes = SupplementaryService.getMeetingNotes(projectId);
  res.status(200).json({ notes });
});

supplementaryRouter.post('/projects/:projectId/meeting-notes', requireAuth, (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, minutes, actionItems } = req.body;
  if (!title || !minutes) {
    res.status(400).json({ error: 'ValidationError', message: 'title and minutes are required.' });
    return;
  }
  const note = SupplementaryService.createMeetingNote(
    req.session.user!,
    projectId,
    title,
    minutes,
    Array.isArray(actionItems) ? actionItems : []
  );
  res.status(201).json({ message: 'Meeting notes recorded.', note });
});

supplementaryRouter.post('/projects/:projectId/action-items/:actionItemId/toggle', requireAuth, (req: Request, res: Response) => {
  const { projectId, actionItemId } = req.params;
  const isCompleted = SupplementaryService.toggleActionItem(projectId, actionItemId);
  res.status(200).json({ isCompleted });
});

// ==========================================
// 5. SUBMISSION WINDOWS & GOVERNANCE
// ==========================================

supplementaryRouter.get('/submission-window', requireAuth, (_req: Request, res: Response) => {
  const windowStatus = SupplementaryService.getSubmissionWindow();
  res.status(200).json(windowStatus);
});

supplementaryRouter.post('/submission-window/toggle', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  const { isOpen, reason } = req.body;
  try {
    const updated = SupplementaryService.setSubmissionWindow(req.session.user!, !!isOpen, reason);
    AuditService.record(req.session.user!, 'SUBMISSION_WINDOW_TOGGLE', 'SystemSetting', `Window set to ${isOpen ? 'OPEN' : 'CLOSED'}: ${reason || ''}`);
    res.status(200).json({ message: 'Submission window status updated.', status: updated });
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// Bulk CSV Import Preview
supplementaryRouter.post('/bulk-import/preview', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  const { csvContent, targetType } = req.body;
  if (!csvContent) {
    res.status(400).json({ error: 'ValidationError', message: 'csvContent string is required.' });
    return;
  }
  try {
    const preview = SupplementaryService.previewBulkCsv(csvContent, targetType || 'STUDENTS');
    res.status(200).json(preview);
  } catch (err: any) {
    res.status(400).json({ error: 'ParseError', message: err.message });
  }
});

// ==========================================
// 6. EVALUATION INTEGRITY & OUTLIERS
// ==========================================

supplementaryRouter.post('/evaluators/declare-coi', requireAuth, requireRole(Role.EXTERNAL_EVALUATOR), (req: Request, res: Response) => {
  const { hasConflict, notes } = req.body;
  try {
    const result = SupplementaryService.declareCOI(req.session.user!, !!hasConflict, notes);
    AuditService.record(req.session.user!, 'COI_DECLARATION', 'ExternalEvaluatorProfile', `Declared COI: ${hasConflict ? 'CONFLICT' : 'NO_CONFLICT'}`);
    res.status(200).json({ message: 'Conflict of interest declaration recorded.', declaration: result });
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

supplementaryRouter.get('/moderation/discrepancies', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  try {
    const report = SupplementaryService.getScoreDiscrepancies(req.session.user!);
    res.status(200).json(report);
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// Academic Year Rollover
supplementaryRouter.post('/academic/rollover', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  const { targetYear, targetSemester } = req.body;
  try {
    const result = SupplementaryService.performRollover(req.session.user!, targetYear || '2027-2028', targetSemester || 1);
    AuditService.record(req.session.user!, 'ACADEMIC_ROLLOVER', 'AcademicYear', `Rollover to ${result.newYear}`);
    res.status(200).json({ message: 'Academic rollover executed successfully.', result });
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});
