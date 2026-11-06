import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  BarChart3, 
  AlertTriangle,
  FolderKanban,
  Send,
  Eye
} from 'lucide-react';

interface HodProps {
  data: any;
  onRefresh: () => void;
}

export function HodDashboard({ data, onRefresh }: HodProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'proposals' | 'mentors' | 'projects' | 'audit'>('overview');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleDecision = async (proposalId: string, decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED') => {
    setProcessingId(proposalId);
    setActionFeedback(null);
    try {
      const res = await fetch(`/api/dashboard/hod/proposals/${proposalId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, feedback: `HOD formal decision: ${decision}` }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Action failed');
      setActionFeedback(`Proposal ${decision.toLowerCase()} successfully!`);
      onRefresh();
    } catch (err: any) {
      setActionFeedback(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const metrics = data?.metrics || {};

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4">
      {/* Dashboard Top Banner */}
      <div className="d-md-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary px-3 py-2 fs-6 me-2 d-flex align-items-center">
              <ShieldCheck size={18} className="me-1" /> HOD Admin Panel
            </span>
            <span className="text-muted small">Department of Computer Science & Engineering</span>
          </div>
          <p className="text-muted small mt-1 mb-0">
            Authoritative Department Administration: Student & Faculty Management, Proposal Approvals, Mentor Allocations, and Result Moderation.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-light text-dark border p-2">
            Academic Year: <strong>2026-2027 (Term 8)</strong>
          </span>
        </div>
      </div>

      {actionFeedback && (
        <div className="alert alert-info py-2 small mb-4" role="alert">
          {actionFeedback}
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="border rounded p-3 bg-light text-center h-100">
            <Users size={20} className="text-primary mb-1" />
            <div className="h4 fw-bold mb-0 text-dark">{metrics.activeStudents || 48}</div>
            <div className="text-muted small">Enrolled Students</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="border rounded p-3 bg-light text-center h-100">
            <Briefcase size={20} className="text-success mb-1" />
            <div className="h4 fw-bold mb-0 text-dark">{metrics.facultyMentors || 8}</div>
            <div className="text-muted small">Faculty Mentors</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="border rounded p-3 bg-light text-center h-100">
            <FolderKanban size={20} className="text-info mb-1" />
            <div className="h4 fw-bold mb-0 text-dark">{metrics.activeProjects || 14}</div>
            <div className="text-muted small">Active Projects</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="border rounded p-3 bg-light text-center h-100">
            <Clock size={20} className="text-warning mb-1" />
            <div className="h4 fw-bold mb-0 text-dark">{data?.proposalsPending?.length || 2}</div>
            <div className="text-muted small">Pending Proposals</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="border rounded p-3 bg-light text-center h-100">
            <BarChart3 size={20} className="text-secondary mb-1" />
            <div className="h4 fw-bold mb-0 text-dark">{metrics.upcomingReviews || 5}</div>
            <div className="text-muted small">Scheduled Reviews</div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4 col-xl-2">
          <div className="border rounded p-3 bg-light text-center h-100">
            <CheckCircle size={20} className="text-dark mb-1" />
            <div className="h4 fw-bold mb-0 text-dark">{metrics.publishedResults || 0}</div>
            <div className="text-muted small">Results Published</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 border-bottom pb-2">
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-2 px-3 fw-semibold ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview & Pending Proposals
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-2 px-3 fw-semibold ${activeTab === 'mentors' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentors')}
          >
            Mentor Workload Balancing
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-2 px-3 fw-semibold ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Department Projects
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-2 px-3 fw-semibold ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            Audit History
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          <h6 className="fw-bold text-dark mb-3">Project Proposals Awaiting HOD Formal Approval</h6>
          <div className="d-flex flex-column gap-3">
            {data?.proposalsPending?.map((prop: any) => (
              <div key={prop.id} className="card border p-3 bg-light">
                <div className="d-md-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{prop.title}</h6>
                    <div className="small text-muted">
                      <strong>Team:</strong> {prop.teamName} • <strong>Leader:</strong> {prop.leaderName} • <strong>Submitted:</strong> {new Date(prop.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge bg-warning text-dark mt-2 mt-md-0">
                    {prop.status}
                  </span>
                </div>
                <p className="small text-secondary mb-2">{prop.abstract}</p>
                <div className="small text-muted mb-3">
                  <strong>Tech Stack:</strong> <code>{prop.techStack}</code>
                </div>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-success btn-sm d-flex align-items-center"
                    onClick={() => handleDecision(prop.id, 'APPROVED')}
                    disabled={processingId === prop.id}
                  >
                    <CheckCircle size={14} className="me-1" /> Approve Proposal
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-warning btn-sm text-dark d-flex align-items-center"
                    onClick={() => handleDecision(prop.id, 'REVISION_REQUESTED')}
                    disabled={processingId === prop.id}
                  >
                    <Clock size={14} className="me-1" /> Request Revision
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm d-flex align-items-center"
                    onClick={() => handleDecision(prop.id, 'REJECTED')}
                    disabled={processingId === prop.id}
                  >
                    <XCircle size={14} className="me-1" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'mentors' && (
        <div>
          <h6 className="fw-bold text-dark mb-3">Faculty Mentor Allocation & Workload Distribution</h6>
          <p className="text-muted small mb-3">
            HOD monitors mentor capacity to avoid overload and balance project supervision across faculty specializations.
          </p>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light small">
                <tr>
                  <th>Faculty Mentor</th>
                  <th>Specialization</th>
                  <th>Assigned Projects</th>
                  <th>Workload Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="small">
                {data?.mentorWorkloads?.map((m: any) => (
                  <tr key={m.id}>
                    <td>
                      <div className="fw-bold text-dark">{m.name}</div>
                      <div className="text-muted">{m.email}</div>
                    </td>
                    <td>{m.specialization}</td>
                    <td>
                      <strong>{m.assignedProjectsCount}</strong> / {m.maxQuota} projects
                    </td>
                    <td style={{ width: '25%' }}>
                      <div className="progress" style={{ height: 10 }}>
                        <div
                          className={`progress-bar ${
                            m.utilizationPercentage >= 80 ? 'bg-danger' :
                            m.utilizationPercentage >= 60 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${m.utilizationPercentage}%` }}
                        />
                      </div>
                      <div className="text-muted small mt-1">{m.utilizationPercentage}% capacity</div>
                    </td>
                    <td>
                      {m.utilizationPercentage >= 80 ? (
                        <span className="badge bg-danger">Near Capacity</span>
                      ) : (
                        <span className="badge bg-success">Available for Allocation</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div>
          <h6 className="fw-bold text-dark mb-3">Department Final-Year Projects</h6>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light small">
                <tr>
                  <th>Project Title</th>
                  <th>Team</th>
                  <th>Assigned Mentor</th>
                  <th>Status</th>
                  <th>Milestones Progress</th>
                </tr>
              </thead>
              <tbody className="small">
                {data?.projects?.map((p: any) => (
                  <tr key={p.id}>
                    <td className="fw-semibold text-dark">{p.title}</td>
                    <td>{p.teamName}</td>
                    <td>{p.mentorName}</td>
                    <td><span className="badge bg-info text-dark">{p.status}</span></td>
                    <td style={{ width: '25%' }}>
                      <div className="progress" style={{ height: 10 }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${p.progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-muted small mt-1">
                        {p.milestonesCompleted} of {p.milestonesTotal} milestones ({p.progressPercentage}%)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div>
          <h6 className="fw-bold text-dark mb-3">Department Security & Workflow Audit Trail</h6>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead className="table-light small">
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Actor</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody className="small font-monospace">
                {data?.recentAuditLogs?.map((log: any) => (
                  <tr key={log.id}>
                    <td><span className="badge bg-dark">{log.action}</span></td>
                    <td>{log.resource}</td>
                    <td>{log.actor}</td>
                    <td className="text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
