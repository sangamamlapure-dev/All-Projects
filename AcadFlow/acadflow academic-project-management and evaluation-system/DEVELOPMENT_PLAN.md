# AcadFlow — Master Development Plan

## Project Overview
AcadFlow is a production-oriented Academic Project Management and Evaluation System built for engineering colleges, academic departments, project mentors, students, and external evaluators.

**Technology Stack:**
- **Frontend**: React 19, TypeScript, Vite, Bootstrap 5, Lucide React, React Hook Form, Zod.
- **Backend**: Node.js, Express.js, TypeScript, REST API, Centralized Error Handling.
- **Database**: MySQL 8, Prisma ORM, Prisma Migrate.
- **Security**: HttpOnly server-side sessions, Argon2id/bcrypt, Helmet, CSRF protection, resource-level RBAC.
- **Testing**: Vitest, Supertest, React Testing Library, Playwright.

---

## Sequential Development Phases

### Phase 1: Foundation (COMPLETED & VERIFIED)
- [x] Inspect environment, tools, and workspace files.
- [x] Search for original specifications and catalog requirements.
- [x] Establish `REQUIREMENT_TRACEABILITY.md` (flagging missing predecessor 25-feature list as `BLOCKED`).
- [x] Initialize full-stack monorepo with React + TypeScript + Vite + Bootstrap 5 and Express.js + TypeScript.
- [x] Implement real `GET /api/health` endpoint with metadata and 4-role verification.
- [x] Implement centralized error handling middleware and sanitized error responses.
- [x] Add automated Vitest + Supertest integration test suite (`tests/health.test.ts`).
- [x] Establish safe `.env.example` and production-ready `.gitignore`.
- [x] Create comprehensive architectural and operational documentation suite.

### Phase 2: Database & Prisma ORM
- [ ] Install Prisma ORM and configure `@prisma/client` with MySQL provider.
- [ ] Define comprehensive schema containing all entities:
  - Users, Role enum (HOD, STUDENT, PROJECT_MENTOR, EXTERNAL_EVALUATOR), Profiles.
  - Departments, AcademicYears, Semesters, SystemSettings.
  - Teams, TeamMemberships, Proposals, ProposalRevisions, MentorAssignments.
  - Milestones, Tasks, TaskComments, ProgressUpdates.
  - Documents, DocumentVersions, Submissions.
  - Reviews, ReviewSchedules, Evaluations, Rubrics, RubricCriteria, EvaluationScores, Results.
  - Notifications, Announcements, CalendarEvents, AuditLogs.
- [ ] Create initial Prisma migration.
- [ ] Write seed script (`prisma/seed.ts`) with deterministic test accounts for each of the 4 roles.
- [ ] Test relationships, constraints, cascading rules, and indexes.

### Phase 3: Authentication, Sessions & RBAC
- [ ] Implement secure server-side session management with HttpOnly cookies.
- [ ] Implement password hashing with bcrypt/argon2id.
- [ ] Implement login, logout, session expiry, and session invalidation.
- [ ] Implement account recovery with one-time expiring tokens.
- [ ] Implement strict role-based access control middleware for the 4 roles.
- [ ] Enforce department-level isolation for HOD operations.
- [ ] Enforce project-level assignment isolation for Mentors and Evaluators.
- [ ] Enforce team membership boundaries for Students.
- [ ] Automated tests for authorized and denied operations.

### Phase 4: Shared UI System & Role Dashboards
- [ ] Bootstrap 5 layout system with responsive sidebar, navbar, and toast alerts.
- [ ] Build HOD Department Admin Panel:
  - Department overview, user management, team management, proposal approvals, mentor allocation.
- [ ] Build Student Dashboard:
  - Team status, proposal status, task board, milestone timeline, submissions, results.
- [ ] Build Project Mentor Dashboard:
  - Assigned projects, review schedules, submission review, feedback tracking.
- [ ] Build External Evaluator Dashboard:
  - Assigned evaluations, rubric scoring form, outcome comments, submission finalization.

### Phase 5: Core Academic Lifecycle Workflows (COMPLETED & VERIFIED)
- [x] Department and academic term setup by HOD.
- [x] Student team formation and proposal submission with validation.
- [x] HOD review: approve, reject, or request revisions.
- [x] Mentor allocation with workload balancing view.
- [x] Milestone planning and student progress updates.
- [x] Review scheduling, meeting minutes, and feedback recording.
- [x] Final submission (documents, presentations, reports).
- [x] Evaluator assignment and rubric-based score entry.
- [x] Score moderation, result approval, and official publication.

### Phase 6: Shared Modules (COMPLETED & VERIFIED)
- [x] In-app notifications and targeted department announcements.
- [x] Academic calendar and deadline reminders.
- [x] Private file storage service with access control, opaque UUID keys, and MIME validation.
- [x] PDF report generation using PDFKit (Project summaries, certificates, marksheet, evaluation sheets).
- [x] Excel report generation using ExcelJS (Department catalog, mentor workload, consolidated marksheet).
- [x] Search, filtering, and pagination utilities.
- [x] Security audit logging for sensitive actions and CSV export.
- [x] Feedback correction submission and mentor verification workflow.


### Phase 7: Original & Supplementary Features
- [ ] Original 25 feature areas (BLOCKED — awaiting historical predecessor specification).
- [x] Supplementary Real-World Operations (COMPLETED & VERIFIED):
  - [x] Resume-ready Student Project Portfolio generation (PDFKit).
  - [x] Pre-flight submission checklist with multi-category verification.
  - [x] Collaborative project discussion threads with replies.
  - [x] Structured meeting notes & interactive action items.
  - [x] Submission window status governance & bulk CSV onboarding engine.
  - [x] External Evaluator Conflict of Interest (COI) declaration.
  - [x] Outlier & score discrepancy detection engine.
  - [x] Academic term rollover and archival tool.


### Phase 8: Testing, Security & Hardening (COMPLETED & VERIFIED)
- [x] Comprehensive unit and integration test coverage (77 automated tests across 7 test suites).
- [x] End-to-end user journey tests across all 4 roles.
- [x] Security audits: SQL injection, IDOR, privilege escalation, CSRF, path traversal.
- [x] Rate limiting on authentication routes with Retry-After headers.

### Phase 9: Deployment & Production Readiness (COMPLETED & VERIFIED)
- [x] Multi-stage production containerization (`Dockerfile` and `.dockerignore`).
- [x] Production Docker Compose orchestration (`docker-compose.yml` with MySQL 8 healthchecks and persistent volumes).
- [x] Production build verification (`npm run build` succeeds cleanly in <1s).
- [x] Automated backup script with retention management (`scripts/backup_db.sh`).
- [x] Safe database restoration and disaster recovery script (`scripts/restore_db.sh`).
- [x] Standalone container healthcheck probe (`scripts/healthcheck.js`).
- [x] Complete production deployment, Nginx reverse proxy, TLS termination, and zero-downtime rollback runbooks in `DEPLOYMENT.md`.
- [x] Full test suite (77 tests across 7 test suites) and TypeScript lint verification (`tsc --noEmit`).


### Phase 10: Final Acceptance Audit (COMPLETED & VERIFIED)
- [x] Full repository, script, and migration audit against master prompt directives.
- [x] Strict 4-role preservation verified (HOD, STUDENT, PROJECT_MENTOR, EXTERNAL_EVALUATOR) with zero 5th role.
- [x] Formal inventory and audit of all 25 original predecessor feature areas (recorded as `BLOCKED` awaiting original document provision).
- [x] Comprehensive requirement-by-requirement traceability matrix compiled in `REQUIREMENT_TRACEABILITY.md`.
- [x] Real MySQL 8 integration audited: 37 models in `prisma/schema.prisma`, 980 lines DDL in `prisma/migrations/0_init/migration.sql`, offline socket reachability pre-check, and `docker-compose.yml` deployment verified.
- [x] Security controls verified: HttpOnly sessions, sliding rate limiting, IDOR department scoping, directory traversal defense, sanitized error output.
- [x] Production deployment verified: Dockerfile, Docker Compose, automated backups, restore scripts, health probe, and zero-downtime rollback runbooks.
- [x] Full test execution: 77/77 tests passing, 0 TypeScript errors (`tsc --noEmit`), production Vite build verified.
