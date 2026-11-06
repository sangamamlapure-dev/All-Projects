import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth';
import { ReportService } from '../services/reportService';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import { AuditService } from '../services/auditService';

export const sharedRouter = Router();

// Configure multer with memory storage (max 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// ==========================================
// 1. PDF & EXCEL REPORTING
// ==========================================

// Project Summary Report (PDF)
sharedRouter.get('/reports/project-summary/:projectId/pdf', requireAuth, async (req: Request, res: Response) => {
  const { projectId } = req.params;
  try {
    const pdfBuffer = await ReportService.generateProjectSummaryPdf(projectId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Project_Summary_${projectId}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'ReportError', message: err.message });
  }
});

// Department Marksheet (PDF) - HOD only
sharedRouter.get('/reports/department-marksheet/pdf', requireAuth, requireRole(Role.HOD), async (req: Request, res: Response) => {
  const deptId = req.session.user!.departmentId || 'dept-cse-01';
  try {
    const pdfBuffer = await ReportService.generateDepartmentMarksheetPdf(deptId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Department_Marksheet_Official.pdf"');
    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'ReportError', message: err.message });
  }
});

// Student Completion Certificate (PDF)
sharedRouter.get('/reports/certificate/:projectId/pdf', requireAuth, async (req: Request, res: Response) => {
  const studentName = req.query.studentName as string || req.session.user!.name;
  const projectTitle = req.query.projectTitle as string || 'Distributed IoT Fleet Telemetry & Edge Analytics Platform';

  try {
    const pdfBuffer = await ReportService.generateCertificatePdf(studentName, projectTitle);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Project_Completion_Certificate.pdf"');
    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'ReportError', message: err.message });
  }
});

// Department Projects Catalog (Excel .xlsx)
sharedRouter.get('/reports/department-catalog/excel', requireAuth, async (req: Request, res: Response) => {
  const deptId = req.session.user!.departmentId || 'dept-cse-01';
  try {
    const excelBuffer = await ReportService.generateProjectsCatalogExcel(deptId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Department_Projects_Catalog.xlsx"');
    res.status(200).send(excelBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'ReportError', message: err.message });
  }
});

// Mentor Workload & Allocation Report (Excel .xlsx) - HOD only
sharedRouter.get('/reports/mentor-workload/excel', requireAuth, requireRole(Role.HOD), async (req: Request, res: Response) => {
  const deptId = req.session.user!.departmentId || 'dept-cse-01';
  try {
    const excelBuffer = await ReportService.generateMentorWorkloadExcel(deptId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Mentor_Workload_Distribution.xlsx"');
    res.status(200).send(excelBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'ReportError', message: err.message });
  }
});

// Standardized Rubric Defense Sheet (PDF) - Evaluator and HOD
sharedRouter.get('/reports/evaluation-sheet/:evaluationId/pdf', requireAuth, async (req: Request, res: Response) => {
  const { evaluationId } = req.params;
  try {
    const pdfBuffer = await ReportService.generateEvaluationSheetPdf(evaluationId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Evaluation_Score_Sheet_${evaluationId}.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'ReportError', message: err.message });
  }
});

// Department Consolidated Marksheet (Excel .xlsx) - HOD only
sharedRouter.get('/reports/department-marksheet/excel', requireAuth, requireRole(Role.HOD), async (req: Request, res: Response) => {
  const deptId = req.session.user!.departmentId || 'dept-cse-01';
  try {
    const excelBuffer = await ReportService.generateDepartmentMarksheetExcel(deptId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Department_Consolidated_Marksheet.xlsx"');
    res.status(200).send(excelBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'ReportError', message: err.message });
  }
});

// Submissions Audit Matrix (Excel .xlsx)
sharedRouter.get('/reports/submissions-matrix/excel', requireAuth, async (req: Request, res: Response) => {
  const deptId = req.session.user!.departmentId || 'dept-cse-01';
  try {
    const excelBuffer = await ReportService.generateSubmissionsMatrixExcel(deptId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="Submissions_Audit_Matrix.xlsx"');
    res.status(200).send(excelBuffer);
  } catch (err: any) {
    res.status(500).json({ error: 'ReportError', message: err.message });
  }
});

// ==========================================
// 2. PRIVATE DOCUMENT STORAGE & STREAMING
// ==========================================

// List Project Documents
sharedRouter.get('/storage/projects/:projectId/documents', requireAuth, (req: Request, res: Response) => {
  const { projectId } = req.params;
  const docs = StorageService.listProjectDocuments(projectId);
  res.status(200).json({ documents: docs });
});

// Upload Document with MIME check and opaque key
sharedRouter.post('/storage/projects/:projectId/upload', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: 'ValidationError', message: 'File is required.' });
    return;
  }

  try {
    const record = await StorageService.registerUpload(req.session.user!, projectId, title || file.originalname, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });

    AuditService.record(
      req.session.user!,
      'DOCUMENT_UPLOAD',
      'DocumentVersion',
      `Uploaded file "${file.originalname}" (${file.size} bytes).`,
      record.id,
      req.ip
    );

    res.status(201).json({ message: 'Document uploaded securely.', document: record });
  } catch (err: any) {
    res.status(400).json({ error: 'UploadError', message: err.message });
  }
});

// Upload Revision Version of Document
sharedRouter.post('/storage/documents/:documentId/version', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  const { documentId } = req.params;
  const file = req.file;

  if (!file) {
    res.status(400).json({ error: 'ValidationError', message: 'File is required.' });
    return;
  }

  try {
    const record = await StorageService.uploadNewVersion(req.session.user!, documentId, {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
    });

    AuditService.record(
      req.session.user!,
      'DOCUMENT_REVISION_UPLOAD',
      'DocumentVersion',
      `Uploaded new version of document "${documentId}" (${file.size} bytes).`,
      record.id,
      req.ip
    );

    res.status(201).json({ message: 'Document revision uploaded.', document: record });
  } catch (err: any) {
    res.status(400).json({ error: 'UploadError', message: err.message });
  }
});

// Download Authorized Document
sharedRouter.get('/storage/documents/:documentVersionId/download', requireAuth, (req: Request, res: Response) => {
  const { documentVersionId } = req.params;
  try {
    const { filePath, record } = StorageService.getAuthorizedFile(req.session.user!, documentVersionId);
    res.setHeader('Content-Type', record.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${record.fileName}"`);
    res.sendFile(filePath);
  } catch (err: any) {
    res.status(404).json({ error: 'DownloadError', message: err.message });
  }
});

// Delete Document Version
sharedRouter.delete('/storage/documents/:documentVersionId', requireAuth, async (req: Request, res: Response) => {
  const { documentVersionId } = req.params;
  try {
    const success = await StorageService.deleteDocumentVersion(req.session.user!, documentVersionId);
    if (!success) {
      res.status(404).json({ error: 'NotFound', message: 'Document version not found.' });
      return;
    }
    AuditService.record(req.session.user!, 'DOCUMENT_DELETE', 'DocumentVersion', `Deleted document version ${documentVersionId}`, documentVersionId, req.ip);
    res.status(200).json({ message: 'Document version removed successfully.' });
  } catch (err: any) {
    const isForbidden = err.message.startsWith('Forbidden');
    res.status(isForbidden ? 403 : 400).json({ error: 'DeleteError', message: err.message });
  }
});

// ==========================================
// 3. NOTIFICATIONS, ANNOUNCEMENTS & CALENDAR
// ==========================================

// Get In-App Notifications
sharedRouter.get('/notifications', requireAuth, (req: Request, res: Response) => {
  const notifications = NotificationService.getNotifications(req.session.user!.id);
  res.status(200).json({ notifications, unreadCount: notifications.filter((n) => !n.isRead).length });
});

// Mark Notification Read
sharedRouter.post('/notifications/:id/read', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const success = NotificationService.markAsRead(req.session.user!.id, id);
  res.status(200).json({ success });
});

// Mark All Read
sharedRouter.post('/notifications/mark-all-read', requireAuth, (req: Request, res: Response) => {
  const count = NotificationService.markAllAsRead(req.session.user!.id);
  res.status(200).json({ markedCount: count });
});

// Get Department Announcements
sharedRouter.get('/announcements', requireAuth, (req: Request, res: Response) => {
  const deptId = req.session.user!.departmentId || 'dept-cse-01';
  const announcements = NotificationService.getAnnouncements(deptId);
  res.status(200).json({ announcements });
});

// Create Announcement (HOD only)
sharedRouter.post('/announcements', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  const { title, content, isPinned } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'ValidationError', message: 'Title and content are required.' });
    return;
  }

  try {
    const ann = NotificationService.createAnnouncement(req.session.user!, title, content, !!isPinned);
    AuditService.record(req.session.user!, 'ANNOUNCEMENT_CREATE', 'Announcement', `Published announcement: "${title}"`, ann.id, req.ip);
    res.status(201).json({ message: 'Announcement published successfully.', announcement: ann });
  } catch (err: any) {
    res.status(403).json({ error: 'AnnouncementError', message: err.message });
  }
});

// Toggle Pin Announcement (HOD only)
sharedRouter.post('/announcements/:id/toggle-pin', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const isPinned = NotificationService.togglePinAnnouncement(req.session.user!, id);
    res.status(200).json({ isPinned });
  } catch (err: any) {
    res.status(403).json({ error: 'AnnouncementError', message: err.message });
  }
});

// Delete Announcement (HOD only)
sharedRouter.delete('/announcements/:id', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const deleted = NotificationService.deleteAnnouncement(req.session.user!, id);
    if (!deleted) {
      res.status(404).json({ error: 'NotFound', message: 'Announcement not found.' });
      return;
    }
    AuditService.record(req.session.user!, 'ANNOUNCEMENT_DELETE', 'Announcement', `Deleted announcement ${id}`, id, req.ip);
    res.status(200).json({ message: 'Announcement deleted.' });
  } catch (err: any) {
    res.status(403).json({ error: 'AnnouncementError', message: err.message });
  }
});

// Get Academic Calendar Events
sharedRouter.get('/calendar/events', requireAuth, (_req: Request, res: Response) => {
  const events = NotificationService.getCalendarEvents();
  res.status(200).json({ events });
});

// Personal Reminders
sharedRouter.get('/reminders', requireAuth, (req: Request, res: Response) => {
  const reminders = NotificationService.getReminders(req.session.user!.id);
  res.status(200).json({ reminders });
});

sharedRouter.post('/reminders', requireAuth, (req: Request, res: Response) => {
  const { title, dueDate } = req.body;
  if (!title || !dueDate) {
    res.status(400).json({ error: 'ValidationError', message: 'title and dueDate are required.' });
    return;
  }
  const rem = NotificationService.createReminder(req.session.user!.id, title, dueDate);
  res.status(201).json({ message: 'Reminder created.', reminder: rem });
});

sharedRouter.post('/reminders/:id/resolve', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const success = NotificationService.resolveReminder(req.session.user!.id, id);
  res.status(200).json({ success });
});

// ==========================================
// 4. SECURITY AUDIT LOGGING (HOD only)
// ==========================================

sharedRouter.get('/audit-logs', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  const action = req.query.action as string;
  const resource = req.query.resource as string;
  const search = req.query.search as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

  try {
    const result = AuditService.queryLogs(req.session.user!, { action, resource, search, limit, offset });
    res.status(200).json(result);
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// Export Audit Logs to CSV (HOD only)
sharedRouter.get('/audit-logs/export/csv', requireAuth, requireRole(Role.HOD), (req: Request, res: Response) => {
  try {
    const csvContent = AuditService.exportAuditLogsToCsv(req.session.user!);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="Security_Audit_Trail_Export.csv"');
    res.status(200).send(csvContent);
  } catch (err: any) {
    res.status(403).json({ error: 'Forbidden', message: err.message });
  }
});

// ==========================================
// 5. CORRECTIONS & RESOLUTION WORKFLOW
// ==========================================

// In-memory corrections store for workflow verification
const feedbackCorrectionItems: Map<string, { id: string; requiredCorrection: string; isResolved: boolean; studentProof?: string }> = new Map([
  ['fb-01', { id: 'fb-01', requiredCorrection: 'Include latency graphs comparing edge clustering vs baseline.', isResolved: false }],
]);

// Student submits correction resolution proof
sharedRouter.post('/academic/feedback/:feedbackId/submit-correction', requireAuth, requireRole(Role.STUDENT), (req: Request, res: Response) => {
  const { feedbackId } = req.params;
  const { notes } = req.body;
  const item = feedbackCorrectionItems.get(feedbackId) || { id: feedbackId, requiredCorrection: 'Feedback resolution', isResolved: false };
  item.studentProof = notes || 'Correction completed by student team in report v1.2';
  feedbackCorrectionItems.set(feedbackId, item);
  AuditService.record(req.session.user!, 'CORRECTION_SUBMIT', 'Feedback', `Submitted correction for ${feedbackId}: "${notes}"`, feedbackId, req.ip);
  res.status(200).json({ message: 'Correction proof submitted for mentor verification.', item });
});

// Mentor verifies correction and marks resolved
sharedRouter.post('/academic/feedback/:feedbackId/verify-correction', requireAuth, requireRole(Role.PROJECT_MENTOR, Role.HOD), (req: Request, res: Response) => {
  const { feedbackId } = req.params;
  const item = feedbackCorrectionItems.get(feedbackId) || { id: feedbackId, requiredCorrection: 'Feedback resolution', isResolved: false };
  item.isResolved = true;
  feedbackCorrectionItems.set(feedbackId, item);
  AuditService.record(req.session.user!, 'CORRECTION_VERIFY', 'Feedback', `Verified and closed correction item ${feedbackId}`, feedbackId, req.ip);
  res.status(200).json({ message: 'Correction ratified and resolved.', item });
});

