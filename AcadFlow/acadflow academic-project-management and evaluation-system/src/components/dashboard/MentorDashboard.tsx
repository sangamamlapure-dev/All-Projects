import React from 'react';
import { 
  Briefcase, 
  FolderKanban, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Users 
} from 'lucide-react';

interface MentorProps {
  data: any;
  onRefresh: () => void;
}

export function MentorDashboard({ data, onRefresh }: MentorProps) {
  const mentor = data?.mentor;

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4">
      {/* Top Banner */}
      <div className="d-md-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <div className="d-flex align-items-center">
            <span className="badge bg-warning text-dark px-3 py-2 fs-6 me-2 d-flex align-items-center">
              <Briefcase size={18} className="me-1" /> Faculty Project Mentor Portal
            </span>
            <span className="text-muted small">{mentor?.name}</span>
          </div>
          <p className="text-muted small mt-1 mb-0">
            Supervise assigned student project teams, schedule milestone reviews, evaluate progress submissions, and track required corrections.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-light text-dark border p-2">
            Mentee Quota: <strong>{mentor?.activeProjectsCount} / {mentor?.quota} Projects</strong>
          </span>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Column: Assigned Projects */}
        <div className="col-lg-7">
          <h5 className="fw-bold text-dark mb-3 d-flex align-items-center">
            <FolderKanban size={20} className="text-primary me-2" />
            Supervised Student Projects ({data?.assignedProjects?.length || 0})
          </h5>

          <div className="d-flex flex-column gap-3 mb-4">
            {data?.assignedProjects?.map((p: any) => (
              <div key={p.id} className="card border p-3 bg-light">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{p.title}</h6>
                    <div className="small text-muted">
                      <strong>Team:</strong> {p.teamName} • <strong>Leader:</strong> {p.leaderName} ({p.membersCount} members)
                    </div>
                  </div>
                  <span className="badge bg-primary">{p.status}</span>
                </div>

                <div className="small text-secondary mb-2">
                  <strong>Current Milestone:</strong> {p.currentMilestone}
                </div>

                <div className="mb-2">
                  <div className="d-flex justify-content-between small text-muted mb-1">
                    <span>Overall Progress</span>
                    <span>{p.overallProgress}%</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar bg-success" style={{ width: `${p.overallProgress}%` }} />
                  </div>
                </div>

                <div className="d-flex justify-content-between align-items-center small text-muted border-top pt-2 mt-2">
                  <span>Next Review: <strong>{p.nextReviewDate}</strong></span>
                  {p.overdueTasksCount > 0 ? (
                    <span className="text-danger fw-semibold d-flex align-items-center">
                      <AlertCircle size={14} className="me-1" /> {p.overdueTasksCount} Overdue Task(s)
                    </span>
                  ) : (
                    <span className="text-success fw-semibold d-flex align-items-center">
                      <CheckCircle size={14} className="me-1" /> On Track
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pending Reviews */}
          <div className="card border p-3 bg-white">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
              <Clock size={18} className="text-warning text-dark me-2" />
              Submissions Pending Mentor Review
            </h6>
            <div className="d-flex flex-column gap-2">
              {data?.pendingReviews?.map((r: any) => (
                <div key={r.id} className="p-3 border rounded bg-light d-md-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold text-dark small">{r.projectTitle}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Stage: <strong>{r.stage}</strong> • Document: <code>{r.documentTitle}</code> • Submitted: {r.submissionDate}
                    </div>
                  </div>
                  <button type="button" className="btn btn-primary btn-sm mt-2 mt-md-0" onClick={() => alert('Review panel opened')}>
                    Evaluate Submission
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Schedules & Corrections */}
        <div className="col-lg-5">
          {/* Upcoming Review Schedules */}
          <div className="card border p-3 bg-white mb-4">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
              <Calendar size={18} className="text-info me-2" />
              Upcoming Review Sessions
            </h6>
            <div className="d-flex flex-column gap-3 small">
              {data?.upcomingSchedules?.map((s: any) => (
                <div key={s.id} className="p-2 border-start border-3 border-info bg-light rounded-end">
                  <div className="fw-semibold text-dark">{s.stage}</div>
                  <div className="text-secondary">{s.teamName}</div>
                  <div className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>
                    <strong>Time:</strong> {s.date} • <strong>Venue:</strong> {s.venue}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Correction Requests Tracker */}
          <div className="card border p-3 bg-white">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
              <AlertCircle size={18} className="text-danger me-2" />
              Student Correction Tracking
            </h6>
            <div className="d-flex flex-column gap-2 small">
              {data?.correctionRequests?.map((c: any) => (
                <div key={c.id} className="p-2 border rounded bg-light">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="fw-semibold text-dark">{c.teamName}</span>
                    <span className="badge bg-warning text-dark">{c.status}</span>
                  </div>
                  <p className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>{c.requiredCorrection}</p>
                  <button type="button" className="btn btn-outline-success btn-sm w-100 py-1" style={{ fontSize: '0.75rem' }}>
                    Verify & Close Correction
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
