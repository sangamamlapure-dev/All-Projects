import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { getDatabaseHealth } from './db';
import { authRouter } from './routes/authRoutes';
import { departmentRouter } from './routes/departmentRoutes';
import { dashboardRouter } from './routes/dashboardRoutes';
import { academicRouter } from './routes/academicRoutes';
import { sharedRouter } from './routes/sharedRoutes';
import { supplementaryRouter } from './routes/supplementaryRoutes';
import { databaseExplorerRouter } from './routes/databaseExplorerRoutes';
import { sanitizeInputs, validateCsrf } from './middleware/security';

export const app = express();

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Vite SPA scripts and development UI assets
    crossOriginEmbedderPolicy: false,
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sanitizeInputs);
app.use(validateCsrf);


// Server-Side Stateful Session Configuration
const sessionSecret = process.env.SESSION_SECRET || 'acadflow_production_grade_session_secret_2026';
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Health Check Endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbHealth = await getDatabaseHealth();

  res.status(200).json({
    status: 'healthy',
    service: 'AcadFlow API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbHealth,
    roles: ['HOD', 'STUDENT', 'PROJECT_MENTOR', 'EXTERNAL_EVALUATOR'],
  });
});

// Database Diagnostics Endpoint
app.get('/api/db/diagnostics', async (_req: Request, res: Response) => {
  const dbHealth = await getDatabaseHealth();
  res.status(200).json({
    provider: 'MySQL 8',
    orm: 'Prisma 6.19.3',
    database: dbHealth,
    entityGroups: [
      {
        name: 'Identity & Configuration',
        models: ['User', 'Department', 'AcademicYear', 'Semester', 'Permission', 'UserSession', 'Invitation', 'StudentProfile', 'FacultyProfile', 'ExternalEvaluatorProfile', 'SystemSetting'],
      },
      {
        name: 'Teams & Projects',
        models: ['Team', 'TeamMembership', 'TeamInvitation', 'Project', 'ProjectProposal', 'ProposalRevision', 'MentorAssignment', 'Milestone', 'Task', 'TaskComment', 'ProgressUpdate'],
      },
      {
        name: 'Documents & Submissions',
        models: ['Document', 'DocumentVersion', 'Submission'],
      },
      {
        name: 'Reviews & Evaluations',
        models: ['ReviewSchedule', 'Review', 'ReviewAttendance', 'Feedback', 'EvaluationRubric', 'RubricCriterion', 'Evaluation', 'EvaluationScore', 'Result', 'ResultVersion'],
      },
      {
        name: 'Communication & Governance',
        models: ['Notification', 'Announcement', 'CalendarEvent', 'Reminder', 'DiscussionThread', 'DiscussionPost', 'ProjectComment', 'Mention', 'MeetingNote', 'ActionItem', 'AuditLog', 'ActivityLog', 'SavedFilter', 'UserPreference', 'DashboardPreference', 'IntegrationConfiguration', 'ExportJob', 'BackupRecord', 'AIRequestLog'],
      },
    ],
    seedAccounts: [
      { role: 'HOD', email: 'hod.cse@college.edu', name: 'Dr. Ramesh Kulkarni (Dept Admin)' },
      { role: 'PROJECT_MENTOR', email: 'mentor.sharma@college.edu', name: 'Prof. Sunita Sharma' },
      { role: 'PROJECT_MENTOR', email: 'mentor.patel@college.edu', name: 'Prof. Vikram Patel' },
      { role: 'STUDENT', email: 'student.aarav@college.edu', name: 'Aarav Deshmukh (Team Leader)' },
      { role: 'STUDENT', email: 'student.diya@college.edu', name: 'Diya Joshi' },
      { role: 'STUDENT', email: 'student.rohan@college.edu', name: 'Rohan Verma' },
      { role: 'EXTERNAL_EVALUATOR', email: 'evaluator.drgupta@external.ac.in', name: 'Dr. Arvind Gupta' },
    ],
  });
});

// Mounted Routers
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/academic', academicRouter);
app.use('/api/supplementary', supplementaryRouter);
app.use('/api/database', databaseExplorerRouter);
app.use('/api/backend', databaseExplorerRouter);
app.use('/api', sharedRouter);


// Centralized 404 handler for unknown API routes
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`,
  });
});

// Centralized Error Handling Middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const statusCode = (res.statusCode && res.statusCode >= 400) ? res.statusCode : 500;

  console.error(`[Error] [${req.method} ${req.url}]:`, err.message);

  res.status(statusCode).json({
    error: err.name || 'InternalServerError',
    message: isDev ? err.message : 'An internal server error occurred.',
    ...(isDev && { stack: err.stack }),
  });
});

export default app;
