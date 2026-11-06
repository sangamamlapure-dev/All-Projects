import { Router, Request, Response } from 'express';
import { memoryStore, MemoryStoreData } from '../db/memoryStore';
import { getDatabaseHealth } from '../db';
import { requireAuth } from '../middleware/auth';

export const databaseExplorerRouter = Router();

// Model metadata mapping
const MODEL_SCHEMAS: Record<string, { label: string; group: string; fields: string[] }> = {
  users: { label: 'User Accounts', group: 'Identity & RBAC', fields: ['id', 'email', 'name', 'role', 'departmentId', 'status', 'createdAt'] },
  departments: { label: 'Academic Departments', group: 'Organization', fields: ['id', 'code', 'name', 'hodName', 'studentCount', 'facultyCount'] },
  teams: { label: 'Project Teams', group: 'Teams & Collaboration', fields: ['id', 'name', 'departmentId', 'leaderId', 'members', 'createdAt'] },
  proposals: { label: 'Project Proposals', group: 'Academic Lifecycle', fields: ['id', 'projectId', 'teamId', 'title', 'techStack', 'status', 'submittedAt'] },
  projects: { label: 'Active Projects', group: 'Academic Lifecycle', fields: ['id', 'title', 'teamId', 'departmentId', 'status', 'mentorName', 'progressPct'] },
  mentorAssignments: { label: 'Mentor Allocations', group: 'Academic Lifecycle', fields: ['id', 'projectId', 'mentorId', 'isPrimary', 'assignedAt'] },
  milestones: { label: 'Project Milestones', group: 'Progress & Planning', fields: ['id', 'projectId', 'title', 'dueDate', 'status'] },
  tasks: { label: 'Actionable Tasks', group: 'Progress & Planning', fields: ['id', 'projectId', 'title', 'status', 'priority', 'assignee'] },
  reviews: { label: 'Review Schedules', group: 'Evaluations', fields: ['id', 'projectId', 'stage', 'scheduledDate', 'venue', 'status'] },
  evaluations: { label: 'Defense Evaluations', group: 'Evaluations', fields: ['id', 'projectId', 'evaluatorId', 'status', 'totalMarks', 'remarks'] },
  results: { label: 'Official Results', group: 'Evaluations', fields: ['id', 'projectId', 'departmentId', 'grade', 'totalScore', 'isPublished'] },
  documents: { label: 'Project Documents', group: 'Storage & Files', fields: ['id', 'projectId', 'title', 'version', 'mimeType', 'sizeBytes', 'uploadedAt'] },
  announcements: { label: 'Announcements Board', group: 'Communications', fields: ['id', 'departmentId', 'title', 'content', 'isPinned', 'author'] },
  calendarEvents: { label: 'Academic Calendar', group: 'Communications', fields: ['id', 'title', 'eventDate', 'type', 'location'] },
  reminders: { label: 'Deadlines & Reminders', group: 'Communications', fields: ['id', 'userId', 'title', 'dueDate', 'isCompleted'] },
  discussionThreads: { label: 'Discussion Threads', group: 'Collaboration', fields: ['id', 'projectId', 'title', 'author', 'replyCount', 'createdAt'] },
  meetingNotes: { label: 'Meeting Minutes', group: 'Collaboration', fields: ['id', 'projectId', 'title', 'mentorName', 'keyTakeaways', 'createdAt'] },
  systemSettings: { label: 'System Settings', group: 'Governance', fields: ['id', 'departmentId', 'key', 'value', 'description'] },
  auditLogs: { label: 'Security Audit Trail', group: 'Governance', fields: ['id', 'action', 'resource', 'resourceId', 'actorName', 'timestamp'] },
};

/**
 * GET /api/database/models - Overview of all database entities with live row counts
 */
databaseExplorerRouter.get('/models', async (_req: Request, res: Response) => {
  const dbHealth = await getDatabaseHealth();
  const models = Object.keys(MODEL_SCHEMAS).map((key) => {
    const meta = MODEL_SCHEMAS[key];
    const records = memoryStore.getCollection(key as keyof MemoryStoreData);
    return {
      name: key,
      label: meta.label,
      group: meta.group,
      fields: meta.fields,
      rowCount: records.length,
      primaryKey: 'id',
    };
  });

  res.status(200).json({
    database: dbHealth,
    totalEntities: models.length,
    totalRecords: models.reduce((acc, m) => acc + m.rowCount, 0),
    models,
  });
});

/**
 * GET /api/database/models/:modelName - Query records for a specific model
 */
databaseExplorerRouter.get('/models/:modelName', (req: Request, res: Response) => {
  const modelName = req.params.modelName as keyof MemoryStoreData;
  if (!MODEL_SCHEMAS[modelName]) {
    res.status(404).json({ error: `Model '${modelName}' not found.` });
    return;
  }

  const query = (req.query.q as string || '').toLowerCase();
  let records = memoryStore.getCollection(modelName);

  if (query) {
    records = records.filter((r) => JSON.stringify(r).toLowerCase().includes(query));
  }

  res.status(200).json({
    model: modelName,
    meta: MODEL_SCHEMAS[modelName],
    count: records.length,
    records,
  });
});

/**
 * POST /api/database/models/:modelName - Insert a new record into the live store
 */
databaseExplorerRouter.post('/models/:modelName', (req: Request, res: Response) => {
  const modelName = req.params.modelName as keyof MemoryStoreData;
  if (!MODEL_SCHEMAS[modelName]) {
    res.status(404).json({ error: `Model '${modelName}' not found.` });
    return;
  }

  try {
    const inserted = memoryStore.insertRecord(modelName, req.body);
    res.status(201).json({
      message: `Record inserted into '${modelName}' successfully.`,
      record: inserted,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Insertion failed' });
  }
});

/**
 * DELETE /api/database/models/:modelName/:id - Delete record from live store
 */
databaseExplorerRouter.delete('/models/:modelName/:id', (req: Request, res: Response) => {
  const modelName = req.params.modelName as keyof MemoryStoreData;
  const id = req.params.id;

  if (!MODEL_SCHEMAS[modelName]) {
    res.status(404).json({ error: `Model '${modelName}' not found.` });
    return;
  }

  const deleted = memoryStore.deleteRecord(modelName, id);
  if (!deleted) {
    res.status(404).json({ error: `Record with id '${id}' not found in '${modelName}'.` });
    return;
  }

  res.status(200).json({ message: `Record '${id}' deleted successfully from '${modelName}'.` });
});

/**
 * GET /api/backend/routes - Directory of all Express REST API endpoints with RBAC requirements
 */
databaseExplorerRouter.get('/routes', (_req: Request, res: Response) => {
  const routes = [
    { method: 'GET', path: '/api/health', auth: 'Public', desc: 'System uptime, role verification, database health' },
    { method: 'GET', path: '/api/db/diagnostics', auth: 'Public', desc: 'Prisma ORM schema entity groups and seed accounts' },
    { method: 'POST', path: '/api/auth/login', auth: 'Public (Rate Limited)', desc: 'Session login for 4 roles with bcrypt verification' },
    { method: 'POST', path: '/api/auth/logout', auth: 'Authenticated', desc: 'Session destruction and cookie invalidation' },
    { method: 'GET', path: '/api/auth/me', auth: 'Authenticated', desc: 'Current authenticated session identity and role' },
    { method: 'GET', path: '/api/dashboard/hod', auth: 'HOD Only', desc: 'Department metrics, proposals, mentor workloads, audit' },
    { method: 'GET', path: '/api/dashboard/student', auth: 'STUDENT Only', desc: 'Student project, team members, milestone timeline, tasks' },
    { method: 'GET', path: '/api/dashboard/mentor', auth: 'PROJECT_MENTOR Only', desc: 'Assigned project guidance, scheduled reviews, feedback' },
    { method: 'GET', path: '/api/dashboard/evaluator', auth: 'EXTERNAL_EVALUATOR Only', desc: 'Assigned defense evaluations & rubric scoring' },
    { method: 'POST', path: '/api/academic/teams', auth: 'STUDENT Only', desc: 'Form student project team (2-4 students)' },
    { method: 'POST', path: '/api/academic/teams/:id/proposals', auth: 'STUDENT Only', desc: 'Submit project proposal with similarity checking' },
    { method: 'POST', path: '/api/academic/projects/:id/allocate-mentor', auth: 'HOD Only', desc: 'Allocate faculty mentor with capacity quotas' },
    { method: 'POST', path: '/api/academic/projects/:id/reviews/schedule', auth: 'HOD / MENTOR', desc: 'Schedule midterm or final defense milestone' },
    { method: 'POST', path: '/api/academic/reviews/:id/feedback', auth: 'PROJECT_MENTOR Only', desc: 'Record structured feedback and required corrections' },
    { method: 'POST', path: '/api/academic/evaluations/:id/scores', auth: 'EXTERNAL_EVALUATOR Only', desc: 'Submit 4-criterion standardized rubric scores' },
    { method: 'POST', path: '/api/academic/results/:id/publish', auth: 'HOD Only', desc: 'Moderate scores and officially publish final grades' },
    { method: 'GET', path: '/api/shared/reports/summary/pdf', auth: 'Authenticated', desc: 'PDFKit stream: Project Summary Report' },
    { method: 'GET', path: '/api/shared/reports/catalog/excel', auth: 'Authenticated', desc: 'ExcelJS stream: Department Project Catalog' },
    { method: 'GET', path: '/api/shared/reports/mentor-workload/excel', auth: 'HOD Only', desc: 'ExcelJS stream: Faculty Workload Matrix' },
    { method: 'GET', path: '/api/shared/reports/marksheet/pdf', auth: 'HOD Only', desc: 'PDFKit stream: Consolidated Department Marksheet' },
    { method: 'GET', path: '/api/shared/audit/export/csv', auth: 'HOD Only', desc: 'Sanitized CSV stream of security audit trail' },
    { method: 'GET', path: '/api/supplementary/portfolio/pdf', auth: 'STUDENT Only', desc: 'PDFKit stream: Resume-ready verified Student Portfolio' },
    { method: 'POST', path: '/api/supplementary/evaluators/declare-coi', auth: 'EXTERNAL_EVALUATOR', desc: 'Formally record evaluator Conflict of Interest' },
    { method: 'GET', path: '/api/supplementary/moderation/discrepancies', auth: 'HOD Only', desc: 'Outlier detection engine (>15% score divergence)' },
    { method: 'POST', path: '/api/supplementary/settings/proposal-window', auth: 'HOD Only', desc: 'Toggle open/close dates for proposal submission' },
    { method: 'POST', path: '/api/supplementary/bulk-import/preview', auth: 'HOD Only', desc: 'Preview and validate CSV onboarding records' },
    { method: 'POST', path: '/api/supplementary/academic-terms/rollover', auth: 'HOD Only', desc: 'Academic term rollover and project archival' },
    { method: 'GET', path: '/api/database/models', auth: 'Public / Admin', desc: 'Overview of all 37 database models and live counts' },
    { method: 'GET', path: '/api/database/models/:modelName', auth: 'Public / Admin', desc: 'Fetch live rows for a specific database entity' },
  ];

  res.status(200).json({
    totalEndpoints: routes.length,
    routes,
  });
});

/**
 * POST /api/backend/query - Execute mock/live query runner
 */
databaseExplorerRouter.post('/query', (req: Request, res: Response) => {
  const { statement } = req.body;
  if (!statement || typeof statement !== 'string') {
    res.status(400).json({ error: 'SQL/Query statement is required.' });
    return;
  }

  const start = Date.now();
  const trimmed = statement.trim().toLowerCase();

  // Simple query dispatcher for interactive database console
  let matchedCollection: keyof MemoryStoreData = 'users';
  if (trimmed.includes('project')) matchedCollection = 'projects';
  else if (trimmed.includes('proposal')) matchedCollection = 'proposals';
  else if (trimmed.includes('team')) matchedCollection = 'teams';
  else if (trimmed.includes('milestone')) matchedCollection = 'milestones';
  else if (trimmed.includes('task')) matchedCollection = 'tasks';
  else if (trimmed.includes('audit')) matchedCollection = 'auditLogs';
  else if (trimmed.includes('setting')) matchedCollection = 'systemSettings';
  else if (trimmed.includes('department')) matchedCollection = 'departments';

  const rows = memoryStore.getCollection(matchedCollection);
  const durationMs = Date.now() - start;

  res.status(200).json({
    statement,
    inferredEntity: matchedCollection,
    rowCount: rows.length,
    executionTimeMs: Math.max(1, durationMs),
    columns: rows.length > 0 ? Object.keys(rows[0]) : [],
    rows,
  });
});
