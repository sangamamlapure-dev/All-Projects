# AcadFlow — Academic Project Management and Evaluation System

[![Phase](https://img.shields.io/badge/Phases-All%209%20Phases%20Complete-success.svg)](#)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen.svg)](#)
[![Roles](https://img.shields.io/badge/Roles-Strictly%204%20Roles-purple.svg)](#)
[![Tests](https://img.shields.io/badge/Tests-77%2F77%20Passing-blue.svg)](#)
[![Coverage](https://img.shields.io/badge/Security-OWASP%20Hardened-orange.svg)](#)

AcadFlow is a production-oriented, full-stack Academic Project Management and Evaluation System engineered for engineering colleges, academic departments, project mentors, students, and external evaluators.

---

## 1. Authoritative Four-Role Model

AcadFlow enforces **strictly four application roles**. HOD is the Department Administrator who owns the Admin Panel. There is no separate `SYSTEM_ADMIN`, `SUPER_ADMIN`, or fifth role:

1. **`HOD` (Department Administrator & Panel Owner)**:
   - Authority over their explicitly assigned department (`dept-cse-01`).
   - Manages faculty mentors, students, user invitations, and account suspensions.
   - Reviews and formally decides project proposals (Approve, Reject, Request Revisions).
   - Allocates faculty mentors using workload capacity balancing.
   - Configures academic terms, submission windows, review stages, and rubric weights.
   - Assigns external evaluators, inspects score discrepancy outliers (>15% divergence), moderates evaluations, and publishes official results.
   - Manages academic term rollover, archival, and exports consolidated reports.

2. **`STUDENT`**:
   - Forms multi-member student project teams and submits structured proposals.
   - Tracks visual project milestones and manages personal Kanban tasks.
   - Submits document deliverables with pre-flight checklist validation.
   - Submits proof of corrections against mentor review action items.
   - Generates and exports resume-ready PDF project portfolios with verification hashes.

3. **`PROJECT_MENTOR`**:
   - Supervises explicitly assigned teams within department capacity.
   - Schedules review milestones and conducts progress evaluations.
   - Records structured meeting notes and actionable student tasks.
   - Verifies student correction submissions and signs off on deliverables.

4. **`EXTERNAL_EVALUATOR`**:
   - Conducts formal defense evaluations for assigned student teams.
   - Formally records Conflict of Interest (COI) declarations prior to scoring.
   - Scores defenses across standardized multi-criteria rubrics (Technical Complexity, Methodology, Defense Presentation, Viva).
   - Submits qualitative feedback and final grade recommendations.

---

## 2. Technology Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Bootstrap 5 UI conventions, Lucide React, Zod.
- **Backend**: Node.js 22 LTS, Express.js, TypeScript, REST API, Centralized Error Sanitization, Sliding-Window Rate Limiting.
- **Database & ORM**: MySQL 8.0, Prisma ORM 6.19.3, Prisma Migrate, 37 relational models, non-blocking TCP socket connectivity checks.
- **Document & Reporting Engines**: PDFKit (Project summaries, completion certificates, marksheet exports, defense score sheets, student portfolios) and ExcelJS (Department catalogs, mentor workload matrices, marks spreadsheets).
- **Security**: HttpOnly SameSite=Lax server sessions, bcrypt password hashing, XSS sanitization, CSRF origin verification, path traversal mitigation, and resource-level RBAC.
- **Containerization & Ops**: Multi-stage Alpine Dockerfile, Docker Compose orchestration, automated compressed backup (`scripts/backup_db.sh`), safe disaster recovery (`scripts/restore_db.sh`), and healthcheck probing (`scripts/healthcheck.js`).

---

## 3. Master Development Phases (100% Completed & Verified)

| Phase | Description | Automated Tests | Status |
|---|---|---|---|
| **Phase 1: Foundation** | Express + React + Vite skeleton, `/api/health`, error handling, safe `.env.example` | 3 tests (`tests/health.test.ts`) | **VERIFIED** |
| **Phase 2: Data Layer** | 37 Prisma models, MySQL 8 migration DDL, deterministic 4-role seed accounts, DB diagnostics | Seed & migration verification | **VERIFIED** |
| **Phase 3: Auth & RBAC** | HttpOnly sessions, bcrypt hashing, 4-role login/logout, password reset, cross-dept IDOR defense | 13 tests (`tests/auth.test.ts`) | **VERIFIED** |
| **Phase 4: Role Dashboards** | Role-scoped APIs and interactive dashboards for HOD, Student, Mentor, and Evaluator | 9 tests (`tests/dashboard.test.ts`) | **VERIFIED** |
| **Phase 5: Academic Lifecycle** | End-to-end proposal workflow, mentor allocation, review scheduling, rubric scoring, result publishing | 11 tests (`tests/lifecycle.test.ts`) | **VERIFIED** |
| **Phase 6: Shared Modules** | PDFKit/ExcelJS exports, private storage service, announcements, calendar, audit log CSV | 20 tests (`tests/shared.test.ts`) | **VERIFIED** |
| **Phase 7: Supplementary Operations** | Resume portfolio generator, pre-flight checklist, discussion threads, meeting notes, COI, outlier engine, rollover | 13 tests (`tests/supplementary.test.ts`) | **VERIFIED** |
| **Phase 8: Security Hardening** | Sliding-window rate limiter, SQLi/XSS/traversal defense, end-to-end 4-role journey verification | 8 tests (`tests/security_e2e.test.ts`) | **VERIFIED** |
| **Phase 9: Production Readiness** | Multi-stage Docker, Docker Compose, automated backup/restore scripts, healthcheck probe, Nginx runbook | Production build & probe | **VERIFIED** |

---

## 4. Quickstart Guide

### Development Mode
```bash
# 1. Install dependencies
npm install

# 2. Run automated test suites (77 tests)
npm test

# 3. Start development server (serves frontend & backend on port 3000)
npm run dev
```

### Production Build & Deployment
```bash
# Build optimized client assets
npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker Compose Orchestration
```bash
# Launch AcadFlow app and MySQL 8 database with persistent volumes
docker compose up -d --build

# Run database migrations and seed deterministic accounts
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

---

## 5. Seed Test Credentials (Strict 4 Roles)

| Role | Email | Password | Scope / Permissions |
|---|---|---|---|
| **`HOD`** | `hod.cse@college.edu` | `HodPassword@123` | Department Admin (CSE Dept: `dept-cse-01`) |
| **`STUDENT`** | `student.aarav@college.edu` | `StudentPassword@123` | Team Leader (`team-alpha-01`) |
| **`PROJECT_MENTOR`** | `mentor.neha@college.edu` | `MentorPassword@123` | Faculty Guide (`user-faculty-01`) |
| **`EXTERNAL_EVALUATOR`** | `evaluator.vikram@external.org` | `EvaluatorPassword@123` | External Defense Examiner (`user-evaluator-01`) |

---

## 6. Project Documentation Suite

- [Master Development Plan](DEVELOPMENT_PLAN.md) — Phase-by-phase execution tracking.
- [Requirement Traceability Matrix](REQUIREMENT_TRACEABILITY.md) — Requirements traceability and 25-feature status.
- [Feature Status Registry](FEATURE_STATUS.md) — Single source of truth for all 44 verified features.
- [Development Log](DEVELOPMENT_LOG.md) — Complete audit log of all 9 development entries.
- [Deployment & Operations Guide](DEPLOYMENT.md) — Production setup, Docker, Nginx TLS, backup and rollback runbooks.
- [System Architecture](ARCHITECTURE.md) — Architectural patterns and data flow diagrams.
- [Database Schema Design](DATABASE_SCHEMA.md) — Complete 37-model relational catalog.
- [Permissions Matrix](PERMISSIONS_MATRIX.md) — 4-role RBAC authorization matrix.
- [Security Architecture](SECURITY.md) — Threat model and OWASP defense specifications.
