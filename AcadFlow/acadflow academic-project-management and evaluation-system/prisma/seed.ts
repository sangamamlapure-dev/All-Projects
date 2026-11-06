import { PrismaClient, Role, UserStatus, TeamRole, ProjectStatus, ProposalStatus, MilestoneStatus, TaskStatus, Priority, ReviewStage, EvaluationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function main() {
  console.log('[AcadFlow] Starting seed execution...');

  // Hash common test password: Password123!
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Department
  const dept = await prisma.department.upsert({
    where: { code: 'CSE' },
    update: {},
    create: {
      code: 'CSE',
      name: 'Computer Science and Engineering',
      description: 'Department of Computer Science & Engineering - Engineering College',
    },
  });
  console.log(`[Seed] Department: ${dept.name} (${dept.code})`);

  // 2. Seed Academic Year & Semester
  const academicYear = await prisma.academicYear.upsert({
    where: {
      departmentId_yearName: {
        departmentId: dept.id,
        yearName: '2026-2027',
      },
    },
    update: {},
    create: {
      departmentId: dept.id,
      yearName: '2026-2027',
      isCurrent: true,
      startDate: new Date('2026-07-01T00:00:00.000Z'),
      endDate: new Date('2027-06-30T23:59:59.000Z'),
    },
  });

  await prisma.semester.createMany({
    data: [
      {
        academicYearId: academicYear.id,
        termNumber: 7,
        isActive: false,
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2026-11-30T23:59:59.000Z'),
      },
      {
        academicYearId: academicYear.id,
        termNumber: 8,
        isActive: true,
        startDate: new Date('2026-12-01T00:00:00.000Z'),
        endDate: new Date('2027-05-30T23:59:59.000Z'),
      },
    ],
    skipDuplicates: true,
  });

  // 3. Seed Users for ALL 4 Roles
  // Role 1: HOD (Department Administrator)
  const hodUser = await prisma.user.upsert({
    where: { email: 'hod.cse@college.edu' },
    update: {},
    create: {
      email: 'hod.cse@college.edu',
      passwordHash,
      name: 'Dr. Ramesh Kulkarni',
      role: Role.HOD,
      status: UserStatus.ACTIVE,
      departmentId: dept.id,
    },
  });

  await prisma.facultyProfile.upsert({
    where: { userId: hodUser.id },
    update: {},
    create: {
      userId: hodUser.id,
      designation: 'Professor & Head of Department',
      specialization: 'Distributed Systems & Software Engineering',
      maxMenteeQuota: 2,
    },
  });
  console.log(`[Seed] 1/4 Role HOD: ${hodUser.name} (${hodUser.email})`);

  // Role 2: Project Mentors
  const mentorSharma = await prisma.user.upsert({
    where: { email: 'mentor.sharma@college.edu' },
    update: {},
    create: {
      email: 'mentor.sharma@college.edu',
      passwordHash,
      name: 'Prof. Sunita Sharma',
      role: Role.PROJECT_MENTOR,
      status: UserStatus.ACTIVE,
      departmentId: dept.id,
    },
  });

  await prisma.facultyProfile.upsert({
    where: { userId: mentorSharma.id },
    update: {},
    create: {
      userId: mentorSharma.id,
      designation: 'Associate Professor',
      specialization: 'Internet of Things & Edge AI',
      maxMenteeQuota: 5,
    },
  });

  const mentorPatel = await prisma.user.upsert({
    where: { email: 'mentor.patel@college.edu' },
    update: {},
    create: {
      email: 'mentor.patel@college.edu',
      passwordHash,
      name: 'Prof. Vikram Patel',
      role: Role.PROJECT_MENTOR,
      status: UserStatus.ACTIVE,
      departmentId: dept.id,
    },
  });

  await prisma.facultyProfile.upsert({
    where: { userId: mentorPatel.id },
    update: {},
    create: {
      userId: mentorPatel.id,
      designation: 'Assistant Professor',
      specialization: 'Cloud Architecture & Cyber-Physical Systems',
      maxMenteeQuota: 5,
    },
  });
  console.log(`[Seed] 2/4 Role Project Mentors: Prof. Sunita Sharma & Prof. Vikram Patel`);

  // Role 3: Students
  const studentAarav = await prisma.user.upsert({
    where: { email: 'student.aarav@college.edu' },
    update: {},
    create: {
      email: 'student.aarav@college.edu',
      passwordHash,
      name: 'Aarav Deshmukh',
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      departmentId: dept.id,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentAarav.id },
    update: {},
    create: {
      userId: studentAarav.id,
      enrollmentNumber: 'ENROLL-2023-CSE-001',
      batch: '2023-2027',
      cgpa: 8.92,
      skills: 'TypeScript, Go, MQTT, React',
      gitHubUrl: 'https://github.com/aarav-deshmukh',
    },
  });

  const studentDiya = await prisma.user.upsert({
    where: { email: 'student.diya@college.edu' },
    update: {},
    create: {
      email: 'student.diya@college.edu',
      passwordHash,
      name: 'Diya Joshi',
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      departmentId: dept.id,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentDiya.id },
    update: {},
    create: {
      userId: studentDiya.id,
      enrollmentNumber: 'ENROLL-2023-CSE-002',
      batch: '2023-2027',
      cgpa: 9.15,
      skills: 'Python, PyTorch, Edge Computing',
      gitHubUrl: 'https://github.com/diya-joshi',
    },
  });

  const studentRohan = await prisma.user.upsert({
    where: { email: 'student.rohan@college.edu' },
    update: {},
    create: {
      email: 'student.rohan@college.edu',
      passwordHash,
      name: 'Rohan Verma',
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      departmentId: dept.id,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentRohan.id },
    update: {},
    create: {
      userId: studentRohan.id,
      enrollmentNumber: 'ENROLL-2023-CSE-003',
      batch: '2023-2027',
      cgpa: 8.45,
      skills: 'Docker, PostgreSQL, Node.js',
      gitHubUrl: 'https://github.com/rohan-verma',
    },
  });
  console.log(`[Seed] 3/4 Role Students: Aarav, Diya, Rohan`);

  // Role 4: External Evaluator
  const evaluatorGupta = await prisma.user.upsert({
    where: { email: 'evaluator.drgupta@external.ac.in' },
    update: {},
    create: {
      email: 'evaluator.drgupta@external.ac.in',
      passwordHash,
      name: 'Dr. Arvind Gupta',
      role: Role.EXTERNAL_EVALUATOR,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.externalEvaluatorProfile.upsert({
    where: { userId: evaluatorGupta.id },
    update: {},
    create: {
      userId: evaluatorGupta.id,
      institution: 'National Institute of Technology',
      qualification: 'Ph.D. in Computer Science',
      designation: 'Senior Principal Evaluator',
      conflictDeclared: false,
    },
  });
  console.log(`[Seed] 4/4 Role External Evaluator: Dr. Arvind Gupta (${evaluatorGupta.email})`);

  // 4. Seed Team & Team Memberships
  let teamAlpha = await prisma.team.findFirst({
    where: { name: 'Team Alpha - CSE Final Year' },
  });

  if (!teamAlpha) {
    teamAlpha = await prisma.team.create({
      data: {
        name: 'Team Alpha - CSE Final Year',
        departmentId: dept.id,
        academicYearId: academicYear.id,
        createdById: studentAarav.id,
      },
    });

    await prisma.teamMembership.createMany({
      data: [
        { teamId: teamAlpha.id, studentId: studentAarav.id, role: TeamRole.LEADER },
        { teamId: teamAlpha.id, studentId: studentDiya.id, role: TeamRole.MEMBER },
        { teamId: teamAlpha.id, studentId: studentRohan.id, role: TeamRole.MEMBER },
      ],
    });
  }

  // 5. Seed Project & Proposal
  let projectAlpha = await prisma.project.findFirst({
    where: { teamId: teamAlpha.id },
  });

  if (!projectAlpha) {
    projectAlpha = await prisma.project.create({
      data: {
        teamId: teamAlpha.id,
        departmentId: dept.id,
        title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
        description: 'Real-time telemetry ingestion, anomaly detection, and predictive maintenance for edge device fleets.',
        status: ProjectStatus.IN_PROGRESS,
        repositoryUrl: 'https://github.com/acadflow-projects/iot-fleet-telemetry',
      },
    });

    const proposal = await prisma.projectProposal.create({
      data: {
        projectId: projectAlpha.id,
        title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
        abstract: 'This project addresses scalable ingestion of telemetry from connected vehicle and industrial sensor fleets using MQTT brokers, edge stream processing, and time-series clustering for automated failure diagnosis.',
        objectives: '1. Ingest 10,000 msgs/sec at sub-50ms latency.\n2. Execute edge anomaly detection with <2% false positives.\n3. Provide responsive operator dashboard.',
        techStack: 'Node.js, Go, React, TimescaleDB, Docker, MQTT',
        status: ProposalStatus.APPROVED,
        submissionDate: new Date('2026-08-15T10:00:00.000Z'),
        approvedAt: new Date('2026-08-20T14:30:00.000Z'),
      },
    });

    await prisma.proposalRevision.create({
      data: {
        proposalId: proposal.id,
        versionNumber: 1,
        changeSummary: 'Initial proposal approved without revisions by HOD.',
        feedbackNotes: 'Comprehensive problem definition and verified feasibility.',
      },
    });

    // Assign Mentor
    await prisma.mentorAssignment.create({
      data: {
        projectId: projectAlpha.id,
        mentorId: mentorSharma.id,
        isPrimary: true,
      },
    });

    // Seed Milestones & Tasks
    const milestone1 = await prisma.milestone.create({
      data: {
        projectId: projectAlpha.id,
        title: 'Milestone 1: Architectural Specification & Broker Prototype',
        description: 'Complete high-level architecture, SRS document, and MQTT broker test bench.',
        dueDate: new Date('2026-09-30T17:00:00.000Z'),
        status: MilestoneStatus.COMPLETED,
      },
    });

    await prisma.task.createMany({
      data: [
        {
          milestoneId: milestone1.id,
          assignedToId: studentAarav.id,
          title: 'Design Message Schema and Protocols',
          priority: Priority.HIGH,
          status: TaskStatus.COMPLETED,
        },
        {
          milestoneId: milestone1.id,
          assignedToId: studentDiya.id,
          title: 'Implement Edge Anomaly Clustering',
          priority: Priority.MEDIUM,
          status: TaskStatus.COMPLETED,
        },
      ],
    });

    const milestone2 = await prisma.milestone.create({
      data: {
        projectId: projectAlpha.id,
        title: 'Milestone 2: Pipeline Integration & Benchmarking',
        description: 'Connect sensor simulator to ingestion pipeline and run throughput load tests.',
        dueDate: new Date('2026-11-15T17:00:00.000Z'),
        status: MilestoneStatus.IN_PROGRESS,
      },
    });

    await prisma.task.create({
      data: {
        milestoneId: milestone2.id,
        assignedToId: studentRohan.id,
        title: 'Conduct Load Testing up to 10k RPS',
        priority: Priority.HIGH,
        status: TaskStatus.IN_PROGRESS,
      },
    });
  }

  // 6. Seed Evaluation Rubric
  let rubric = await prisma.evaluationRubric.findFirst({
    where: { departmentId: dept.id, stage: ReviewStage.FINAL },
  });

  if (!rubric) {
    rubric = await prisma.evaluationRubric.create({
      data: {
        departmentId: dept.id,
        academicYearId: academicYear.id,
        title: 'B.Tech Capstone Project Final Evaluation Rubric',
        stage: ReviewStage.FINAL,
        maxScore: 100.0,
        isActive: true,
      },
    });

    await prisma.rubricCriterion.createMany({
      data: [
        {
          rubricId: rubric.id,
          criterionName: 'Problem Formulation & Literature Review',
          description: 'Clarity of research gap, societal relevance, and objective formulation.',
          maxMarks: 20.0,
          weightPercentage: 20.0,
        },
        {
          rubricId: rubric.id,
          criterionName: 'System Architecture & Engineering Design',
          description: 'Robustness, modularity, security, and scalability of technical design.',
          maxMarks: 30.0,
          weightPercentage: 30.0,
        },
        {
          rubricId: rubric.id,
          criterionName: 'Implementation, Validation & Testing',
          description: 'Completeness of implementation, test coverage, and benchmark results.',
          maxMarks: 30.0,
          weightPercentage: 30.0,
        },
        {
          rubricId: rubric.id,
          criterionName: 'Technical Presentation & Defense',
          description: 'Clarity of demonstration, viva-voce responses, and technical command.',
          maxMarks: 20.0,
          weightPercentage: 20.0,
        },
      ],
    });
  }

  // 7. Seed System Settings & Audit Log
  await prisma.systemSetting.upsert({
    where: { key: 'SUBMISSION_WINDOW_STATUS' },
    update: {},
    create: {
      key: 'SUBMISSION_WINDOW_STATUS',
      value: 'OPEN',
      category: 'ACADEMIC',
      description: 'Controls whether student proposal submissions and revisions are actively open.',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'MAX_STUDENTS_PER_TEAM' },
    update: {},
    create: {
      key: 'MAX_STUDENTS_PER_TEAM',
      value: '4',
      category: 'ACADEMIC',
      description: 'Maximum allowable student team size.',
    },
  });

  await prisma.auditLog.create({
    data: {
      departmentId: dept.id,
      userId: hodUser.id,
      action: 'SYSTEM_BOOTSTRAP_SEED',
      resource: 'Department',
      resourceId: dept.id,
      detailsJson: JSON.stringify({ message: 'Initial seed data populated with 4 roles and demo project.' }),
      ipAddress: '127.0.0.1',
    },
  });

  console.log('[AcadFlow] Seed execution completed successfully with exact 4-role model.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  main()
    .catch((e) => {
      console.error('[Seed Error]:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
