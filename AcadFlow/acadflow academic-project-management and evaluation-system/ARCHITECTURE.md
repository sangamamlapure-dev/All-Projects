# AcadFlow — Architecture Document

## 1. Architectural Philosophy
AcadFlow is architected as a secure, production-grade, full-stack monolith designed for academic project management and evaluation. It separates concerns between client-side rendering, server-side API processing, and relational persistence while avoiding artificial distributed complexity.

```
+-----------------------------------------------------------------+
|                        Client Layer                             |
|  - React 19 SPA (Vite)                                         |
|  - Bootstrap 5 + Lucide Icons                                   |
|  - Role-Specific Dashboards (HOD, Student, Mentor, Evaluator)   |
|  - React Hook Form + Zod Client Validation                      |
+-----------------------------------------------------------------+
                               |
                        HTTP / JSON (REST)
                               |
+-----------------------------------------------------------------+
|                        Server Layer                             |
|  - Express.js + TypeScript                                      |
|  - Vite Dev Middleware (Development) / Static Serving (Prod)    |
|  - Helmet, Rate Limiter, CSRF, Secure HttpOnly Sessions         |
|  - Resource-Level & Department Authorization Middleware         |
|  - Centralized Error Handling & Redacted Logging                |
+-----------------------------------------------------------------+
                               |
                         Prisma Client
                               |
+-----------------------------------------------------------------+
|                        Database Layer                           |
|  - MySQL 8.0                                                    |
|  - Strict Foreign Keys, Indexes, Cascades & Unique Constraints  |
|  - Isolated Test & Development Databases                        |
+-----------------------------------------------------------------+
```

## 2. Directory Layout
```
AcadFlow/
├── client/ (or src/ for integrated SPA)
│   ├── app/
│   ├── components/
│   ├── layouts/
│   ├── features/
│   │   ├── auth/
│   │   ├── departments/
│   │   ├── students/
│   │   ├── teams/
│   │   ├── projects/
│   │   ├── mentors/
│   │   ├── milestones/
│   │   ├── submissions/
│   │   ├── reviews/
│   │   ├── evaluations/
│   │   ├── notifications/
│   │   └── reports/
│   └── services/
├── server/
│   ├── src/
│   │   ├── app.ts          # Express application setup, routes & middleware
│   │   ├── config/         # Environment, session & security configuration
│   │   ├── middleware/     # Auth, RBAC, Rate-limit, Error handlers
│   │   ├── routes/         # REST API route declarations
│   │   ├── controllers/    # Request/Response handlers
│   │   ├── services/       # Core business & lifecycle logic
│   │   ├── repositories/   # Prisma database query abstractions
│   │   ├── validators/     # Zod schema request validation
│   │   └── storage/        # Private file management
│   ├── prisma/
│   │   ├── schema.prisma   # Declarative database model
│   │   ├── migrations/     # Prisma versioned migration files
│   │   └── seed.ts         # Seed script for 4 roles
│   └── tests/              # Supertest & Vitest backend test suites
├── server.ts               # Full-stack root entry point with Vite middleware
├── .env.example
├── README.md
├── REQUIREMENT_TRACEABILITY.md
└── FEATURE_STATUS.md
```

## 3. Strict Four-Role Access Model
The application enforces **strictly four interactive application roles**:
1. `HOD`: Department Administrator owning department user management, approvals, mentor allocations, evaluator assignments, settings, and result publishing.
2. `STUDENT`: Project team member managing proposals, tasks, progress uploads, and viewing published results.
3. `PROJECT_MENTOR`: Faculty supervisor managing explicitly assigned student projects, reviews, meeting notes, and correction approvals.
4. `EXTERNAL_EVALUATOR`: External specialist conducting rubric-based grading on explicitly assigned candidate projects.

*Note:* There is NO `SYSTEM_ADMIN`, NO `SUPER_ADMIN`, and NO separate `DEPARTMENT_ADMIN` role. Global infrastructure configuration is managed through server environment configuration, not an application superuser account.

## 4. Security Boundaries & Authorization
- **Authentication**: Stateful server-side sessions backed by an HttpOnly, SameSite cookie.
- **Authorization**: Role-based and object-level authorization on every endpoint. No client-supplied IDs (department, project, mentor, evaluator) are trusted without verifying against the authenticated user's session.
- **Data Isolation**: Multi-department isolation ensures HOD can only access records within their assigned department. Mentor and evaluator queries are strictly scoped to explicitly assigned project IDs.
