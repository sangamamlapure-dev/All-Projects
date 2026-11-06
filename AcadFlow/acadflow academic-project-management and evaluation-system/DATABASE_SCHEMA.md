# AcadFlow — Database Schema Design

## 1. Overview
AcadFlow uses **MySQL 8** with **Prisma ORM**. All database operations use explicit foreign keys, indexes, referential integrity constraints, and UTC timestamps (`createdAt`, `updatedAt`).

## 2. Entity Groups & Models

### 2.1 Identity, Roles & Departments
- **`Role` (Enum)**: `HOD`, `STUDENT`, `PROJECT_MENTOR`, `EXTERNAL_EVALUATOR`
- **`User`**: `id`, `email` (unique), `passwordHash`, `name`, `role`, `departmentId`, `status` (ACTIVE, SUSPENDED, INACTIVE), `createdAt`, `updatedAt`
- **`UserSession`**: `id`, `userId`, `sessionToken` (indexed), `expiresAt`, `ipAddress`, `userAgent`
- **`Department`**: `id`, `code` (unique), `name`, `createdAt`
- **`AcademicYear`**: `id`, `departmentId`, `yearName` (e.g., '2026-2027'), `isCurrent`, `startDate`, `endDate`
- **`Semester`**: `id`, `academicYearId`, `termNumber`, `isActive`
- **`StudentProfile`**: `id`, `userId`, `enrollmentNumber` (unique), `batch`, `gpa`
- **`FacultyProfile`**: `id`, `userId`, `designation`, `specialization`, `maxMenteeQuota`
- **`ExternalEvaluatorProfile`**: `id`, `userId`, `institution`, `qualification`, `designation`
- **`Invitation`**: `id`, `email`, `departmentId`, `role`, `token` (unique), `expiresAt`, `acceptedAt`

### 2.2 Teams & Projects
- **`Team`**: `id`, `name`, `departmentId`, `academicYearId`, `createdById`, `createdAt`
- **`TeamMembership`**: `id`, `teamId`, `studentId`, `roleInTeam` (LEADER, MEMBER), `joinedAt`
- **`Project`**: `id`, `teamId` (unique), `departmentId`, `title`, `description`, `status` (PROPOSED, APPROVED, IN_PROGRESS, REVIEWED, EVALUATED, COMPLETED, ARCHIVED)
- **`ProjectProposal`**: `id`, `projectId`, `title`, `abstract`, `techStack`, `status` (DRAFT, SUBMITTED, REVISION_REQUESTED, APPROVED, REJECTED), `submissionDate`
- **`ProposalRevision`**: `id`, `proposalId`, `versionNumber`, `changeSummary`, `feedbackNotes`, `createdAt`
- **`MentorAssignment`**: `id`, `projectId`, `mentorId`, `assignedAt`, `isPrimary`
- **`Milestone`**: `id`, `projectId`, `title`, `description`, `dueDate`, `status` (PENDING, IN_PROGRESS, COMPLETED, OVERDUE)
- **`Task`**: `id`, `milestoneId`, `title`, `assignedToId`, `status` (TODO, IN_PROGRESS, COMPLETED), `priority` (LOW, MEDIUM, HIGH)
- **`ProgressUpdate`**: `id`, `projectId`, `studentId`, `summary`, `blockers`, `submittedAt`

### 2.3 Documents & Submissions
- **`Document`**: `id`, `projectId`, `title`, `category` (PROPOSAL, REPORT, PRESENTATION, EVIDENCE, SOURCE_CODE), `createdAt`
- **`DocumentVersion`**: `id`, `documentId`, `versionNumber`, `storageKey`, `fileName`, `fileSize`, `mimeType`, `uploadedById`, `createdAt`
- **`Submission`**: `id`, `projectId`, `stage` (STAGE_1, MIDTERM, FINAL), `submittedById`, `documentVersionId`, `submittedAt`

### 2.4 Reviews, Evaluations & Results
- **`ReviewSchedule`**: `id`, `projectId`, `departmentId`, `stage`, `scheduledDate`, `venue`, `status`
- **`Feedback`**: `id`, `reviewScheduleId`, `mentorId`, `comments`, `requiredCorrections`, `isResolved`
- **`EvaluationRubric`**: `id`, `departmentId`, `title`, `maxScore`, `academicYearId`, `isActive`
- **`RubricCriterion`**: `id`, `rubricId`, `criterionName`, `maxMarks`, `weightPercentage`, `description`
- **`Evaluation`**: `id`, `projectId`, `evaluatorId`, `status` (DRAFT, SUBMITTED, FINALIZED), `totalScore`, `comments`, `createdAt`
- **`EvaluationScore`**: `id`, `evaluationId`, `criterionId`, `scoreAwarded`, `notes`
- **`Result`**: `id`, `projectId`, `finalGrade`, `totalMarks`, `moderatedMarks`, `isPublished`, `publishedAt`, `publishedById`

### 2.5 Governance & Communication
- **`Notification`**: `id`, `userId`, `title`, `message`, `type`, `isRead`, `createdAt`
- **`Announcement`**: `id`, `departmentId`, `title`, `content`, `authorId`, `createdAt`
- **`AuditLog`**: `id`, `departmentId`, `userId`, `action`, `resource`, `resourceId`, `detailsJson`, `ipAddress`, `createdAt`
