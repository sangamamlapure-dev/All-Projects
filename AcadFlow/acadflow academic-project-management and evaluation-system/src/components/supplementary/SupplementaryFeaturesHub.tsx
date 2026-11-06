import React, { useState, useEffect } from 'react';
import {
  FileText,
  MessageSquare,
  CheckSquare,
  Users,
  ShieldCheck,
  AlertTriangle,
  Upload,
  Calendar,
  Download,
  FolderGit2,
  Award,
  Sparkles,
  Send,
  Plus,
  RefreshCw,
  GitBranch,
  BookOpen
} from 'lucide-react';

interface Props {
  currentUser: any;
  onRefresh: () => void;
}

export function SupplementaryFeaturesHub({ currentUser, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<'portfolio' | 'discussions' | 'meeting_notes' | 'checklist' | 'governance' | 'coi'>('portfolio');

  // State
  const [portfolio, setPortfolio] = useState<any>(null);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [meetingNotes, setMeetingNotes] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any>(null);
  const [submissionWindow, setSubmissionWindow] = useState<any>(null);
  const [discrepancies, setDiscrepancies] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Forms
  const [newThreadTitle, setNewThreadTitle] = useState<string>('');
  const [newThreadContent, setNewThreadContent] = useState<string>('');
  const [replyContent, setReplyContent] = useState<{ [key: string]: string }>({});

  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteMinutes, setNewNoteMinutes] = useState<string>('');
  const [newNoteActions, setNewNoteActions] = useState<string>('');

  const [csvInput, setCsvInput] = useState<string>(
    `name,email,enrollmentNumber,batch\nAnanya Sharma,student.ananya@college.edu,ENROLL-2023-004,2023-2027\nKaran Verma,student.karan@college.edu,ENROLL-2023-005,2023-2027\nRitu Sen,student.ritu@college.edu,ENROLL-2023-006,2023-2027`
  );
  const [csvPreview, setCsvPreview] = useState<any>(null);

  // COI
  const [coiNotes, setCoiNotes] = useState<string>('No institutional, commercial or personal conflict of interest declared.');
  const [coiDeclared, setCoiDeclared] = useState<boolean>(false);

  const fetchSupplementaryData = async () => {
    setLoading(true);
    try {
      const [portRes, checkRes, discRes, notesRes, contRes, winRes] = await Promise.all([
        fetch('/api/supplementary/portfolio/user-student-01'),
        fetch('/api/supplementary/projects/proj-01/checklist'),
        fetch('/api/supplementary/projects/proj-01/discussions'),
        fetch('/api/supplementary/projects/proj-01/meeting-notes'),
        fetch('/api/supplementary/projects/proj-01/contributions'),
        fetch('/api/supplementary/submission-window'),
      ]);

      if (portRes.ok) {
        const data = await portRes.json();
        setPortfolio(data.portfolio);
      }
      if (checkRes.ok) {
        const data = await checkRes.json();
        setChecklist(data.checklist || []);
      }
      if (discRes.ok) {
        const data = await discRes.json();
        setDiscussions(data.discussions || []);
      }
      if (notesRes.ok) {
        const data = await notesRes.json();
        setMeetingNotes(data.notes || []);
      }
      if (contRes.ok) {
        const data = await contRes.json();
        setContributions(data.contributions);
      }
      if (winRes.ok) {
        const data = await winRes.json();
        setSubmissionWindow(data);
      }
      if (currentUser?.role === 'HOD') {
        const discpRes = await fetch('/api/supplementary/moderation/discrepancies');
        if (discpRes.ok) {
          const data = await discpRes.json();
          setDiscrepancies(data);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplementaryData();
  }, [currentUser]);

  const toggleCheck = async (itemId: string) => {
    try {
      const res = await fetch(`/api/supplementary/projects/proj-01/checklist/${itemId}/toggle`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setChecklist((prev) => prev.map((c) => (c.id === itemId ? data.item : c)));
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const createThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle || !newThreadContent) return;
    try {
      const res = await fetch('/api/supplementary/projects/proj-01/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newThreadTitle, content: newThreadContent }),
      });
      if (res.ok) {
        setNewThreadTitle('');
        setNewThreadContent('');
        setStatusMsg('Discussion thread initiated.');
        fetchSupplementaryData();
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const postReply = async (threadId: string) => {
    const content = replyContent[threadId];
    if (!content) return;
    try {
      const res = await fetch(`/api/supplementary/projects/proj-01/discussions/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setReplyContent((prev) => ({ ...prev, [threadId]: '' }));
        fetchSupplementaryData();
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle || !newNoteMinutes) return;
    const actions = newNoteActions.split('\n').filter((a) => a.trim());
    try {
      const res = await fetch('/api/supplementary/projects/proj-01/meeting-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newNoteTitle, minutes: newNoteMinutes, actionItems: actions }),
      });
      if (res.ok) {
        setNewNoteTitle('');
        setNewNoteMinutes('');
        setNewNoteActions('');
        setStatusMsg('Mentor meeting minutes and action items logged.');
        fetchSupplementaryData();
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const toggleAction = async (actionId: string) => {
    await fetch(`/api/supplementary/projects/proj-01/action-items/${actionId}/toggle`, { method: 'POST' });
    fetchSupplementaryData();
  };

  const toggleSubmissionWindow = async (isOpen: boolean) => {
    try {
      const res = await fetch('/api/supplementary/submission-window/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen, reason: isOpen ? 'Reopened by HOD' : 'Closed for Term 8' }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissionWindow(data.status);
        setStatusMsg(`Submission window set to ${isOpen ? 'OPEN' : 'CLOSED'}`);
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const handlePreviewCsv = async () => {
    try {
      const res = await fetch('/api/supplementary/bulk-import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvInput, targetType: 'STUDENTS' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCsvPreview(data);
    } catch (err: any) {
      setStatusMsg(`CSV Error: ${err.message}`);
    }
  };

  const handleDeclareCOI = async () => {
    try {
      const res = await fetch('/api/supplementary/evaluators/declare-coi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasConflict: false, notes: coiNotes }),
      });
      if (res.ok) {
        setCoiDeclared(true);
        setStatusMsg('Conflict of interest declaration ratified.');
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const handleRollover = async () => {
    if (!confirm('Execute Academic Term Rollover? This will archive current projects and prepare next term.')) return;
    try {
      const res = await fetch('/api/supplementary/academic/rollover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetYear: '2027-2028', targetSemester: 7 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatusMsg(`Rollover complete: ${data.result.newYear} activated.`);
      fetchSupplementaryData();
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4">
      {/* Top Banner */}
      <div className="d-md-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <div className="d-flex align-items-center">
            <span className="badge bg-purple text-white px-3 py-2 fs-6 me-2 d-flex align-items-center" style={{ backgroundColor: '#6f42c1' }}>
              <Sparkles size={18} className="me-1" /> Supplementary Real-World Operations
            </span>
            <span className="text-muted small">Phase 7: Student Portfolio, Discussions, Meeting Notes, Integrity & Governance</span>
          </div>
          <p className="text-muted small mt-1 mb-0">
            Resume-ready portfolio export, pre-flight submission checklists, mentor-student meeting minutes, bulk CSV onboarding, and score discrepancy detection.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center"
            onClick={fetchSupplementaryData}
            disabled={loading}
          >
            <RefreshCw size={14} className={`me-1 ${loading ? 'spin' : ''}`} /> Sync Data
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="alert alert-info py-2 small mb-4 d-flex justify-content-between align-items-center" role="alert">
          <div>{statusMsg}</div>
          <button type="button" className="btn-close btn-close-sm" onClick={() => setStatusMsg(null)} />
        </div>
      )}

      {/* Tabs */}
      <ul className="nav nav-pills mb-4 border-bottom pb-2 flex-wrap gap-1">
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            <Award size={15} className="me-1 inline" /> Student Portfolio & Resume
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${activeTab === 'checklist' ? 'active' : ''}`}
            onClick={() => setActiveTab('checklist')}
          >
            <CheckSquare size={15} className="me-1 inline" /> Pre-Flight Checklist
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${activeTab === 'discussions' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussions')}
          >
            <MessageSquare size={15} className="me-1 inline" /> Project Discussions
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${activeTab === 'meeting_notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('meeting_notes')}
          >
            <BookOpen size={15} className="me-1 inline" /> Meeting Minutes & Actions
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${activeTab === 'coi' ? 'active' : ''}`}
            onClick={() => setActiveTab('coi')}
          >
            <ShieldCheck size={15} className="me-1 inline" /> Conflict of Interest (COI)
          </button>
        </li>
        {currentUser?.role === 'HOD' && (
          <li className="nav-item">
            <button
              className={`nav-link btn-sm py-1 px-3 fw-semibold ${activeTab === 'governance' ? 'active' : ''}`}
              onClick={() => setActiveTab('governance')}
            >
              <GitBranch size={15} className="me-1 inline" /> Governance & Rollover (HOD)
            </button>
          </li>
        )}
      </ul>

      {/* 1. STUDENT PORTFOLIO */}
      {activeTab === 'portfolio' && portfolio && (
        <div>
          <div className="d-md-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-1">{portfolio.name} — Capstone Portfolio</h5>
              <div className="text-muted small">
                {portfolio.enrollmentNumber} • {portfolio.batch} • CGPA: <strong>{portfolio.cgpa}/10.0</strong>
              </div>
            </div>
            <a
              href={`/api/supplementary/portfolio/${portfolio.studentId}/pdf`}
              className="btn btn-primary btn-sm d-flex align-items-center mt-2 mt-md-0"
              download
            >
              <Download size={14} className="me-1" /> Export Resume-Ready Portfolio (PDF)
            </a>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="card border p-3 bg-light mb-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold text-dark mb-0">{portfolio.project.title}</h6>
                  <span className="badge bg-success">{portfolio.project.finalGrade}</span>
                </div>
                <div className="small text-muted mb-2">
                  Role: <strong>{portfolio.project.roleInTeam}</strong> • Supervisor: {portfolio.project.mentorName}
                </div>
                <p className="small text-secondary mb-3">{portfolio.project.description}</p>
                <h6 className="fw-bold small text-dark mb-2">Key Technical Benchmarks & Deliverables:</h6>
                <ul className="small text-secondary ps-3 mb-3">
                  {portfolio.project.metrics?.map((m: string, i: number) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
                <div className="d-flex gap-2">
                  <a
                    href={portfolio.project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-dark btn-sm d-flex align-items-center"
                  >
                    <FolderGit2 size={14} className="me-1" /> GitHub Repository
                  </a>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="card border p-3 bg-white">
                <h6 className="fw-bold text-dark small mb-2">Technical Skills & Competencies:</h6>
                <div className="d-flex flex-wrap gap-2">
                  {portfolio.skills?.map((s: string, i: number) => (
                    <span key={i} className="badge bg-light text-dark border px-2 py-1">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Contributions breakdown */}
            <div className="col-lg-4">
              <div className="card border p-3 bg-white h-100">
                <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center">
                  <Users size={16} className="text-primary me-2" /> Team Contribution Records
                </h6>
                <div className="small text-muted mb-3">
                  Total Logged Effort: <strong>{contributions?.totalHoursLogged} hrs</strong> across {contributions?.tasksCompletedCount} sprint tasks.
                </div>
                <div className="d-flex flex-column gap-3 small">
                  {contributions?.members?.map((mem: any, i: number) => (
                    <div key={i} className="border-bottom pb-2">
                      <div className="d-flex justify-content-between">
                        <span className="fw-semibold text-dark">{mem.name}</span>
                        <span className="text-muted">{mem.hours} hrs</span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {mem.role} • {mem.tasksDone} tasks done • {mem.commitsCount} commits
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRE-FLIGHT CHECKLIST */}
      {activeTab === 'checklist' && (
        <div>
          <h6 className="fw-bold text-dark mb-1">Capstone Defense Pre-Flight Checklist</h6>
          <p className="text-muted small mb-3">
            Ensure all prerequisites are checked off by student team, supervisor, and HOD prior to external examination defense.
          </p>

          <div className="d-flex flex-column gap-2 mb-4">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`p-3 border rounded d-flex justify-content-between align-items-center ${
                  item.isCompleted ? 'bg-success-subtle border-success-subtle' : 'bg-light'
                }`}
              >
                <div className="d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-link p-0 me-3 text-dark"
                    onClick={() => toggleCheck(item.id)}
                  >
                    {item.isCompleted ? (
                      <CheckSquare size={20} className="text-success" />
                    ) : (
                      <div className="border border-secondary rounded" style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                  <div>
                    <div className={`small fw-semibold ${item.isCompleted ? 'text-dark' : 'text-secondary'}`}>
                      {item.label}
                    </div>
                    {item.completedBy && (
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Verified by <strong>{item.completedBy}</strong> on {item.updatedAt}
                      </div>
                    )}
                  </div>
                </div>
                <span className={`badge ${
                  item.category === 'GOVERNANCE' ? 'bg-danger' :
                  item.category === 'CODE' ? 'bg-dark' :
                  item.category === 'REVIEW' ? 'bg-warning text-dark' : 'bg-primary'
                }`} style={{ fontSize: '0.7rem' }}>
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DISCUSSIONS */}
      {activeTab === 'discussions' && (
        <div>
          {/* Create Thread Form */}
          <div className="card border p-3 bg-light mb-4">
            <h6 className="fw-bold text-dark mb-2">Open New Project Discussion Thread</h6>
            <form onSubmit={createThread}>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Thread Topic (e.g. MQTT Broker vs TimescaleDB)..."
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="Discussion details, hypotheses, or architectural questions..."
                  value={newThreadContent}
                  onChange={(e) => setNewThreadContent(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm d-flex align-items-center">
                <Plus size={14} className="me-1" /> Post Discussion Thread
              </button>
            </form>
          </div>

          <h6 className="fw-bold text-dark mb-3">Project Discussion Threads ({discussions.length})</h6>
          <div className="d-flex flex-column gap-3">
            {discussions.map((d) => (
              <div key={d.id} className="card border p-3 bg-white">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="fw-bold text-dark mb-0">{d.title}</h6>
                  <span className="badge bg-secondary">{d.authorRole}</span>
                </div>
                <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                  By {d.authorName} • {new Date(d.createdAt).toLocaleString()}
                </div>
                <p className="small text-secondary mb-3">{d.content}</p>

                {/* Replies list */}
                {d.replies?.length > 0 && (
                  <div className="border-start border-3 border-primary ps-3 mb-3 d-flex flex-column gap-2">
                    {d.replies.map((r: any) => (
                      <div key={r.id} className="p-2 bg-light rounded small">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-semibold text-dark">{r.authorName} ({r.authorRole})</span>
                          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(r.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-secondary mb-0">{r.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="input-group input-group-sm">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Write a collaborative reply or note..."
                    value={replyContent[d.id] || ''}
                    onChange={(e) => setReplyContent((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => postReply(d.id)}
                  >
                    <Send size={14} className="me-1 inline" /> Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MEETING NOTES & ACTIONS */}
      {activeTab === 'meeting_notes' && (
        <div>
          <div className="card border p-3 bg-light mb-4">
            <h6 className="fw-bold text-dark mb-2">Record Mentor Meeting Minutes & Action Items</h6>
            <form onSubmit={createNote}>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Meeting Title (e.g. Sprint 4 Review with Prof. Sharma)..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="Meeting minutes, technical decisions made, and guidance..."
                  value={newNoteMinutes}
                  onChange={(e) => setNewNoteMinutes(e.target.value)}
                  required
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control form-control-sm"
                  rows={2}
                  placeholder="Action items (one per line, e.g. Fix Docker memory leak)..."
                  value={newNoteActions}
                  onChange={(e) => setNewNoteActions(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Record Meeting Minutes
              </button>
            </form>
          </div>

          <h6 className="fw-bold text-dark mb-3">Meeting Records & Action Items ({meetingNotes.length})</h6>
          <div className="d-flex flex-column gap-3">
            {meetingNotes.map((n) => (
              <div key={n.id} className="card border p-3 bg-white">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="fw-bold text-dark mb-0">{n.title}</h6>
                  <span className="badge bg-light text-muted border">{n.meetingDate}</span>
                </div>
                <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                  Recorded by {n.authorName}
                </div>
                <p className="small text-secondary mb-3">{n.minutes}</p>

                {n.actionItems?.length > 0 && (
                  <div>
                    <span className="small fw-bold text-dark">Action Items:</span>
                    <div className="d-flex flex-column gap-1 mt-1">
                      {n.actionItems.map((act: any) => (
                        <div key={act.id} className="d-flex align-items-center small p-1 bg-light rounded">
                          <button
                            type="button"
                            className="btn btn-link p-0 me-2 text-dark"
                            onClick={() => toggleAction(act.id)}
                          >
                            {act.isCompleted ? (
                              <CheckSquare size={16} className="text-success" />
                            ) : (
                              <div className="border border-secondary rounded" style={{ width: 14, height: 14 }} />
                            )}
                          </button>
                          <span className={act.isCompleted ? 'text-decoration-line-through text-muted' : 'text-dark'}>
                            {act.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. CONFLICT OF INTEREST */}
      {activeTab === 'coi' && (
        <div className="card border p-4 bg-light">
          <h5 className="fw-bold text-dark mb-2 d-flex align-items-center">
            <ShieldCheck size={20} className="text-primary me-2" />
            External Evaluator Conflict of Interest (COI) Declaration
          </h5>
          <p className="text-muted small mb-3">
            Per academic integrity policy, examiners must formally declare any commercial, research, or personal conflicts of interest with student candidates or supervising faculty prior to scoring.
          </p>

          <div className="mb-3">
            <label className="form-label small fw-bold text-dark">COI Declaration Statement:</label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              value={coiNotes}
              onChange={(e) => setCoiNotes(e.target.value)}
              disabled={coiDeclared}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-success btn-sm d-flex align-items-center"
              onClick={handleDeclareCOI}
              disabled={coiDeclared}
            >
              <CheckSquare size={14} className="me-1" /> Ratify COI Declaration
            </button>
          </div>
          {coiDeclared && (
            <div className="alert alert-success py-2 small mt-3 mb-0">
              Conflict of interest declaration recorded and logged in department audit registry.
            </div>
          )}
        </div>
      )}

      {/* 6. GOVERNANCE & ROLLOVER (HOD ONLY) */}
      {activeTab === 'governance' && currentUser?.role === 'HOD' && (
        <div>
          {/* Submission Window Controls */}
          <div className="card border p-3 bg-light mb-4">
            <h6 className="fw-bold text-dark mb-2">Proposal Submission Window Governance</h6>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="small text-muted me-2">Current Status:</span>
                <span className={`badge ${submissionWindow?.isOpen ? 'bg-success' : 'bg-danger'}`}>
                  {submissionWindow?.isOpen ? 'WINDOW OPEN' : 'WINDOW CLOSED'}
                </span>
                <div className="small text-muted mt-1">{submissionWindow?.reason}</div>
              </div>
              <button
                type="button"
                className={`btn btn-sm ${submissionWindow?.isOpen ? 'btn-outline-danger' : 'btn-outline-success'}`}
                onClick={() => toggleSubmissionWindow(!submissionWindow?.isOpen)}
              >
                {submissionWindow?.isOpen ? 'Close Window Now' : 'Open Submission Window'}
              </button>
            </div>
          </div>

          {/* Outlier & Score Discrepancies */}
          <div className="card border p-3 bg-light mb-4">
            <h6 className="fw-bold text-dark mb-1">Score Discrepancy & Moderation Engine</h6>
            <p className="small text-muted mb-3">
              Automatically flags projects where continuous mentor progress marks and external defense marks differ by more than 15%.
            </p>
            {discrepancies?.flaggedDiscrepancies?.map((item: any, i: number) => (
              <div key={i} className="p-3 bg-white border border-warning rounded">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className="fw-bold text-dark small">{item.title} ({item.teamName})</span>
                  <span className="badge bg-warning text-dark">Deviation: {item.deviationPercentage}%</span>
                </div>
                <div className="small text-secondary mb-1">
                  Mentor Mark: <strong>{item.mentorScore}</strong> • Evaluator Mark: <strong>{item.evaluatorScore}</strong> • Difference: +{item.difference} marks
                </div>
                <div className="small text-danger fw-semibold">{item.flaggedReason}</div>
              </div>
            ))}
          </div>

          {/* Bulk CSV Import Preview */}
          <div className="card border p-3 bg-light mb-4">
            <h6 className="fw-bold text-dark mb-2">Bulk CSV Student / Faculty Onboarding with Validation Preview</h6>
            <textarea
              className="form-control form-control-sm font-monospace mb-2"
              rows={4}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
            />
            <div className="d-flex gap-2">
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={handlePreviewCsv}>
                Validate & Preview CSV
              </button>
            </div>
            {csvPreview && (
              <div className="mt-3 p-2 bg-white border rounded small">
                <div className="text-success fw-bold mb-1">
                  Validated {csvPreview.validRecordsCount} rows cleanly with 0 parsing errors.
                </div>
                <table className="table table-bordered table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Enrollment</th>
                      <th>Batch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.previewRecords?.map((r: any, idx: number) => (
                      <tr key={idx}>
                        <td>{r.name}</td>
                        <td>{r.email}</td>
                        <td>{r.enrollmentNumber}</td>
                        <td>{r.batch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Academic Rollover */}
          <div className="card border p-3 bg-white">
            <h6 className="fw-bold text-danger mb-1">Academic Year & Term Rollover Tool</h6>
            <p className="small text-muted mb-3">
              Transitions the department to the next academic cycle (e.g. 2027-2028), promoting enrolled batches and archiving current projects.
            </p>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleRollover}>
              Execute Academic Rollover & Archival
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
