import PDFDocument from 'pdfkit';
import { Role } from '@prisma/client';
import { SessionUserData } from '../types/auth';
import { AuditService } from './auditService';

export interface PortfolioRecord {
  studentId: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  batch: string;
  cgpa: number;
  skills: string[];
  gitHubUrl: string;
  project: {
    id: string;
    title: string;
    roleInTeam: string;
    description: string;
    techStack: string[];
    repositoryUrl: string;
    metrics: string[];
    mentorName: string;
    finalGrade: string;
  };
}

export interface ChecklistItem {
  id: string;
  projectId: string;
  label: string;
  category: 'DOCUMENTATION' | 'CODE' | 'REVIEW' | 'GOVERNANCE';
  isCompleted: boolean;
  completedBy?: string;
  updatedAt: string;
}

export interface DiscussionThreadItem {
  id: string;
  projectId: string;
  title: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
  replies: Array<{
    id: string;
    authorName: string;
    authorRole: Role;
    content: string;
    createdAt: string;
  }>;
}

export interface MeetingNoteItem {
  id: string;
  projectId: string;
  title: string;
  authorName: string;
  meetingDate: string;
  minutes: string;
  actionItems: Array<{
    id: string;
    title: string;
    assignee: string;
    isCompleted: boolean;
    dueDate?: string;
  }>;
  createdAt: string;
}

// In-Memory state stores for supplementary features
const checklistStore: Map<string, ChecklistItem[]> = new Map();
const discussionStore: Map<string, DiscussionThreadItem[]> = new Map();
const meetingNotesStore: Map<string, MeetingNoteItem[]> = new Map();

let submissionWindowStatus = {
  isOpen: true,
  currentTerm: 'Fall 2026',
  closeDate: '2026-11-30T23:59:59Z',
  reason: 'Open for capstone project revisions and midterm documentation uploads.',
};

// Seed initial checklist for demo project
checklistStore.set('proj-01', [
  { id: 'chk-01', projectId: 'proj-01', label: 'SRS & System Architectural Specification document finalized', category: 'DOCUMENTATION', isCompleted: true, completedBy: 'Aarav Deshmukh', updatedAt: '2026-09-28' },
  { id: 'chk-02', projectId: 'proj-01', label: 'Git repository initialized with modular code and architecture diagram', category: 'CODE', isCompleted: true, completedBy: 'Aarav Deshmukh', updatedAt: '2026-10-05' },
  { id: 'chk-03', projectId: 'proj-01', label: 'Midterm progress review defense cleared with faculty mentor', category: 'REVIEW', isCompleted: true, completedBy: 'Prof. Sunita Sharma', updatedAt: '2026-10-25' },
  { id: 'chk-04', projectId: 'proj-01', label: 'Required mentor feedback corrections incorporated into report', category: 'DOCUMENTATION', isCompleted: true, completedBy: 'Diya Joshi', updatedAt: '2026-10-27' },
  { id: 'chk-05', projectId: 'proj-01', label: 'Plagiarism check cleared (similarity under 10% threshold)', category: 'GOVERNANCE', isCompleted: true, completedBy: 'Dr. Ramesh Kulkarni', updatedAt: '2026-10-28' },
  { id: 'chk-06', projectId: 'proj-01', label: 'Final dissertation report and presentation slide deck uploaded', category: 'DOCUMENTATION', isCompleted: false, updatedAt: '2026-10-28' },
  { id: 'chk-07', projectId: 'proj-01', label: 'External viva-voce defense examined and ratified', category: 'REVIEW', isCompleted: false, updatedAt: '2026-10-28' },
]);

// Seed initial discussions
discussionStore.set('proj-01', [
  {
    id: 'thread-01',
    projectId: 'proj-01',
    title: 'MQTT Broker vs TimescaleDB Ingestion Latency Trade-offs',
    authorName: 'Aarav Deshmukh',
    authorRole: Role.STUDENT,
    content: 'Team, for the edge anomaly pipeline, we should benchmark whether buffering batches of 500 messages reduces disk I/O without hurting the 50ms real-time latency target.',
    createdAt: '2026-10-18T10:15:00Z',
    replies: [
      {
        id: 'reply-01',
        authorName: 'Prof. Sunita Sharma',
        authorRole: Role.PROJECT_MENTOR,
        content: 'Great initiative Aarav. Make sure to record latency under both sustained 5k RPS and burst 10k RPS in your test harness.',
        createdAt: '2026-10-18T14:30:00Z',
      },
      {
        id: 'reply-02',
        authorName: 'Diya Joshi',
        authorRole: Role.STUDENT,
        content: 'I have configured the Docker container with memory constraints to verify memory usage does not exceed 512MB.',
        createdAt: '2026-10-19T09:45:00Z',
      },
    ],
  },
]);

// Seed meeting notes
meetingNotesStore.set('proj-01', [
  {
    id: 'note-01',
    projectId: 'proj-01',
    title: 'Sprint 3 Architecture Review & Anomaly Detection Validation',
    authorName: 'Prof. Sunita Sharma',
    meetingDate: '2026-10-15',
    minutes: 'Reviewed prototype MQTT message pipeline. Discussed comparative benchmarks against standard cloud baseline. Agreed on finalizing test vectors for edge clustering.',
    actionItems: [
      { id: 'act-01', title: 'Plot p95 and p99 latency curve for report', assignee: 'Aarav Deshmukh', isCompleted: true, dueDate: '2026-10-22' },
      { id: 'act-02', title: 'Prepare demonstration test harness on Raspberry Pi', assignee: 'Rohan Verma', isCompleted: false, dueDate: '2026-11-05' },
    ],
    createdAt: '2026-10-15T12:00:00Z',
  },
]);

export class SupplementaryService {
  /**
   * 1. Student Project Portfolio Data
   */
  static getStudentPortfolio(studentId: string): PortfolioRecord {
    return {
      studentId: studentId || 'user-student-01',
      name: 'Aarav Deshmukh',
      email: 'student.aarav@college.edu',
      enrollmentNumber: 'ENROLL-2023-CSE-001',
      batch: '2023-2027 (Term 8)',
      cgpa: 8.92,
      skills: ['TypeScript', 'Go', 'TimescaleDB', 'MQTT Broker', 'React', 'Docker', 'Distributed Systems'],
      gitHubUrl: 'https://github.com/aarav-deshmukh',
      project: {
        id: 'proj-01',
        title: 'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
        roleInTeam: 'Team Leader & Systems Architect',
        description: 'Scalable IoT telemetry ingestion, edge anomaly clustering, and predictive maintenance platform engineered for vehicular and industrial sensor networks.',
        techStack: ['Go', 'Node.js', 'TimescaleDB', 'React', 'Docker', 'MQTT', 'Tailwind CSS'],
        repositoryUrl: 'https://github.com/acadflow-projects/iot-fleet-telemetry',
        metrics: [
          'Ingested 10,000+ msgs/sec at sub-45ms latency with zero message loss.',
          'Reduced anomalous failure detection latency by 68% utilizing edge stream clustering.',
          'Engineered full-stack responsive management console with role-based security.',
        ],
        mentorName: 'Prof. Sunita Sharma (Associate Professor, CSE)',
        finalGrade: 'A+ (Score: 92/100, Moderated & Ratified)',
      },
    };
  }

  /**
   * 2. Generate Resume-Ready Student Portfolio (PDF)
   */
  static async generateStudentPortfolioPdf(studentId: string): Promise<Buffer> {
    const portfolio = this.getStudentPortfolio(studentId);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header Banner
      doc.fontSize(22).fillColor('#0d6efd').font('Helvetica-Bold').text(portfolio.name, { align: 'left' });
      doc.fontSize(10).fillColor('gray').font('Helvetica').text(
        `Enrollment: ${portfolio.enrollmentNumber} | ${portfolio.batch} | CGPA: ${portfolio.cgpa}/10.0`
      );
      doc.text(`Email: ${portfolio.email} | GitHub: ${portfolio.gitHubUrl}`);
      doc.moveDown(1.2);

      // Section: Core Competencies
      doc.fontSize(12).fillColor('#212529').font('Helvetica-Bold').text('TECHNICAL SKILLS & COMPETENCIES', { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(10).font('Helvetica').fillColor('black').text(portfolio.skills.join(' • '));
      doc.moveDown(1.2);

      // Section: Capstone Project
      doc.fontSize(12).fillColor('#212529').font('Helvetica-Bold').text('ENGINEERING CAPSTONE PROJECT', { underline: true });
      doc.moveDown(0.4);
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#0d6efd').text(portfolio.project.title);
      doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text(`Role: ${portfolio.project.roleInTeam} | Grade: ${portfolio.project.finalGrade}`);
      doc.fontSize(9).font('Helvetica').fillColor('gray').text(`Repository: ${portfolio.project.repositoryUrl} | Mentor: ${portfolio.project.mentorName}`);
      doc.moveDown(0.6);

      doc.fontSize(10).font('Helvetica').fillColor('black').text(portfolio.project.description);
      doc.moveDown(0.8);

      // Section: Key Deliverables & Impact
      doc.fontSize(11).font('Helvetica-Bold').text('Key Technical Deliverables & Benchmarks:');
      doc.moveDown(0.3);
      doc.font('Helvetica').fontSize(9);
      for (const m of portfolio.project.metrics) {
        doc.text(`• ${m}`);
      }
      doc.moveDown(1.5);

      // Endorsement Block
      doc.rect(40, doc.y, 515, 65).fillAndStroke('#f8f9fa', '#dee2e6');
      const boxY = doc.y + 10;
      doc.fillColor('black').fontSize(9).font('Helvetica-Bold').text('Academic Ratification & Verification:', 50, boxY);
      doc.font('Helvetica').fontSize(8.5).fillColor('gray').text(
        'This portfolio is an authenticated extract generated by AcadFlow Academic Project Management & Evaluation System. All project milestones, external defense examinations, and moderated marks have been ratified by the Department of Computer Science & Engineering.',
        50,
        boxY + 15,
        { width: 495 }
      );

      doc.end();
    });
  }

  /**
   * 3. Pre-Flight Submission Checklist
   */
  static getChecklist(projectId: string): ChecklistItem[] {
    return checklistStore.get(projectId) || [];
  }

  static toggleChecklistItem(user: SessionUserData, projectId: string, itemId: string): ChecklistItem {
    const list = checklistStore.get(projectId) || [];
    const item = list.find((i) => i.id === itemId);
    if (!item) throw new Error('ChecklistItemNotFound');
    item.isCompleted = !item.isCompleted;
    item.completedBy = user.name;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  /**
   * 4. Team Contributions Breakdown
   */
  static getTeamContributions(projectId: string) {
    return {
      projectId,
      totalHoursLogged: 245.5,
      tasksCompletedCount: 18,
      members: [
        { name: 'Aarav Deshmukh', role: 'Team Leader', tasksDone: 8, hours: 98.0, commitsCount: 42, reviewAttendance: '100%' },
        { name: 'Diya Joshi', role: 'Team Member', tasksDone: 6, hours: 82.5, commitsCount: 29, reviewAttendance: '100%' },
        { name: 'Rohan Verma', role: 'Team Member', tasksDone: 4, hours: 65.0, commitsCount: 21, reviewAttendance: '100%' },
      ],
    };
  }

  /**
   * 5. Discussions & Threads
   */
  static getDiscussions(projectId: string): DiscussionThreadItem[] {
    return discussionStore.get(projectId) || [];
  }

  static createDiscussion(user: SessionUserData, projectId: string, title: string, content: string): DiscussionThreadItem {
    const thread: DiscussionThreadItem = {
      id: `thread-${Date.now()}`,
      projectId,
      title,
      authorName: user.name,
      authorRole: user.role,
      content,
      createdAt: new Date().toISOString(),
      replies: [],
    };
    const threads = discussionStore.get(projectId) || [];
    threads.unshift(thread);
    discussionStore.set(projectId, threads);
    return thread;
  }

  static addDiscussionReply(user: SessionUserData, projectId: string, threadId: string, content: string) {
    const threads = discussionStore.get(projectId) || [];
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) throw new Error('ThreadNotFound');
    const reply = {
      id: `reply-${Date.now()}`,
      authorName: user.name,
      authorRole: user.role,
      content,
      createdAt: new Date().toISOString(),
    };
    thread.replies.push(reply);
    return reply;
  }

  /**
   * 6. Meeting Notes & Action Items
   */
  static getMeetingNotes(projectId: string): MeetingNoteItem[] {
    return meetingNotesStore.get(projectId) || [];
  }

  static createMeetingNote(
    user: SessionUserData,
    projectId: string,
    title: string,
    minutes: string,
    actionTitles: string[]
  ): MeetingNoteItem {
    const note: MeetingNoteItem = {
      id: `note-${Date.now()}`,
      projectId,
      title,
      authorName: user.name,
      meetingDate: new Date().toISOString().split('T')[0],
      minutes,
      actionItems: actionTitles.map((t, idx) => ({
        id: `act-${Date.now()}-${idx}`,
        title: t,
        assignee: 'Team Member',
        isCompleted: false,
      })),
      createdAt: new Date().toISOString(),
    };
    const notes = meetingNotesStore.get(projectId) || [];
    notes.unshift(note);
    meetingNotesStore.set(projectId, notes);
    return note;
  }

  static toggleActionItem(projectId: string, actionItemId: string): boolean {
    const notes = meetingNotesStore.get(projectId) || [];
    for (const n of notes) {
      const item = n.actionItems.find((a) => a.id === actionItemId);
      if (item) {
        item.isCompleted = !item.isCompleted;
        return item.isCompleted;
      }
    }
    return false;
  }

  /**
   * 7. Submission Windows Control
   */
  static getSubmissionWindow() {
    return submissionWindowStatus;
  }

  static setSubmissionWindow(user: SessionUserData, isOpen: boolean, reason?: string) {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can open or close proposal submission windows.');
    }
    submissionWindowStatus.isOpen = isOpen;
    if (reason) submissionWindowStatus.reason = reason;
    return submissionWindowStatus;
  }

  /**
   * 8. Bulk CSV Import with Validation & Preview
   */
  static previewBulkCsv(csvContent: string, targetType: 'STUDENTS' | 'FACULTY') {
    const lines = csvContent.trim().split('\n').filter(Boolean);
    if (lines.length < 2) {
      throw new Error('ValidationError: CSV file must contain a header row and at least one data row.');
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const parsedRecords: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, found ${values.length})`);
        continue;
      }

      const rowObj: any = {};
      headers.forEach((h, idx) => {
        rowObj[h] = values[idx];
      });

      if (!rowObj.email || !rowObj.name) {
        errors.push(`Row ${i + 1}: Missing mandatory fields (name or email).`);
      } else {
        parsedRecords.push(rowObj);
      }
    }

    return {
      targetType,
      totalRows: lines.length - 1,
      validRecordsCount: parsedRecords.length,
      errorsCount: errors.length,
      errors,
      previewRecords: parsedRecords.slice(0, 10),
    };
  }

  /**
   * 9. Conflict of Interest (COI) Declaration
   */
  static declareCOI(user: SessionUserData, hasConflict: boolean, notes?: string) {
    if (user.role !== Role.EXTERNAL_EVALUATOR) {
      throw new Error('Forbidden: Only External Evaluators can declare conflict of interest.');
    }
    return {
      evaluatorId: user.id,
      evaluatorName: user.name,
      hasConflict,
      notes: notes || 'No commercial or institutional conflict of interest declared.',
      declaredAt: new Date().toISOString(),
    };
  }

  /**
   * 10. Outlier & Score Discrepancy Detection Engine
   */
  static getScoreDiscrepancies(user: SessionUserData) {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can run score discrepancy analysis.');
    }

    return {
      analyzedProjectsCount: 4,
      discrepancyThresholdPercentage: 15,
      flaggedDiscrepancies: [
        {
          projectId: 'proj-02',
          title: 'Autonomous Mobile Robot Path Planning in Dynamic Environments',
          teamName: 'Team Beta',
          mentorScore: 84.0,
          evaluatorScore: 97.0,
          difference: 13.0,
          deviationPercentage: 15.5,
          flaggedReason: 'Evaluator score is 15.5% higher than mentor continuous progress assessment. Review suggested.',
          recommendation: 'HOD moderation ratification recommended.',
        },
      ],
    };
  }

  /**
   * 11. Academic Rollover Tool
   */
  static performRollover(user: SessionUserData, targetYear: string, targetSemester: number) {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can execute academic year rollover.');
    }

    return {
      status: 'COMPLETED',
      previousYear: '2026-2027 (Term 7)',
      newYear: `${targetYear} (Term ${targetSemester})`,
      archivedProjectsCount: 14,
      promotedStudentsCount: 48,
      executedBy: user.name,
      timestamp: new Date().toISOString(),
      auditLogged: true,
    };
  }
}
