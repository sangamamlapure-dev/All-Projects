import React, { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  FolderGit2, 
  Briefcase, 
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';

interface StudentProps {
  data: any;
  onRefresh: () => void;
}

export function StudentDashboard({ data, onRefresh }: StudentProps) {
  const [taskUpdating, setTaskUpdating] = useState<string | null>(null);

  const toggleTask = async (taskId: string, currentStatus: string) => {
    setTaskUpdating(taskId);
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';

    try {
      await fetch(`/api/dashboard/student/tasks/${taskId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      onRefresh();
    } catch {
      // Refresh to sync
      onRefresh();
    } finally {
      setTaskUpdating(null);
    }
  };

  const project = data?.project;
  const proposal = data?.proposal;
  const team = data?.team;

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4">
      {/* Top Banner */}
      <div className="d-md-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <div className="d-flex align-items-center">
            <span className="badge bg-success px-3 py-2 fs-6 me-2 d-flex align-items-center">
              <GraduationCap size={18} className="me-1" /> Student Project Portal
            </span>
            <span className="text-muted small">{team?.name}</span>
          </div>
          <p className="text-muted small mt-1 mb-0">
            Track project milestones, personal task boards, submit reports and presentations, and review supervisor feedback.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-light text-dark border p-2">
            Status: <strong className="text-success">{project?.status}</strong>
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Project & Team Overview */}
        <div className="col-lg-7">
          {/* Project Card */}
          <div className="card border p-3 bg-light mb-4">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <h5 className="fw-bold text-dark mb-1">{project?.title}</h5>
              <span className="badge bg-success">{proposal?.status}</span>
            </div>
            <p className="small text-secondary mb-3">{project?.description}</p>

            <div className="row g-2 small border-top pt-2">
              <div className="col-sm-6">
                <span className="text-muted">Assigned Mentor:</span>{' '}
                <strong>{project?.assignedMentor?.name}</strong>
              </div>
              <div className="col-sm-6">
                <span className="text-muted">Repository:</span>{' '}
                <a
                  href={project?.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none d-inline-flex align-items-center text-primary"
                >
                  <FolderGit2 size={14} className="me-1" /> GitHub Repo
                </a>
              </div>
            </div>
          </div>

          {/* Milestone Timeline */}
          <div className="card border p-3 bg-white mb-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
              <Calendar size={18} className="text-primary me-2" />
              Project Milestones Timeline
            </h6>
            <div className="d-flex flex-column gap-3">
              {data?.milestones?.map((m: any) => (
                <div key={m.id} className="border-start border-4 border-primary ps-3 py-1">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark small">{m.title}</span>
                    <span className={`badge ${m.status === 'COMPLETED' ? 'bg-success' : m.status === 'IN_PROGRESS' ? 'bg-primary' : 'bg-secondary'}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="small text-muted mb-1">Due: {m.dueDate}</div>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className={`progress-bar ${m.status === 'COMPLETED' ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Personal Task Board */}
          <div className="card border p-3 bg-white">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
              <CheckSquare size={18} className="text-success me-2" />
              Team Tasks & Deliverables
            </h6>
            <div className="d-flex flex-column gap-2">
              {data?.tasks?.map((t: any) => (
                <div
                  key={t.id}
                  className="d-flex align-items-center justify-content-between p-2 rounded border bg-light"
                >
                  <div className="d-flex align-items-center">
                    <button
                      type="button"
                      className="btn btn-link p-0 me-2 text-dark"
                      onClick={() => toggleTask(t.id, t.status)}
                      disabled={taskUpdating === t.id}
                    >
                      {t.status === 'COMPLETED' ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : (
                        <Square size={18} className="text-muted" />
                      )}
                    </button>
                    <div>
                      <div className={`small fw-semibold ${t.status === 'COMPLETED' ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                        {t.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Assignee: <strong>{t.assignee}</strong> • Priority:{' '}
                        <span className={`badge ${t.priority === 'HIGH' ? 'bg-danger' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                          {t.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${t.status === 'COMPLETED' ? 'bg-success' : t.status === 'IN_PROGRESS' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Team, Submissions & Feedback */}
        <div className="col-lg-5">
          {/* Team Members */}
          <div className="card border p-3 bg-white mb-4">
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center">
              <Users size={16} className="text-primary me-2" /> Team Members
            </h6>
            <ul className="list-group list-group-flush small">
              {team?.members?.map((m: any, i: number) => (
                <li key={i} className="list-group-item d-flex justify-content-between align-items-center px-0 py-2">
                  <div>
                    <div className="fw-semibold text-dark">{m.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{m.email}</div>
                  </div>
                  <span className={`badge ${m.role === 'LEADER' ? 'bg-primary' : 'bg-light text-dark border'}`}>
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Document Versions */}
          <div className="card border p-3 bg-white mb-4">
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center">
              <FileText size={16} className="text-info me-2" /> Uploaded Submissions
            </h6>
            <div className="d-flex flex-column gap-2 small">
              {data?.documents?.map((d: any) => (
                <div key={d.id} className="p-2 border rounded bg-light">
                  <div className="d-flex justify-content-between">
                    <span className="fw-semibold text-dark">{d.title}</span>
                    <span className="badge bg-secondary">{d.version}</span>
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                    Uploaded {d.uploadedAt} • {d.sizeMb} MB
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mentor Feedback Resolution */}
          <div className="card border p-3 bg-white">
            <h6 className="fw-bold text-dark mb-2 d-flex align-items-center">
              <Briefcase size={16} className="text-warning text-dark me-2" /> Mentor Guidance
            </h6>
            {data?.recentFeedback?.map((fb: any, i: number) => (
              <div key={i} className="p-2 border-start border-3 border-warning bg-light rounded-end small">
                <div className="fw-semibold text-dark mb-1">{fb.mentor} ({fb.date})</div>
                <p className="text-secondary mb-1" style={{ fontSize: '0.8rem' }}>{fb.comments}</p>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  {fb.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
