import { Role, ProposalStatus, ProjectStatus, MilestoneStatus, TaskStatus, Priority, ReviewStage, EvaluationStatus } from '@prisma/client';

export interface MemoryStoreData {
  users: any[];
  departments: any[];
  projects: any[];
  proposals: any[];
  teams: any[];
  mentorAssignments: any[];
  milestones: any[];
  tasks: any[];
  reviews: any[];
  evaluations: any[];
  results: any[];
  documents: any[];
  announcements: any[];
  calendarEvents: any[];
  reminders: any[];
  discussionThreads: any[];
  meetingNotes: any[];
  systemSettings: any[];
  auditLogs: any[];
}

export class MemoryStore {
  private static instance: MemoryStore;
  private data: MemoryStoreData;

  private constructor() {
    this.data = this.initializeDefaultData();
  }

  public static getInstance(): MemoryStore {
    if (!MemoryStore.instance) {
      MemoryStore.instance = new MemoryStore();
    }
    return MemoryStore.instance;
  }

  private initializeDefaultData(): MemoryStoreData {
    return {
      users: [
        { id: 'user-hod-01', email: 'hod.cse@college.edu', name: 'Dr. Ramesh Kulkarni', role: Role.HOD, departmentId: 'dept-cse-01', status: 'ACTIVE', createdAt: '2026-08-01T09:00:00Z' },
        { id: 'user-faculty-01', email: 'mentor.sharma@college.edu', name: 'Prof. Sunita Sharma', role: Role.PROJECT_MENTOR, departmentId: 'dept-cse-01', status: 'ACTIVE', specialization: 'IoT & Edge AI', maxCapacity: 5, createdAt: '2026-08-01T09:30:00Z' },
        { id: 'user-faculty-02', email: 'mentor.patel@college.edu', name: 'Prof. Vikram Patel', role: Role.PROJECT_MENTOR, departmentId: 'dept-cse-01', status: 'ACTIVE', specialization: 'Robotics & Control', maxCapacity: 5, createdAt: '2026-08-01T10:00:00Z' },
        { id: 'user-student-01', email: 'student.aarav@college.edu', name: 'Aarav Deshmukh', role: Role.STUDENT, departmentId: 'dept-cse-01', status: 'ACTIVE', enrollmentNo: 'ENROLL-2023-CSE-001', createdAt: '2026-08-15T11:00:00Z' },
        { id: 'user-student-02', email: 'student.diya@college.edu', name: 'Diya Joshi', role: Role.STUDENT, departmentId: 'dept-cse-01', status: 'ACTIVE', enrollmentNo: 'ENROLL-2023-CSE-002', createdAt: '2026-08-15T11:15:00Z' },
        { id: 'user-student-03', email: 'student.rohan@college.edu', name: 'Rohan Verma', role: Role.STUDENT, departmentId: 'dept-cse-01', status: 'ACTIVE', enrollmentNo: 'ENROLL-2023-CSE-003', createdAt: '2026-08-15T11:30:00Z' },
        { id: 'user-student-04', email: 'student.sneha@college.edu', name: 'Sneha Patel', role: Role.STUDENT, departmentId: 'dept-cse-01', status: 'ACTIVE', enrollmentNo: 'ENROLL-2023-CSE-004', createdAt: '2026-08-15T11:45:00Z' },
        { id: 'user-evaluator-01', email: 'evaluator.drgupta@external.ac.in', name: 'Dr. Arvind Gupta', role: Role.EXTERNAL_EVALUATOR, departmentId: null, status: 'ACTIVE', organization: 'National Institute of Tech', createdAt: '2026-08-20T14:00:00Z' },
      ],
      departments: [
        { id: 'dept-cse-01', code: 'CSE', name: 'Computer Science and Engineering', hodName: 'Dr. Ramesh Kulkarni', studentCount: 48, facultyCount: 8 },
        { id: 'dept-ece-02', code: 'ECE', name: 'Electronics and Communication Engineering', hodName: 'Dr. Meera Nambiar', studentCount: 42, facultyCount: 7 },
      ],
      teams: [
        { id: 'team-alpha-01', name: 'Team Alpha - CSE Final Year', departmentId: 'dept-cse-01', leaderId: 'user-student-01', members: ['Aarav Deshmukh', 'Diya Joshi', 'Rohan Verma'], createdAt: '2026-09-01T10:00:00Z' },
        { id: 'team-beta-02', name: 'Team Beta - Robotics Lab', departmentId: 'dept-cse-01', leaderId: 'user-student-04', members: ['Sneha Patel', 'Kunal Shah'], createdAt: '2026-09-02T11:30:00Z' },
      ],
      proposals: [
        {
          id: 'prop-01',
          projectId: 'proj-01',
          teamId: 'team-alpha-01',
          title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
          abstract: 'Scalable IoT telemetry ingestion with edge anomaly clustering and predictive maintenance.',
          techStack: 'Node.js, Go, React, TimescaleDB, MQTT',
          status: ProposalStatus.APPROVED,
          submittedAt: '2026-09-10T10:00:00Z',
          approvedAt: '2026-09-14T11:20:00Z',
        },
        {
          id: 'prop-02',
          projectId: 'proj-02',
          teamId: 'team-beta-02',
          title: 'Autonomous Mobile Robot Path Planning in Dynamic Environments',
          abstract: 'SLAM algorithm optimization using deep reinforcement learning for indoor mobile robots.',
          techStack: 'ROS 2, Python, C++, PyTorch, Gazebo',
          status: ProposalStatus.SUBMITTED,
          submittedAt: '2026-09-12T14:30:00Z',
        },
      ],
      projects: [
        {
          id: 'proj-01',
          title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
          teamId: 'team-alpha-01',
          departmentId: 'dept-cse-01',
          status: ProjectStatus.IN_PROGRESS,
          mentorName: 'Prof. Sunita Sharma',
          evaluatorName: 'Dr. Arvind Gupta',
          progressPct: 65,
          createdAt: '2026-09-14T12:00:00Z',
        },
        {
          id: 'proj-02',
          title: 'Autonomous Mobile Robot Path Planning in Dynamic Environments',
          teamId: 'team-beta-02',
          departmentId: 'dept-cse-01',
          status: ProjectStatus.PROPOSED,
          mentorName: 'Unassigned',
          evaluatorName: 'Unassigned',
          progressPct: 15,
          createdAt: '2026-09-12T14:30:00Z',
        },
      ],
      mentorAssignments: [
        { id: 'ma-01', projectId: 'proj-01', mentorId: 'user-faculty-01', isPrimary: true, assignedAt: '2026-09-15T09:00:00Z' },
      ],
      milestones: [
        { id: 'ms-01', projectId: 'proj-01', title: 'Phase 1: Architecture & Requirements Sign-off', dueDate: '2026-09-30', status: MilestoneStatus.COMPLETED },
        { id: 'ms-02', projectId: 'proj-01', title: 'Phase 2: Ingestion Pipeline & Broker Prototype', dueDate: '2026-10-31', status: MilestoneStatus.IN_PROGRESS },
        { id: 'ms-03', projectId: 'proj-01', title: 'Phase 3: Web Dashboard & Edge Analytics', dueDate: '2026-11-30', status: MilestoneStatus.PENDING },
        { id: 'ms-04', projectId: 'proj-01', title: 'Phase 4: Final Defense, Dissertation & Benchmarks', dueDate: '2026-12-20', status: MilestoneStatus.PENDING },
      ],
      tasks: [
        { id: 'task-01', projectId: 'proj-01', title: 'Docker containerization of telemetry broker', status: TaskStatus.COMPLETED, priority: Priority.HIGH, assignee: 'Aarav Deshmukh' },
        { id: 'task-02', projectId: 'proj-01', title: 'Benchmark MQTT broker throughput (10k msgs/sec)', status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, assignee: 'Diya Joshi' },
        { id: 'task-03', projectId: 'proj-01', title: 'Compile latex dissertation chapter 3', status: TaskStatus.TODO, priority: Priority.MEDIUM, assignee: 'Rohan Verma' },
      ],
      reviews: [
        { id: 'rev-01', projectId: 'proj-01', stage: ReviewStage.MIDTERM, scheduledDate: '2026-10-25T14:00:00Z', venue: 'Lab 402', status: 'COMPLETED', comments: 'Good architecture progress. Must include load test graphs.' },
        { id: 'rev-02', projectId: 'proj-01', stage: ReviewStage.FINAL, scheduledDate: '2026-12-15T10:00:00Z', venue: 'Seminar Hall B', status: 'SCHEDULED' },
      ],
      evaluations: [
        { id: 'eval-01', projectId: 'proj-01', evaluatorId: 'user-evaluator-01', status: EvaluationStatus.SUBMITTED, totalMarks: 88, remarks: 'Commendable implementation of scalable edge analytics.' },
      ],
      results: [
        { id: 'res-01', projectId: 'proj-01', departmentId: 'dept-cse-01', grade: 'A+', totalScore: 88.5, isPublished: false },
      ],
      documents: [
        { id: 'doc-01', projectId: 'proj-01', title: 'Project Charter & Technical Specification', version: 1, mimeType: 'application/pdf', sizeBytes: 1048576, uploadedAt: '2026-09-15T14:00:00Z' },
        { id: 'doc-02', projectId: 'proj-01', title: 'Midterm Progress Report & Architecture V2', version: 2, mimeType: 'application/pdf', sizeBytes: 2457600, uploadedAt: '2026-10-24T16:30:00Z' },
      ],
      announcements: [
        { id: 'ann-01', departmentId: 'dept-cse-01', title: 'Final Defense Dissertation Submission Deadline', content: 'All final year teams must upload bound thesis drafts by Dec 18, 2026.', isPinned: true, author: 'Dr. Ramesh Kulkarni (HOD)', createdAt: '2026-10-20T09:00:00Z' },
        { id: 'ann-02', departmentId: 'dept-cse-01', title: 'External Evaluator Rubric Guidelines Published', content: 'Rubrics have been updated with 30% weightage for IEEE compliance.', isPinned: false, author: 'Dr. Ramesh Kulkarni (HOD)', createdAt: '2026-10-22T11:00:00Z' },
      ],
      calendarEvents: [
        { id: 'cal-01', title: 'Midterm Project Review Window', eventDate: '2026-11-05', type: 'REVIEW', location: 'Labs 401-404' },
        { id: 'cal-02', title: 'Final Draft Dissertation Due', eventDate: '2026-12-10', type: 'DEADLINE', location: 'AcadFlow Portal' },
        { id: 'cal-03', title: 'External Viva Voce Defenses', eventDate: '2026-12-18', type: 'EVALUATION', location: 'Department Auditorium' },
      ],
      reminders: [
        { id: 'rem-01', userId: 'user-hod-01', title: 'Sign off external defense marksheet batch 1', dueDate: '2026-11-15', isCompleted: false },
        { id: 'rem-02', userId: 'user-student-01', title: 'Update latency benchmarks in chapter 4', dueDate: '2026-11-02', isCompleted: true },
      ],
      discussionThreads: [
        { id: 'thread-01', projectId: 'proj-01', title: 'MQTT QoS Level Selection for Edge Gateway', author: 'Aarav Deshmukh', replyCount: 3, createdAt: '2026-10-18T10:00:00Z' },
      ],
      meetingNotes: [
        { id: 'note-01', projectId: 'proj-01', title: 'Bi-Weekly Progress Review #4', mentorName: 'Prof. Sunita Sharma', keyTakeaways: 'Broker scale verified. Focus on client reconnect backoff.', createdAt: '2026-10-25T15:00:00Z' },
      ],
      systemSettings: [
        { id: 'setting-01', departmentId: 'dept-cse-01', key: 'PROPOSAL_WINDOW_ACTIVE', value: 'true', description: 'Student proposal submission window' },
        { id: 'setting-02', departmentId: 'dept-cse-01', key: 'MAX_STUDENTS_PER_TEAM', value: '4', description: 'Maximum team size' },
        { id: 'setting-03', departmentId: 'dept-cse-01', key: 'PASSING_SCORE_PERCENT', value: '50', description: 'Minimum score percentage required to pass defense' },
      ],
      auditLogs: [
        { id: 'audit-01', action: 'PROPOSAL_APPROVE', resource: 'ProjectProposal', resourceId: 'prop-01', actorName: 'Dr. Ramesh Kulkarni (HOD)', timestamp: '2026-09-14T11:20:00Z', details: 'Approved proposal with 0 similarity conflicts' },
        { id: 'audit-02', action: 'MENTOR_ALLOCATE', resource: 'MentorAssignment', resourceId: 'ma-01', actorName: 'Dr. Ramesh Kulkarni (HOD)', timestamp: '2026-09-15T09:00:00Z', details: 'Allocated Prof. Sunita Sharma to proj-01' },
      ],
    };
  }

  public getCollection(name: keyof MemoryStoreData): any[] {
    return this.data[name] || [];
  }

  public getModelNames(): string[] {
    return Object.keys(this.data);
  }

  public insertRecord(collectionName: keyof MemoryStoreData, record: any): any {
    const coll = this.data[collectionName];
    if (!coll) {
      throw new Error(`Unknown model/collection: ${String(collectionName)}`);
    }
    const id = record.id || `${String(collectionName).slice(0, 4)}-${Date.now()}`;
    const newRecord = { ...record, id, createdAt: record.createdAt || new Date().toISOString() };
    coll.unshift(newRecord);
    return newRecord;
  }

  public updateRecord(collectionName: keyof MemoryStoreData, id: string, updates: any): any {
    const coll = this.data[collectionName];
    if (!coll) return null;
    const index = coll.findIndex((item) => item.id === id);
    if (index === -1) return null;
    coll[index] = { ...coll[index], ...updates, updatedAt: new Date().toISOString() };
    return coll[index];
  }

  public deleteRecord(collectionName: keyof MemoryStoreData, id: string): boolean {
    const coll = this.data[collectionName];
    if (!coll) return false;
    const initialLen = coll.length;
    this.data[collectionName] = coll.filter((item) => item.id !== id);
    return this.data[collectionName].length < initialLen;
  }

  public getRecordById(collectionName: keyof MemoryStoreData, id: string): any {
    const coll = this.data[collectionName];
    if (!coll) return null;
    return coll.find((item) => item.id === id) || null;
  }
}

export const memoryStore = MemoryStore.getInstance();
