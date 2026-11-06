import { NotificationType, Role } from '@prisma/client';
import { SessionUserData } from '../types/auth';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface DepartmentAnnouncement {
  id: string;
  departmentId: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: Role;
  isPinned: boolean;
  createdAt: string;
}

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  category: 'DEADLINE' | 'REVIEW' | 'PRESENTATION' | 'HOLIDAY';
  startDate: string;
  endDate: string;
  description: string;
  targetRole?: string;
}

const notificationsStore: InAppNotification[] = [
  {
    id: 'notif-01',
    userId: 'user-student-01',
    title: 'Proposal Approved by HOD',
    message: 'Your project proposal "Distributed IoT Fleet Telemetry" has been approved by Dr. Ramesh Kulkarni.',
    type: NotificationType.APPROVAL,
    isRead: false,
    createdAt: '2026-08-20T14:35:00Z',
  },
  {
    id: 'notif-02',
    userId: 'user-student-01',
    title: 'Midterm Review Scheduled',
    message: 'Midterm Progress Defense has been scheduled for November 18, 2026 at 10:30 AM in Lab 402.',
    type: NotificationType.DEADLINE,
    isRead: false,
    createdAt: '2026-10-15T09:00:00Z',
  },
  {
    id: 'notif-03',
    userId: 'user-hod-cse-01',
    title: 'New Proposal Submitted',
    message: 'Team Beta submitted their proposal "Autonomous Mobile Robot Path Planning" for review.',
    type: NotificationType.INFO,
    isRead: false,
    createdAt: '2026-09-12T14:35:00Z',
  },
];

const announcementsStore: DepartmentAnnouncement[] = [
  {
    id: 'ann-01',
    departmentId: 'dept-cse-01',
    title: 'B.Tech Capstone Project Defense Deadlines (Fall 2026)',
    content: 'All final project reports, code repositories, and presentation slide decks must be uploaded to AcadFlow by December 10, 2026. Defense examinations with external examiners commence December 15.',
    authorName: 'Dr. Ramesh Kulkarni',
    authorRole: Role.HOD,
    isPinned: true,
    createdAt: '2026-10-01T08:00:00Z',
  },
  {
    id: 'ann-02',
    departmentId: 'dept-cse-01',
    title: 'Midterm Progress Report Rubrics Published',
    content: 'Evaluation rubrics for midterm reviews have been published. Check rubric criteria and weightage before submitting presentation slides.',
    authorName: 'Dr. Ramesh Kulkarni',
    authorRole: Role.HOD,
    isPinned: false,
    createdAt: '2026-10-10T11:30:00Z',
  },
];

const calendarEventsStore: AcademicCalendarEvent[] = [
  {
    id: 'cal-01',
    title: 'Project Proposal Submission Deadline',
    category: 'DEADLINE',
    startDate: '2026-09-15',
    endDate: '2026-09-15',
    description: 'Final date for student teams to submit draft proposals on AcadFlow.',
  },
  {
    id: 'cal-02',
    title: 'Midterm Progress Defense Reviews',
    category: 'REVIEW',
    startDate: '2026-11-15',
    endDate: '2026-11-22',
    description: 'Internal mentor reviews and demonstration sessions.',
  },
  {
    id: 'cal-03',
    title: 'Final Dissertation Submission Deadline',
    category: 'DEADLINE',
    startDate: '2026-12-10',
    endDate: '2026-12-10',
    description: 'Hard deadline for final report uploads and source code archives.',
  },
  {
    id: 'cal-04',
    title: 'External Viva-Voce Defense Examinations',
    category: 'PRESENTATION',
    startDate: '2026-12-15',
    endDate: '2026-12-18',
    description: 'Formal viva-voce and grading with External Evaluators.',
  },
];

export interface PersonalReminder {
  id: string;
  userId: string;
  title: string;
  dueDate: string;
  isResolved: boolean;
  createdAt: string;
}

const remindersStore: PersonalReminder[] = [
  {
    id: 'rem-01',
    userId: 'user-student-01',
    title: 'Finalize benchmark charts for MQTT vs WebSocket',
    dueDate: '2026-11-10',
    isResolved: false,
    createdAt: '2026-10-22T08:00:00Z',
  },
  {
    id: 'rem-02',
    userId: 'user-student-01',
    title: 'Submit slide deck draft to Prof. Sunita Sharma',
    dueDate: '2026-11-14',
    isResolved: false,
    createdAt: '2026-10-25T11:30:00Z',
  },
  {
    id: 'rem-03',
    userId: 'user-hod-cse-01',
    title: 'Review Capstone Moderation Commitee schedules',
    dueDate: '2026-12-05',
    isResolved: false,
    createdAt: '2026-10-20T09:00:00Z',
  },
];

export class NotificationService {
  static getNotifications(userId: string): InAppNotification[] {
    return notificationsStore.filter((n) => n.userId === userId);
  }

  static markAsRead(userId: string, notificationId: string): boolean {
    const notif = notificationsStore.find((n) => n.id === notificationId && n.userId === userId);
    if (notif) {
      notif.isRead = true;
      return true;
    }
    return false;
  }

  static markAllAsRead(userId: string): number {
    let count = 0;
    for (const n of notificationsStore) {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        count++;
      }
    }
    return count;
  }

  static getAnnouncements(departmentId: string): DepartmentAnnouncement[] {
    return announcementsStore.filter((a) => a.departmentId === departmentId);
  }

  static createAnnouncement(user: SessionUserData, title: string, content: string, isPinned = false): DepartmentAnnouncement {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can publish department announcements.');
    }

    const newAnnouncement: DepartmentAnnouncement = {
      id: `ann-${Date.now()}`,
      departmentId: user.departmentId || 'dept-cse-01',
      title,
      content,
      authorName: user.name,
      authorRole: user.role,
      isPinned,
      createdAt: new Date().toISOString(),
    };
    announcementsStore.unshift(newAnnouncement);
    return newAnnouncement;
  }

  static togglePinAnnouncement(user: SessionUserData, announcementId: string): boolean {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can pin/unpin department announcements.');
    }
    const ann = announcementsStore.find((a) => a.id === announcementId);
    if (!ann) return false;
    ann.isPinned = !ann.isPinned;
    return ann.isPinned;
  }

  static deleteAnnouncement(user: SessionUserData, announcementId: string): boolean {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can delete department announcements.');
    }
    const idx = announcementsStore.findIndex((a) => a.id === announcementId);
    if (idx !== -1) {
      announcementsStore.splice(idx, 1);
      return true;
    }
    return false;
  }

  static getCalendarEvents(): AcademicCalendarEvent[] {
    return calendarEventsStore;
  }

  static getReminders(userId: string): PersonalReminder[] {
    return remindersStore.filter((r) => r.userId === userId);
  }

  static createReminder(userId: string, title: string, dueDate: string): PersonalReminder {
    const reminder: PersonalReminder = {
      id: `rem-${Date.now()}`,
      userId,
      title,
      dueDate,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };
    remindersStore.unshift(reminder);
    return reminder;
  }

  static resolveReminder(userId: string, reminderId: string): boolean {
    const reminder = remindersStore.find((r) => r.id === reminderId && r.userId === userId);
    if (reminder) {
      reminder.isResolved = !reminder.isResolved;
      return true;
    }
    return false;
  }
}

