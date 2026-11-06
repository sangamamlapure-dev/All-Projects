import { Role, ProjectStatus, ProposalStatus, MilestoneStatus, TaskStatus, Priority, ReviewStage, EvaluationStatus } from '@prisma/client';
import { prisma, isDatabaseConnected } from '../db';
import { SessionUserData } from '../types/auth';


export class DashboardService {
  /**
   * HOD Department Admin Dashboard Data
   */
  static async getHodDashboard(user: SessionUserData) {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can access Department Admin Panel.');
    }

    const deptId = user.departmentId || 'dept-cse-01';

    // Mock/seed fallback data if DB is offline
    const fallbackData = {
      department: {
        id: deptId,
        code: 'CSE',
        name: 'Computer Science and Engineering',
      },
      metrics: {
        activeStudents: 48,
        facultyMentors: 8,
        activeProjects: 14,
        pendingProposals: 2,
        upcomingReviews: 5,
        publishedResults: 0,
      },
      proposalsPending: [
        {
          id: 'prop-01',
          title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
          teamName: 'Team Alpha',
          leaderName: 'Aarav Deshmukh',
          abstract: 'Scalable IoT telemetry ingestion with edge anomaly clustering and predictive maintenance.',
          techStack: 'Node.js, Go, React, TimescaleDB, MQTT',
          status: ProposalStatus.SUBMITTED,
          submittedAt: '2026-09-10T10:00:00Z',
        },
        {
          id: 'prop-02',
          title: 'Autonomous Mobile Robot Path Planning in Dynamic Environments',
          teamName: 'Team Beta',
          leaderName: 'Sneha Patel',
          abstract: 'SLAM algorithm optimization using deep reinforcement learning for indoor mobile robots.',
          techStack: 'ROS 2, Python, C++, PyTorch, Gazebo',
          status: ProposalStatus.SUBMITTED,
          submittedAt: '2026-09-12T14:30:00Z',
        },
      ],
      mentorWorkloads: [
        {
          id: 'user-mentor-01',
          name: 'Prof. Sunita Sharma',
          email: 'mentor.sharma@college.edu',
          specialization: 'Internet of Things & Edge AI',
          assignedProjectsCount: 3,
          maxQuota: 5,
          utilizationPercentage: 60,
        },
        {
          id: 'user-mentor-02',
          name: 'Prof. Vikram Patel',
          email: 'mentor.patel@college.edu',
          specialization: 'Cloud Architecture & Distributed Systems',
          assignedProjectsCount: 4,
          maxQuota: 5,
          utilizationPercentage: 80,
        },
        {
          id: 'user-mentor-03',
          name: 'Dr. Anita Desai',
          email: 'mentor.desai@college.edu',
          specialization: 'Computer Vision & Robotics',
          assignedProjectsCount: 2,
          maxQuota: 5,
          utilizationPercentage: 40,
        },
      ],
      projects: [
        {
          id: 'proj-01',
          title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
          teamName: 'Team Alpha',
          mentorName: 'Prof. Sunita Sharma',
          status: ProjectStatus.IN_PROGRESS,
          milestonesTotal: 3,
          milestonesCompleted: 1,
          progressPercentage: 33,
        },
        {
          id: 'proj-02',
          title: 'Decentralized Academic Credential Verification System',
          teamName: 'Team Gamma',
          mentorName: 'Prof. Vikram Patel',
          status: ProjectStatus.IN_PROGRESS,
          milestonesTotal: 4,
          milestonesCompleted: 2,
          progressPercentage: 50,
        },
      ],
      recentAuditLogs: [
        {
          id: 'audit-01',
          action: 'PROPOSAL_SUBMIT',
          resource: 'ProjectProposal',
          actor: 'student.aarav@college.edu',
          timestamp: '2026-09-10T10:00:00Z',
        },
        {
          id: 'audit-02',
          action: 'MENTOR_ALLOCATE',
          resource: 'MentorAssignment',
          actor: 'Dr. Ramesh Kulkarni (HOD)',
          timestamp: '2026-09-08T15:20:00Z',
        },
      ],
    };

    if (await isDatabaseConnected()) {
      try {
        const dept = await prisma.department.findUnique({
          where: { id: deptId },
          include: {
            users: true,
            projects: {
              include: { team: true, proposals: true, mentorAssignments: { include: { mentor: true } } },
            },
          },
        });

        if (dept) {
          return {
            department: { id: dept.id, code: dept.code, name: dept.name },
            metrics: {
              activeStudents: dept.users.filter((u) => u.role === Role.STUDENT).length,
              facultyMentors: dept.users.filter((u) => u.role === Role.PROJECT_MENTOR).length,
              activeProjects: dept.projects.length,
              pendingProposals: fallbackData.proposalsPending.length,
              upcomingReviews: 5,
              publishedResults: 0,
            },
            proposalsPending: fallbackData.proposalsPending,
            mentorWorkloads: fallbackData.mentorWorkloads,
            projects: fallbackData.projects,
            recentAuditLogs: fallbackData.recentAuditLogs,
          };
        }
      } catch {
        // Return fallback
      }
    }

    return fallbackData;
  }

  /**
   * Student Dashboard Data
   */
  static async getStudentDashboard(user: SessionUserData) {
    if (user.role !== Role.STUDENT) {
      throw new Error('Forbidden: Only Students can access the Student Portal.');
    }

    return {
      student: {
        id: user.id,
        name: user.name,
        email: user.email,
        enrollmentNumber: 'ENROLL-2023-CSE-001',
        role: 'Team Leader',
      },
      team: {
        id: 'team-alpha-01',
        name: 'Team Alpha - CSE Final Year',
        members: [
          { name: 'Aarav Deshmukh', email: 'student.aarav@college.edu', role: 'LEADER' },
          { name: 'Diya Joshi', email: 'student.diya@college.edu', role: 'MEMBER' },
          { name: 'Rohan Verma', email: 'student.rohan@college.edu', role: 'MEMBER' },
        ],
      },
      project: {
        id: 'proj-01',
        title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
        description: 'Scalable IoT telemetry ingestion with edge anomaly clustering and predictive maintenance.',
        status: ProjectStatus.IN_PROGRESS,
        repositoryUrl: 'https://github.com/acadflow-projects/iot-fleet-telemetry',
        assignedMentor: {
          name: 'Prof. Sunita Sharma',
          email: 'mentor.sharma@college.edu',
          designation: 'Associate Professor',
        },
      },
      proposal: {
        id: 'prop-01',
        status: ProposalStatus.APPROVED,
        title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
        submittedAt: '2026-08-15T10:00:00Z',
        approvedAt: '2026-08-20T14:30:00Z',
        feedback: 'Approved by HOD. Excellent problem formulation and clear scope.',
      },
      milestones: [
        {
          id: 'ms-01',
          title: 'Milestone 1: Architectural Specification & Broker Prototype',
          dueDate: '2026-09-30',
          status: MilestoneStatus.COMPLETED,
          progress: 100,
        },
        {
          id: 'ms-02',
          title: 'Milestone 2: Pipeline Integration & Benchmarking',
          dueDate: '2026-11-15',
          status: MilestoneStatus.IN_PROGRESS,
          progress: 60,
        },
        {
          id: 'ms-03',
          title: 'Milestone 3: Evaluation Defense & Final Dissertation Report',
          dueDate: '2026-12-10',
          status: MilestoneStatus.PENDING,
          progress: 0,
        },
      ],
      tasks: [
        {
          id: 'task-01',
          title: 'Design Message Schema and Protocols',
          assignee: 'Aarav Deshmukh',
          priority: Priority.HIGH,
          status: TaskStatus.COMPLETED,
        },
        {
          id: 'task-02',
          title: 'Implement Edge Anomaly Clustering Algorithm',
          assignee: 'Diya Joshi',
          priority: Priority.MEDIUM,
          status: TaskStatus.COMPLETED,
        },
        {
          id: 'task-03',
          title: 'Conduct Load Testing up to 10k RPS',
          assignee: 'Rohan Verma',
          priority: Priority.HIGH,
          status: TaskStatus.IN_PROGRESS,
        },
        {
          id: 'task-04',
          title: 'Draft Midterm Progress Report Document',
          assignee: 'Aarav Deshmukh',
          priority: Priority.MEDIUM,
          status: TaskStatus.TODO,
        },
      ],
      recentFeedback: [
        {
          date: '2026-10-15',
          mentor: 'Prof. Sunita Sharma',
          comments: 'Throughput benchmarks look promising. Ensure p99 latency numbers are recorded in report.',
          status: 'Resolved',
        },
      ],
      documents: [
        {
          id: 'doc-01',
          title: 'SRS and Architectural Design Document',
          category: 'REPORT',
          version: 'v1.2',
          uploadedAt: '2026-09-28',
          sizeMb: 2.4,
        },
        {
          id: 'doc-02',
          title: 'Milestone 1 Presentation Slides',
          category: 'PRESENTATION',
          version: 'v1.0',
          uploadedAt: '2026-09-29',
          sizeMb: 5.1,
        },
      ],
      evaluationResult: null, // Hidden until published by HOD
    };
  }

  /**
   * Project Mentor Dashboard Data
   */
  static async getMentorDashboard(user: SessionUserData) {
    if (user.role !== Role.PROJECT_MENTOR) {
      throw new Error('Forbidden: Only Faculty Project Mentors can access the Mentor Dashboard.');
    }

    return {
      mentor: {
        id: user.id,
        name: user.name,
        email: user.email,
        activeProjectsCount: 3,
        quota: 5,
      },
      assignedProjects: [
        {
          id: 'proj-01',
          title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
          teamName: 'Team Alpha',
          leaderName: 'Aarav Deshmukh',
          membersCount: 3,
          status: ProjectStatus.IN_PROGRESS,
          overallProgress: 60,
          currentMilestone: 'Milestone 2: Pipeline Integration & Benchmarking',
          overdueTasksCount: 0,
          nextReviewDate: '2026-11-18',
        },
        {
          id: 'proj-04',
          title: 'Smart Grid Energy Consumption Forecasting',
          teamName: 'Team Delta',
          leaderName: 'Pooja Nair',
          membersCount: 4,
          status: ProjectStatus.IN_PROGRESS,
          overallProgress: 45,
          currentMilestone: 'Milestone 2: Time-series Model Training',
          overdueTasksCount: 1,
          nextReviewDate: '2026-11-20',
        },
      ],
      pendingReviews: [
        {
          id: 'rev-01',
          projectId: 'proj-01',
          projectTitle: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
          teamName: 'Team Alpha',
          stage: ReviewStage.MIDTERM,
          submissionDate: '2026-10-25',
          documentTitle: 'Midterm Progress Report v1.0.pdf',
        },
      ],
      upcomingSchedules: [
        {
          id: 'sched-01',
          projectId: 'proj-01',
          teamName: 'Team Alpha',
          stage: 'Midterm Progress Review',
          date: '2026-11-18 at 10:30 AM',
          venue: 'Lab 402 / Online',
        },
        {
          id: 'sched-02',
          projectId: 'proj-04',
          teamName: 'Team Delta',
          stage: 'Sprint Review 2',
          date: '2026-11-20 at 02:00 PM',
          venue: 'Seminar Hall B',
        },
      ],
      correctionRequests: [
        {
          id: 'corr-01',
          teamName: 'Team Alpha',
          requiredCorrection: 'Include comparative latency benchmarks against standard MQTT baseline.',
          status: 'PENDING_VERIFICATION',
        },
      ],
    };
  }

  /**
   * External Evaluator Dashboard Data
   */
  static async getEvaluatorDashboard(user: SessionUserData) {
    if (user.role !== Role.EXTERNAL_EVALUATOR) {
      throw new Error('Forbidden: Only External Evaluators can access the Evaluator Portal.');
    }

    return {
      evaluator: {
        id: user.id,
        name: user.name,
        email: user.email,
        institution: 'National Institute of Technology',
        designation: 'Senior Principal Evaluator',
        conflictDeclared: false,
      },
      assignedEvaluations: [
        {
          id: 'eval-01',
          projectId: 'proj-01',
          projectTitle: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
          teamName: 'Team Alpha',
          department: 'Computer Science and Engineering',
          defenseDate: '2026-12-15 at 11:00 AM',
          venue: 'Board Room 101 / Hybrid',
          status: EvaluationStatus.DRAFT,
          totalScore: null,
          maxScore: 100,
          rubricTitle: 'B.Tech Capstone Project Final Evaluation Rubric',
          documentsAvailable: [
            { title: 'Final Dissertation Report.pdf', size: '4.8 MB' },
            { title: 'Defense Presentation Slides.pptx', size: '12.2 MB' },
            { title: 'GitHub Repository Code Archive.zip', size: '18.5 MB' },
          ],
          rubricCriteria: [
            {
              id: 'crit-01',
              name: 'Problem Formulation & Literature Review',
              maxMarks: 20,
              weight: '20%',
              scoreAwarded: 18,
              notes: 'Clear gap identified, good comparative literature study.',
            },
            {
              id: 'crit-02',
              name: 'System Architecture & Engineering Design',
              maxMarks: 30,
              weight: '30%',
              scoreAwarded: 27,
              notes: 'Robust distributed architecture with fault tolerance.',
            },
            {
              id: 'crit-03',
              name: 'Implementation, Validation & Testing',
              maxMarks: 30,
              weight: '30%',
              scoreAwarded: 26,
              notes: 'Verified load testing up to 10k messages per second.',
            },
            {
              id: 'crit-04',
              name: 'Technical Presentation & Defense',
              maxMarks: 20,
              weight: '20%',
              scoreAwarded: 17,
              notes: 'Answered edge clustering queries confidently.',
            },
          ],
        },
      ],
    };
  }

  /**
   * Action: HOD Proposal Decision
   */
  static async handleProposalDecision(
    user: SessionUserData,
    proposalId: string,
    decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED',
    feedback?: string
  ) {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can approve or reject project proposals.');
    }

    return {
      proposalId,
      status: decision,
      feedback: feedback || 'Decision recorded by HOD.',
      decidedBy: user.name,
      decidedAt: new Date().toISOString(),
    };
  }

  /**
   * Action: Toggle Student Task Status
   */
  static async updateTaskStatus(user: SessionUserData, taskId: string, status: TaskStatus) {
    return {
      taskId,
      status,
      updatedBy: user.name,
      updatedAt: new Date().toISOString(),
    };
  }
}
