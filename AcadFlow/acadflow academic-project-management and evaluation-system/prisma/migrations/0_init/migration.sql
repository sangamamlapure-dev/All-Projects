-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('HOD', 'STUDENT', 'PROJECT_MENTOR', 'EXTERNAL_EVALUATOR') NOT NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `departmentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_departmentId_idx`(`departmentId`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` VARCHAR(191) NOT NULL,
    `role` ENUM('HOD', 'STUDENT', 'PROJECT_MENTOR', 'EXTERNAL_EVALUATOR') NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_role_resource_action_key`(`role`, `resource`, `action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_sessions_token_key`(`token`),
    INDEX `user_sessions_userId_idx`(`userId`),
    INDEX `user_sessions_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `invitations` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `role` ENUM('HOD', 'STUDENT', 'PROJECT_MENTOR', 'EXTERNAL_EVALUATOR') NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `invitedById` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `invitations_token_key`(`token`),
    INDEX `invitations_email_idx`(`email`),
    INDEX `invitations_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `academic_years` (
    `id` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `yearName` VARCHAR(191) NOT NULL,
    `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `academic_years_departmentId_idx`(`departmentId`),
    UNIQUE INDEX `academic_years_departmentId_yearName_key`(`departmentId`, `yearName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semesters` (
    `id` VARCHAR(191) NOT NULL,
    `academicYearId` VARCHAR(191) NOT NULL,
    `termNumber` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `semesters_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_settings` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_settings_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `enrollmentNumber` VARCHAR(191) NOT NULL,
    `batch` VARCHAR(191) NOT NULL,
    `cgpa` DECIMAL(4, 2) NULL,
    `skills` TEXT NULL,
    `gitHubUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_profiles_userId_key`(`userId`),
    UNIQUE INDEX `student_profiles_enrollmentNumber_key`(`enrollmentNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faculty_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `specialization` VARCHAR(191) NOT NULL,
    `maxMenteeQuota` INTEGER NOT NULL DEFAULT 5,
    `officeHours` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `faculty_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `external_evaluator_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(191) NOT NULL,
    `qualification` VARCHAR(191) NOT NULL,
    `designation` VARCHAR(191) NOT NULL,
    `conflictDeclared` BOOLEAN NOT NULL DEFAULT false,
    `conflictNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `external_evaluator_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teams` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `academicYearId` VARCHAR(191) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `teams_departmentId_idx`(`departmentId`),
    INDEX `teams_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_memberships` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `role` ENUM('LEADER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `team_memberships_studentId_idx`(`studentId`),
    UNIQUE INDEX `team_memberships_teamId_studentId_key`(`teamId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `team_invitations` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `team_invitations_teamId_idx`(`teamId`),
    INDEX `team_invitations_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('PROPOSED', 'APPROVED', 'IN_PROGRESS', 'REVIEWED', 'EVALUATED', 'COMPLETED', 'ARCHIVED') NOT NULL DEFAULT 'PROPOSED',
    `repositoryUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `projects_teamId_key`(`teamId`),
    INDEX `projects_departmentId_idx`(`departmentId`),
    INDEX `projects_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_proposals` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `abstract` TEXT NOT NULL,
    `objectives` TEXT NOT NULL,
    `techStack` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `submissionDate` DATETIME(3) NULL,
    `approvedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `project_proposals_projectId_idx`(`projectId`),
    INDEX `project_proposals_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proposal_revisions` (
    `id` VARCHAR(191) NOT NULL,
    `proposalId` VARCHAR(191) NOT NULL,
    `versionNumber` INTEGER NOT NULL,
    `changeSummary` TEXT NOT NULL,
    `feedbackNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `proposal_revisions_proposalId_idx`(`proposalId`),
    UNIQUE INDEX `proposal_revisions_proposalId_versionNumber_key`(`proposalId`, `versionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mentor_assignments` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT true,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mentor_assignments_mentorId_idx`(`mentorId`),
    UNIQUE INDEX `mentor_assignments_projectId_mentorId_key`(`projectId`, `mentorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `milestones` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `milestones_projectId_idx`(`projectId`),
    INDEX `milestones_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tasks` (
    `id` VARCHAR(191) NOT NULL,
    `milestoneId` VARCHAR(191) NOT NULL,
    `assignedToId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `priority` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    `status` ENUM('TODO', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'TODO',
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `tasks_milestoneId_idx`(`milestoneId`),
    INDEX `tasks_assignedToId_idx`(`assignedToId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `task_comments` (
    `id` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `task_comments_taskId_idx`(`taskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progress_updates` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `blockers` TEXT NULL,
    `hoursLogged` DECIMAL(5, 1) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `progress_updates_projectId_idx`(`projectId`),
    INDEX `progress_updates_studentId_idx`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `category` ENUM('PROPOSAL', 'REPORT', 'PRESENTATION', 'EVIDENCE', 'SOURCE_CODE', 'MINUTES', 'OTHER') NOT NULL DEFAULT 'REPORT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `documents_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_versions` (
    `id` VARCHAR(191) NOT NULL,
    `documentId` VARCHAR(191) NOT NULL,
    `versionNumber` INTEGER NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSize` INTEGER NOT NULL,
    `mimeType` VARCHAR(191) NOT NULL,
    `uploadedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `document_versions_storageKey_key`(`storageKey`),
    INDEX `document_versions_documentId_idx`(`documentId`),
    UNIQUE INDEX `document_versions_documentId_versionNumber_key`(`documentId`, `versionNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submissions` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `documentVersionId` VARCHAR(191) NOT NULL,
    `stage` ENUM('INCEPTION', 'MIDTERM', 'FINAL', 'CORRECTION') NOT NULL,
    `submittedById` VARCHAR(191) NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `remarks` TEXT NULL,

    INDEX `submissions_projectId_idx`(`projectId`),
    INDEX `submissions_documentVersionId_idx`(`documentVersionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_schedules` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `stage` ENUM('INCEPTION', 'MIDTERM', 'FINAL', 'CORRECTION') NOT NULL,
    `scheduledDate` DATETIME(3) NOT NULL,
    `venue` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `review_schedules_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `stage` ENUM('INCEPTION', 'MIDTERM', 'FINAL', 'CORRECTION') NOT NULL,
    `conductedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NOT NULL,

    INDEX `reviews_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `review_attendances` (
    `id` VARCHAR(191) NOT NULL,
    `reviewScheduleId` VARCHAR(191) NOT NULL,
    `attendeeName` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `isPresent` BOOLEAN NOT NULL DEFAULT true,

    INDEX `review_attendances_reviewScheduleId_idx`(`reviewScheduleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedbacks` (
    `id` VARCHAR(191) NOT NULL,
    `reviewScheduleId` VARCHAR(191) NOT NULL,
    `mentorId` VARCHAR(191) NOT NULL,
    `comments` TEXT NOT NULL,
    `requiredCorrections` TEXT NULL,
    `isResolved` BOOLEAN NOT NULL DEFAULT false,
    `resolvedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `feedbacks_reviewScheduleId_idx`(`reviewScheduleId`),
    INDEX `feedbacks_mentorId_idx`(`mentorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_rubrics` (
    `id` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `academicYearId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `stage` ENUM('INCEPTION', 'MIDTERM', 'FINAL', 'CORRECTION') NOT NULL,
    `maxScore` DECIMAL(5, 2) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `evaluation_rubrics_departmentId_idx`(`departmentId`),
    INDEX `evaluation_rubrics_academicYearId_idx`(`academicYearId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rubric_criteria` (
    `id` VARCHAR(191) NOT NULL,
    `rubricId` VARCHAR(191) NOT NULL,
    `criterionName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `maxMarks` DECIMAL(5, 2) NOT NULL,
    `weightPercentage` DECIMAL(5, 2) NOT NULL,

    INDEX `rubric_criteria_rubricId_idx`(`rubricId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluations` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `rubricId` VARCHAR(191) NOT NULL,
    `evaluatorId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'FINALIZED') NOT NULL DEFAULT 'DRAFT',
    `totalScore` DECIMAL(5, 2) NULL,
    `comments` TEXT NULL,
    `conflictNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finalizedAt` DATETIME(3) NULL,

    INDEX `evaluations_projectId_idx`(`projectId`),
    INDEX `evaluations_evaluatorId_idx`(`evaluatorId`),
    UNIQUE INDEX `evaluations_projectId_evaluatorId_rubricId_key`(`projectId`, `evaluatorId`, `rubricId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evaluation_scores` (
    `id` VARCHAR(191) NOT NULL,
    `evaluationId` VARCHAR(191) NOT NULL,
    `criterionId` VARCHAR(191) NOT NULL,
    `scoreAwarded` DECIMAL(5, 2) NOT NULL,
    `notes` TEXT NULL,

    INDEX `evaluation_scores_evaluationId_idx`(`evaluationId`),
    UNIQUE INDEX `evaluation_scores_evaluationId_criterionId_key`(`evaluationId`, `criterionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `results` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `totalMarks` DECIMAL(5, 2) NOT NULL,
    `moderatedMarks` DECIMAL(5, 2) NULL,
    `finalGrade` VARCHAR(191) NOT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `publishedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `results_projectId_key`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_versions` (
    `id` VARCHAR(191) NOT NULL,
    `resultId` VARCHAR(191) NOT NULL,
    `versionNumber` INTEGER NOT NULL,
    `totalMarks` DECIMAL(5, 2) NOT NULL,
    `moderatedMarks` DECIMAL(5, 2) NULL,
    `finalGrade` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `modifiedById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `result_versions_resultId_idx`(`resultId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('INFO', 'DEADLINE', 'FEEDBACK', 'APPROVAL', 'ALERT') NOT NULL DEFAULT 'INFO',
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `linkUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_userId_idx`(`userId`),
    INDEX `notifications_isRead_idx`(`isRead`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcements` (
    `id` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `isPinned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `announcements_departmentId_idx`(`departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `calendar_events` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `isGlobal` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reminders` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `isResolved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reminders_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discussion_threads` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `discussion_threads_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `discussion_posts` (
    `id` VARCHAR(191) NOT NULL,
    `threadId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `discussion_posts_threadId_idx`(`threadId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project_comments` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `project_comments_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mentions` (
    `id` VARCHAR(191) NOT NULL,
    `entityType` VARCHAR(191) NOT NULL,
    `entityId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mentions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeting_notes` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `meetingDate` DATETIME(3) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `minutes` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `meeting_notes_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `action_items` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `meetingNoteId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `assigneeName` VARCHAR(191) NULL,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `dueDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `action_items_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NULL,
    `detailsJson` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_departmentId_idx`(`departmentId`),
    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `activity_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `activity_logs_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `saved_filters` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `viewKey` VARCHAR(191) NOT NULL,
    `filterJson` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `saved_filters_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `theme` VARCHAR(191) NOT NULL DEFAULT 'light',
    `emailAlerts` BOOLEAN NOT NULL DEFAULT true,
    `inAppAlerts` BOOLEAN NOT NULL DEFAULT true,
    `compactView` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_preferences_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dashboard_preferences` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `widgetsOrder` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dashboard_preferences_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `integration_configurations` (
    `id` VARCHAR(191) NOT NULL,
    `service` VARCHAR(191) NOT NULL,
    `configKey` VARCHAR(191) NOT NULL,
    `valueJson` TEXT NOT NULL,
    `isEnabled` BOOLEAN NOT NULL DEFAULT false,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `integration_configurations_service_key`(`service`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `export_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `exportType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'COMPLETED',
    `downloadUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `export_jobs_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backup_records` (
    `id` VARCHAR(191) NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `fileSizeBytes` BIGINT NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `checksum` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_request_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `feature` VARCHAR(191) NOT NULL,
    `promptTokens` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ai_request_logs_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_sessions` ADD CONSTRAINT `user_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_invitedById_fkey` FOREIGN KEY (`invitedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `academic_years` ADD CONSTRAINT `academic_years_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `semesters` ADD CONSTRAINT `semesters_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_profiles` ADD CONSTRAINT `student_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `faculty_profiles` ADD CONSTRAINT `faculty_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `external_evaluator_profiles` ADD CONSTRAINT `external_evaluator_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `teams` ADD CONSTRAINT `teams_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_memberships` ADD CONSTRAINT `team_memberships_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_memberships` ADD CONSTRAINT `team_memberships_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `team_invitations` ADD CONSTRAINT `team_invitations_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_proposals` ADD CONSTRAINT `project_proposals_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proposal_revisions` ADD CONSTRAINT `proposal_revisions_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `project_proposals`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mentor_assignments` ADD CONSTRAINT `mentor_assignments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mentor_assignments` ADD CONSTRAINT `mentor_assignments_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `milestones` ADD CONSTRAINT `milestones_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_milestoneId_fkey` FOREIGN KEY (`milestoneId`) REFERENCES `milestones`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tasks` ADD CONSTRAINT `tasks_assignedToId_fkey` FOREIGN KEY (`assignedToId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_comments` ADD CONSTRAINT `task_comments_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `tasks`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `task_comments` ADD CONSTRAINT `task_comments_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progress_updates` ADD CONSTRAINT `progress_updates_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progress_updates` ADD CONSTRAINT `progress_updates_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_versions` ADD CONSTRAINT `document_versions_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `documents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `document_versions` ADD CONSTRAINT `document_versions_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_documentVersionId_fkey` FOREIGN KEY (`documentVersionId`) REFERENCES `document_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `submissions` ADD CONSTRAINT `submissions_submittedById_fkey` FOREIGN KEY (`submittedById`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_schedules` ADD CONSTRAINT `review_schedules_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `review_attendances` ADD CONSTRAINT `review_attendances_reviewScheduleId_fkey` FOREIGN KEY (`reviewScheduleId`) REFERENCES `review_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_reviewScheduleId_fkey` FOREIGN KEY (`reviewScheduleId`) REFERENCES `review_schedules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_mentorId_fkey` FOREIGN KEY (`mentorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation_rubrics` ADD CONSTRAINT `evaluation_rubrics_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation_rubrics` ADD CONSTRAINT `evaluation_rubrics_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `academic_years`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rubric_criteria` ADD CONSTRAINT `rubric_criteria_rubricId_fkey` FOREIGN KEY (`rubricId`) REFERENCES `evaluation_rubrics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_rubricId_fkey` FOREIGN KEY (`rubricId`) REFERENCES `evaluation_rubrics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation_scores` ADD CONSTRAINT `evaluation_scores_evaluationId_fkey` FOREIGN KEY (`evaluationId`) REFERENCES `evaluations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evaluation_scores` ADD CONSTRAINT `evaluation_scores_criterionId_fkey` FOREIGN KEY (`criterionId`) REFERENCES `rubric_criteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `results` ADD CONSTRAINT `results_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_versions` ADD CONSTRAINT `result_versions_resultId_fkey` FOREIGN KEY (`resultId`) REFERENCES `results`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcements` ADD CONSTRAINT `announcements_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussion_threads` ADD CONSTRAINT `discussion_threads_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussion_posts` ADD CONSTRAINT `discussion_posts_threadId_fkey` FOREIGN KEY (`threadId`) REFERENCES `discussion_threads`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `discussion_posts` ADD CONSTRAINT `discussion_posts_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_comments` ADD CONSTRAINT `project_comments_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_comments` ADD CONSTRAINT `project_comments_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_notes` ADD CONSTRAINT `meeting_notes_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeting_notes` ADD CONSTRAINT `meeting_notes_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `action_items` ADD CONSTRAINT `action_items_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `action_items` ADD CONSTRAINT `action_items_meetingNoteId_fkey` FOREIGN KEY (`meetingNoteId`) REFERENCES `meeting_notes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dashboard_preferences` ADD CONSTRAINT `dashboard_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

