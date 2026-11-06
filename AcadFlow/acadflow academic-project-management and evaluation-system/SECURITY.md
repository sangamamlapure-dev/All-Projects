# AcadFlow — Security & Compliance Architecture (Phase 10 Verified)

## 1. Authentication & Session Security
- **Server-Side Sessions**: Stateful sessions stored server-side via `express-session` with a 24-hour time-to-live.
- **HttpOnly Cookies**: Session tokens (`connect.sid`) are transmitted exclusively via `HttpOnly`, `SameSite=Lax`, and `Secure` (in production) cookies, completely mitigating JavaScript-based token theft.
- **Brute Force & Rate Limiting**: Sliding-window rate limiter (`server/src/middleware/rateLimit.ts`) restricts authentication routes (`/api/auth/login`) to a maximum of 10 attempts per 60 seconds per IP address. Exceeding requests trigger `HTTP 429 Too Many Requests` with a calculated `Retry-After` header.
- **Credential Storage**: Passwords hashed using `bcrypt` (work factor 12) with salt rounds. Plaintext passwords are never logged, persisted, or returned in API responses.
- **Session Invalidation**: Calling `POST /api/auth/logout` completely destroys server-side session state and clears client cookies.
- **Account Recovery**: Password reset tokens are cryptographically random, one-time use, and expire after 15 minutes.

---

## 2. Resource-Level Authorization & IDOR Defense
- **Zero Client Trust**: Client-supplied roles, department IDs, approval statuses, and grades are never trusted. All access decisions are verified against `req.session.userId` and the database.
- **Strict 4-Role Architecture**: Exactly four roles are enforced: `HOD`, `STUDENT`, `PROJECT_MENTOR`, and `EXTERNAL_EVALUATOR`. No 5th role, hidden superuser, or privilege bypass exists.
- **Department Boundary Enforcement**: HOD users can only query, modify, or export records belonging to their authorized department (`user.departmentId`). Cross-department requests (e.g. `GET /api/departments/dept-foreign-99/summary`) are rejected with `HTTP 403 Forbidden`.
- **Assignment Scoping**: Project Mentors and External Evaluators are restricted to projects where an active `MentorAssignment` or `EvaluatorAssignment` exists.
- **Student Ownership**: Students can only inspect or modify projects and teams where they are confirmed members in `TeamMembership`. Students attempting to publish results or schedule reviews are rejected with `HTTP 403 Forbidden`.

---

## 3. Input Validation & Injection Mitigation
- **Server-Side Schema Validation**: All incoming request payloads (JSON, query parameters, route params) are strictly validated using `Zod` schemas before executing business logic. Invalid inputs fail fast with `HTTP 400 Bad Request`.
- **SQL Injection Defense**: All queries execute through Prisma ORM using parameterized SQL. Raw queries without parameter binding are strictly prohibited. Malicious SQL strings (e.g. `' OR 1=1 --`, `admin' --`, `'; DROP TABLE;`) fail schema parsing or parameterize cleanly without executing arbitrary SQL.
- **Output Sanitization & XSS Defense**: Middleware recursively sanitizes incoming request bodies, stripping `<script>` tags and JavaScript event handlers (`on*`).

---

## 4. Private File Storage & Path Traversal Prevention
- **Isolated Storage Directory**: Uploaded documents are stored in a private directory (`uploads/private_documents`) outside web roots.
- **Randomized UUID Keys**: Files are stored with cryptographically random UUID keys (`uuidv4()`), completely decoupling filesystem paths from user-provided filenames.
- **Signature & MIME Validation**: File uploads are verified for permitted extensions and MIME types (`pdf`, `docx`, `pptx`, `xlsx`, `zip`, approved images) and constrained by a strict file size ceiling (25MB).
- **Path Traversal Defense**: All file streaming and download routes enforce strict regex path containment (`/^[a-zA-Z0-9_\-]+$/`). Payloads containing `../` or `%2e%2e` are rejected with `HTTP 400 Bad Request` or `HTTP 404 Not Found`.

---

## 5. Audit Logging & Evaluation Immutability
- **Security Audit Trails**: High-impact administrative actions (account suspension, proposal approval/rejection, mentor assignment, rubric adjustments, grade moderation, result publication) are written to an append-only `AuditLog` table capturing actor ID, department ID, action type, resource ID, client IP, and timestamp.
- **Evaluation Immutability**: Once an External Evaluator finalizes a score, it cannot be modified by any party without an audited, logged HOD administrative reopening workflow.
- **Conflict of Interest (COI) Enforcement**: External Evaluators must record formal COI declarations prior to defense rubric score submission.

---

## 6. Centralized Error Handling & Redaction
- In production (`NODE_ENV === 'production'`), error middleware suppresses internal stack traces, database schema details, and file paths, returning standard generic error structures to clients while writing redacted logs server-side.

---

## 7. Security Penetration Test Evidence

All automated security tests verified passing in `tests/security_e2e.test.ts`:

| Security Test Case | Attack Payload / Vector | Defense Mechanism | Test Status |
|---|---|---|---|
| **SQL Injection** | `email: "' OR 1=1 --"` | Zod email validation & parameterized SQL | **PASSED** (HTTP 400/401) |
| **SQL Injection** | `email: "admin' --"` | Parameterized query | **PASSED** (HTTP 400/401) |
| **XSS Script Injection** | `content: "<script>alert('XSS')</script>"` | Recursive middleware sanitization | **PASSED** (Tags stripped) |
| **Brute Force Login** | 11 rapid requests in <2s | Sliding-window rate limiter | **PASSED** (HTTP 429 + Retry-After) |
| **Path Traversal** | `/api/storage/documents/../../etc/passwd` | Path containment regex | **PASSED** (HTTP 400/404) |
| **Cross-Dept IDOR** | `GET /api/departments/dept-foreign-99` | Department isolation middleware | **PASSED** (HTTP 403 Forbidden) |
| **Privilege Escalation** | Student attempting result publish | RBAC role check (`requireRole(HOD)`) | **PASSED** (HTTP 403 Forbidden) |
| **Privilege Escalation** | Evaluator scheduling reviews | RBAC role check (`HOD` or `MENTOR`) | **PASSED** (HTTP 403 Forbidden) |
