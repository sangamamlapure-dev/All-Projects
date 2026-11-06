import { Role } from '@prisma/client';
import { SessionUserData } from '../types/auth';

export interface AuditRecord {
  id: string;
  departmentId: string | null;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

const auditLogStore: AuditRecord[] = [
  {
    id: 'audit-101',
    departmentId: 'dept-cse-01',
    actorId: 'user-hod-01',
    actorName: 'Dr. Ramesh Kulkarni',
    actorRole: Role.HOD,
    action: 'PROPOSAL_APPROVE',
    resource: 'ProjectProposal',
    resourceId: 'prop-01',
    details: 'Approved proposal "Distributed IoT Fleet Telemetry & Edge Analytics Platform".',
    ipAddress: '127.0.0.1',
    timestamp: '2026-08-20T14:30:00Z',
  },
  {
    id: 'audit-102',
    departmentId: 'dept-cse-01',
    actorId: 'user-hod-01',
    actorName: 'Dr. Ramesh Kulkarni',
    actorRole: Role.HOD,
    action: 'MENTOR_ALLOCATE',
    resource: 'MentorAssignment',
    resourceId: 'user-mentor-01',
    details: 'Assigned Prof. Sunita Sharma as primary mentor for Team Alpha.',
    ipAddress: '127.0.0.1',
    timestamp: '2026-08-22T10:15:00Z',
  },
  {
    id: 'audit-103',
    departmentId: 'dept-cse-01',
    actorId: 'user-student-01',
    actorName: 'Aarav Deshmukh',
    actorRole: Role.STUDENT,
    action: 'DOCUMENT_UPLOAD',
    resource: 'DocumentVersion',
    resourceId: 'doc-ver-01',
    details: 'Uploaded SRS and Architectural Specification document v1.0.',
    ipAddress: '192.168.1.15',
    timestamp: '2026-09-28T14:00:00Z',
  },
];

export class AuditService {
  static record(
    actor: SessionUserData,
    action: string,
    resource: string,
    details: string,
    resourceId?: string,
    ipAddress = '127.0.0.1'
  ): AuditRecord {
    const record: AuditRecord = {
      id: `audit-${Date.now()}`,
      departmentId: actor.departmentId,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      resource,
      resourceId,
      details,
      ipAddress,
      timestamp: new Date().toISOString(),
    };
    auditLogStore.unshift(record);
    return record;
  }

  static queryLogs(
    actor: SessionUserData,
    filters?: { action?: string; resource?: string; search?: string; limit?: number; offset?: number }
  ): { logs: AuditRecord[]; total: number } {
    if (actor.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can view department security audit logs.');
    }

    let results = auditLogStore;
    if (actor.departmentId) {
      results = results.filter((l) => !l.departmentId || l.departmentId === actor.departmentId);
    }

    if (filters?.action) {
      results = results.filter((l) => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }

    if (filters?.resource) {
      results = results.filter((l) => l.resource.toLowerCase().includes(filters.resource!.toLowerCase()));
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((l) => l.details.toLowerCase().includes(q) || l.actorName.toLowerCase().includes(q));
    }

    const total = results.length;
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 50;
    const paginated = results.slice(offset, offset + limit);

    return { logs: paginated, total };
  }

  static exportAuditLogsToCsv(actor: SessionUserData): string {
    if (actor.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can export security audit logs.');
    }

    const { logs } = this.queryLogs(actor, { limit: 1000 });
    const headers = ['Audit ID', 'Timestamp', 'Actor Name', 'Actor Role', 'Action', 'Resource', 'Resource ID', 'Details', 'IP Address'];
    const rows = logs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.actorName.replace(/"/g, '""')}"`,
      `"${l.actorRole}"`,
      `"${l.action}"`,
      `"${l.resource}"`,
      `"${l.resourceId || ''}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  }
}

