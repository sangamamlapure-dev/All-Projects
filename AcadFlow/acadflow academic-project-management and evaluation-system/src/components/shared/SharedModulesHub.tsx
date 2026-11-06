import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Award, 
  Bell, 
  Calendar, 
  ShieldCheck, 
  Download, 
  Search, 
  Megaphone, 
  Check, 
  Clock, 
  RefreshCw,
  FolderOpen,
  Upload,
  CheckCircle2,
  Trash2,
  Pin,
  ListTodo,
  AlertCircle,
  FileCheck2,
  Plus
} from 'lucide-react';

interface SharedProps {
  currentUser: any;
  onRefresh: () => void;
}

export function SharedModulesHub({ currentUser, onRefresh }: SharedProps) {
  const [subTab, setSubTab] = useState<'reports' | 'storage' | 'notifications' | 'announcements' | 'calendar' | 'reminders' | 'corrections' | 'audit'>('reports');
  
  // Data states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifFilter, setNotifFilter] = useState<string>('ALL');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [projectDocs, setProjectDocs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchAudit, setSearchAudit] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Announcement form
  const [newAnnTitle, setNewAnnTitle] = useState<string>('');
  const [newAnnContent, setNewAnnContent] = useState<string>('');
  const [newAnnPinned, setNewAnnPinned] = useState<boolean>(true);

  // Reminder form
  const [newRemTitle, setNewRemTitle] = useState<string>('');
  const [newRemDate, setNewRemDate] = useState<string>('2026-11-25');

  // Document upload form
  const [uploadDocTitle, setUploadDocTitle] = useState<string>('System Test & Benchmark Report');
  const [uploading, setUploading] = useState<boolean>(false);

  // Correction workflow form
  const [correctionNote, setCorrectionNote] = useState<string>('Latency comparisons under 95th percentile load plotted in Fig 4.2 of revised report.');
  const [correctionResolved, setCorrectionResolved] = useState<boolean>(false);

  const fetchSharedData = async () => {
    setLoading(true);
    try {
      const [notifRes, annRes, calRes, remRes, docsRes] = await Promise.all([
        fetch('/api/notifications'),
        fetch('/api/announcements'),
        fetch('/api/calendar/events'),
        fetch('/api/reminders'),
        fetch('/api/storage/projects/proj-01/documents'),
      ]);

      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.notifications || []);
      }
      if (annRes.ok) {
        const data = await annRes.json();
        setAnnouncements(data.announcements || []);
      }
      if (calRes.ok) {
        const data = await calRes.json();
        setCalendarEvents(data.events || []);
      }
      if (remRes.ok) {
        const data = await remRes.json();
        setReminders(data.reminders || []);
      }
      if (docsRes.ok) {
        const data = await docsRes.json();
        setProjectDocs(data.documents || []);
      }
      if (currentUser?.role === 'HOD') {
        const auditRes = await fetch('/api/audit-logs?limit=50');
        if (auditRes.ok) {
          const data = await auditRes.json();
          setAuditLogs(data.logs || []);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedData();
  }, [currentUser]);

  // Notifications
  const markNotificationRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-all-read', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setStatusMsg('All notifications marked as read.');
  };

  // Announcements
  const publishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle || !newAnnContent) return;
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newAnnTitle, content: newAnnContent, isPinned: newAnnPinned }),
      });
      if (res.ok) {
        setNewAnnTitle('');
        setNewAnnContent('');
        setStatusMsg('Announcement published successfully.');
        fetchSharedData();
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const togglePin = async (id: string) => {
    await fetch(`/api/announcements/${id}/toggle-pin`, { method: 'POST' });
    fetchSharedData();
  };

  const deleteAnnouncement = async (id: string) => {
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    fetchSharedData();
  };

  // Reminders
  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRemTitle) return;
    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newRemTitle, dueDate: newRemDate }),
      });
      if (res.ok) {
        setNewRemTitle('');
        setStatusMsg('Personal reminder created.');
        fetchSharedData();
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const toggleReminder = async (id: string) => {
    await fetch(`/api/reminders/${id}/resolve`, { method: 'POST' });
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isResolved: !r.isResolved } : r)));
  };

  // Document Upload (Mock/Demo or Real)
  const handleUploadSampleDoc = async () => {
    setUploading(true);
    setStatusMsg(null);
    try {
      const sampleBlob = new Blob(['%PDF-1.4\n% AcadFlow Test Sample Document Content\n%%EOF'], { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('title', uploadDocTitle);
      formData.append('file', sampleBlob, `${uploadDocTitle.replace(/\s+/g, '_')}.pdf`);

      const res = await fetch('/api/storage/projects/proj-01/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setStatusMsg(`Document "${uploadDocTitle}" uploaded securely with randomized opaque storage key.`);
      fetchSharedData();
    } catch (err: any) {
      setStatusMsg(`Upload Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Correction workflow
  const handleSubmitCorrection = async () => {
    try {
      const res = await fetch('/api/academic/feedback/fb-01/submit-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: correctionNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatusMsg('Correction resolution notes submitted to faculty mentor.');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const handleVerifyCorrection = async () => {
    try {
      const res = await fetch('/api/academic/feedback/fb-01/verify-correction', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setCorrectionResolved(true);
      setStatusMsg('Mentor verified and closed required student correction.');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'UNREAD') return !n.isRead;
    if (notifFilter === 'APPROVAL') return n.type === 'APPROVAL';
    if (notifFilter === 'DEADLINE') return n.type === 'DEADLINE';
    return true;
  });

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4">
      {/* Top Banner */}
      <div className="d-md-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <div className="d-flex align-items-center">
            <span className="badge bg-secondary px-3 py-2 fs-6 me-2 d-flex align-items-center">
              Shared Modules & System Operations
            </span>
            <span className="text-muted small">Phase 6: Reporting, Private Storage, Alerts & Governance</span>
          </div>
          <p className="text-muted small mt-1 mb-0">
            Export formatted PDF/Excel marksheets, manage private document versions, maintain academic deadlines, and review immutable security audit events.
          </p>
        </div>
        <div className="mt-3 mt-md-0 d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center"
            onClick={fetchSharedData}
            disabled={loading}
          >
            <RefreshCw size={14} className={`me-1 ${loading ? 'spin' : ''}`} /> Refresh All
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="alert alert-info py-2 small mb-4 d-flex justify-content-between align-items-center" role="alert">
          <div>{statusMsg}</div>
          <button type="button" className="btn-close btn-close-sm" onClick={() => setStatusMsg(null)} />
        </div>
      )}

      {/* Sub-Tabs */}
      <ul className="nav nav-pills mb-4 border-bottom pb-2 flex-wrap gap-1">
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${subTab === 'reports' ? 'active' : ''}`}
            onClick={() => setSubTab('reports')}
          >
            <FileSpreadsheet size={15} className="me-1 inline" /> PDF & Excel Reports
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${subTab === 'storage' ? 'active' : ''}`}
            onClick={() => setSubTab('storage')}
          >
            <FolderOpen size={15} className="me-1 inline" /> Private Document Storage
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${subTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setSubTab('notifications')}
          >
            <Bell size={15} className="me-1 inline" /> Notifications ({notifications.filter((n) => !n.isRead).length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${subTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setSubTab('announcements')}
          >
            <Megaphone size={15} className="me-1 inline" /> Announcements
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${subTab === 'calendar' ? 'active' : ''}`}
            onClick={() => setSubTab('calendar')}
          >
            <Calendar size={15} className="me-1 inline" /> Term Calendar
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${subTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setSubTab('reminders')}
          >
            <ListTodo size={15} className="me-1 inline" /> Reminders ({reminders.filter((r) => !r.isResolved).length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn-sm py-1 px-3 fw-semibold ${subTab === 'corrections' ? 'active' : ''}`}
            onClick={() => setSubTab('corrections')}
          >
            <FileCheck2 size={15} className="me-1 inline" /> Feedback & Corrections
          </button>
        </li>
        {currentUser?.role === 'HOD' && (
          <li className="nav-item">
            <button
              className={`nav-link btn-sm py-1 px-3 fw-semibold ${subTab === 'audit' ? 'active' : ''}`}
              onClick={() => setSubTab('audit')}
            >
              <ShieldCheck size={15} className="me-1 inline" /> Audit Trail & CSV
            </button>
          </li>
        )}
      </ul>

      {/* 1. REPORTS CENTER */}
      {subTab === 'reports' && (
        <div>
          <div className="d-md-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-1">Official Academic Reports & Document Generation</h6>
              <p className="text-muted small mb-0">
                Generated dynamically on server with <strong>PDFKit</strong> and <strong>ExcelJS</strong> based on authoritative database metrics:
              </p>
            </div>
          </div>

          <div className="row g-3">
            {/* Project Summary PDF */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border p-3 bg-light">
                <div className="d-flex align-items-center mb-2">
                  <FileText className="text-danger me-2" size={24} />
                  <div>
                    <div className="fw-bold text-dark small">Project Summary (PDF)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Engine: PDFKit (A4 Portrait)</div>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Comprehensive breakdown of student roster, approved proposal abstract, supervisor, and milestone progress.
                </p>
                <a
                  href="/api/reports/project-summary/proj-01/pdf"
                  className="btn btn-outline-danger btn-sm mt-auto d-flex align-items-center justify-content-center"
                  download
                >
                  <Download size={14} className="me-1" /> Download Summary PDF
                </a>
              </div>
            </div>

            {/* Defense Score Sheet PDF */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border p-3 bg-light">
                <div className="d-flex align-items-center mb-2">
                  <Award className="text-info me-2" size={24} />
                  <div>
                    <div className="fw-bold text-dark small">Evaluation Defense Sheet (PDF)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Engine: PDFKit (Rubric Breakdown)</div>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Standardized rubric scores across 4 weighted criteria with examiner remarks and formal signoff blocks.
                </p>
                <a
                  href="/api/reports/evaluation-sheet/eval-01/pdf"
                  className="btn btn-outline-info btn-sm text-dark mt-auto d-flex align-items-center justify-content-center"
                  download
                >
                  <Download size={14} className="me-1" /> Download Score Sheet PDF
                </a>
              </div>
            </div>

            {/* Completion Certificate PDF */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border p-3 bg-light">
                <div className="d-flex align-items-center mb-2">
                  <Award className="text-primary me-2" size={24} />
                  <div>
                    <div className="fw-bold text-dark small">Completion Certificate (PDF)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Engine: PDFKit (A4 Landscape)</div>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Official graduation capstone project completion certificate with department borders and endorsements.
                </p>
                <a
                  href="/api/reports/certificate/proj-01/pdf"
                  className="btn btn-outline-primary btn-sm mt-auto d-flex align-items-center justify-content-center"
                  download
                >
                  <Download size={14} className="me-1" /> Download Certificate PDF
                </a>
              </div>
            </div>

            {/* Projects Catalog Excel */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border p-3 bg-light">
                <div className="d-flex align-items-center mb-2">
                  <FileSpreadsheet className="text-success me-2" size={24} />
                  <div>
                    <div className="fw-bold text-dark small">Projects Catalog (Excel)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Engine: ExcelJS (.xlsx)</div>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Department-wide project spreadsheet listing teams, leaders, mentors, technologies, and status.
                </p>
                <a
                  href="/api/reports/department-catalog/excel"
                  className="btn btn-outline-success btn-sm mt-auto d-flex align-items-center justify-content-center"
                  download
                >
                  <Download size={14} className="me-1" /> Download Projects .xlsx
                </a>
              </div>
            </div>

            {/* Submissions Matrix Excel */}
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border p-3 bg-light">
                <div className="d-flex align-items-center mb-2">
                  <FileSpreadsheet className="text-success me-2" size={24} />
                  <div>
                    <div className="fw-bold text-dark small">Submissions Audit Matrix (Excel)</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Engine: ExcelJS (.xlsx)</div>
                  </div>
                </div>
                <p className="small text-secondary mb-3">
                  Audit matrix of deliverables across all stages, with uploader timestamps, versions, and sizes.
                </p>
                <a
                  href="/api/reports/submissions-matrix/excel"
                  className="btn btn-outline-success btn-sm mt-auto d-flex align-items-center justify-content-center"
                  download
                >
                  <Download size={14} className="me-1" /> Download Submissions .xlsx
                </a>
              </div>
            </div>

            {/* HOD Administrative Reports */}
            {currentUser?.role === 'HOD' && (
              <>
                <div className="col-md-6 col-lg-4">
                  <div className="card h-100 border p-3 bg-light">
                    <div className="d-flex align-items-center mb-2">
                      <FileSpreadsheet className="text-success me-2" size={24} />
                      <div>
                        <div className="fw-bold text-dark small">Mentor Workload Distribution (Excel)</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>HOD Administrative Export</div>
                      </div>
                    </div>
                    <p className="small text-secondary mb-3">
                      Allocation balances, maximum quotas, and capacity utilization percentages across faculty mentors.
                    </p>
                    <a
                      href="/api/reports/mentor-workload/excel"
                      className="btn btn-outline-success btn-sm mt-auto d-flex align-items-center justify-content-center"
                      download
                    >
                      <Download size={14} className="me-1" /> Download Workload .xlsx
                    </a>
                  </div>
                </div>

                <div className="col-md-6 col-lg-4">
                  <div className="card h-100 border p-3 bg-light">
                    <div className="d-flex align-items-center mb-2">
                      <FileText className="text-danger me-2" size={24} />
                      <div>
                        <div className="fw-bold text-dark small">Official Department Marksheet (PDF)</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>HOD Moderation Ratified</div>
                      </div>
                    </div>
                    <p className="small text-secondary mb-3">
                      Official department marksheet with total scores, moderated marks, and final letter grades.
                    </p>
                    <a
                      href="/api/reports/department-marksheet/pdf"
                      className="btn btn-outline-danger btn-sm mt-auto d-flex align-items-center justify-content-center"
                      download
                    >
                      <Download size={14} className="me-1" /> Download Marksheet PDF
                    </a>
                  </div>
                </div>

                <div className="col-md-6 col-lg-4">
                  <div className="card h-100 border p-3 bg-light">
                    <div className="d-flex align-items-center mb-2">
                      <FileSpreadsheet className="text-success me-2" size={24} />
                      <div>
                        <div className="fw-bold text-dark small">Consolidated Marksheet (Excel)</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Tabular Marks & Grades (.xlsx)</div>
                      </div>
                    </div>
                    <p className="small text-secondary mb-3">
                      Full department capstone marksheet in Excel format with student details and grade distributions.
                    </p>
                    <a
                      href="/api/reports/department-marksheet/excel"
                      className="btn btn-outline-success btn-sm mt-auto d-flex align-items-center justify-content-center"
                      download
                    >
                      <Download size={14} className="me-1" /> Download Marksheet .xlsx
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. PRIVATE FILE STORAGE & ARCHIVE */}
      {subTab === 'storage' && (
        <div>
          <h6 className="fw-bold text-dark mb-2">Private Document Storage & Authorized File Streaming</h6>
          <p className="text-muted small mb-3">
            Uploaded files are stored outside public directories with cryptographically randomized UUID storage keys, MIME validation, and authorization streaming checks (no predictable URLs).
          </p>

          {/* Interactive Upload Box */}
          <div className="card border p-3 bg-light mb-4">
            <h6 className="fw-bold text-dark small mb-2 d-flex align-items-center">
              <Upload size={16} className="text-primary me-2" /> Upload New Project Deliverable
            </h6>
            <div className="row g-2 align-items-center">
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Document Title (e.g. System Test & Benchmark Report)"
                  value={uploadDocTitle}
                  onChange={(e) => setUploadDocTitle(e.target.value)}
                />
              </div>
              <div className="col-md-5 d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm flex-grow-1 d-flex align-items-center justify-content-center"
                  onClick={handleUploadSampleDoc}
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="spinner-border spinner-border-sm me-1" role="status" />
                  ) : (
                    <Upload size={14} className="me-1" />
                  )}
                  Upload Sample Document (PDF)
                </button>
              </div>
            </div>
            <div className="form-text small mt-1">
              Enforces strict 25MB ceiling, SHA256 checksum generation, and extension verification (PDF, DOCX, PPTX, XLSX, ZIP).
            </div>
          </div>

          {/* Document Archive Table */}
          <h6 className="fw-bold text-dark small mb-2">Stored Project Documents & Revisions ({projectDocs.length})</h6>
          <div className="table-responsive">
            <table className="table table-bordered align-middle table-sm">
              <thead className="table-light small">
                <tr>
                  <th>Document Title</th>
                  <th>Version</th>
                  <th>Original Filename</th>
                  <th>Size</th>
                  <th>Uploaded By</th>
                  <th>Checksum (SHA256)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {projectDocs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <span className="fw-semibold text-dark">{doc.title}</span>
                    </td>
                    <td><span className="badge bg-secondary">v{doc.versionNumber}</span></td>
                    <td><code>{doc.fileName}</code></td>
                    <td>{(doc.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</td>
                    <td>{doc.uploadedBy}</td>
                    <td className="font-monospace text-muted" style={{ fontSize: '0.7rem' }}>
                      {doc.checksumSha256?.substring(0, 16)}...
                    </td>
                    <td>
                      <a
                        href={`/api/storage/documents/${doc.id}/download`}
                        className="btn btn-outline-primary btn-sm py-0 px-2"
                        download
                        title="Authorized stream download"
                      >
                        <Download size={12} className="me-1" /> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. IN-APP NOTIFICATIONS */}
      {subTab === 'notifications' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark small">Filter:</span>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 ${notifFilter === 'ALL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setNotifFilter('ALL')}
              >
                All
              </button>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 ${notifFilter === 'UNREAD' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setNotifFilter('UNREAD')}
              >
                Unread
              </button>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 ${notifFilter === 'APPROVAL' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setNotifFilter('APPROVAL')}
              >
                Approvals
              </button>
              <button
                type="button"
                className={`btn btn-sm py-0 px-2 ${notifFilter === 'DEADLINE' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setNotifFilter('DEADLINE')}
              >
                Deadlines
              </button>
            </div>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={markAllRead}
            >
              Mark All Read
            </button>
          </div>

          <div className="d-flex flex-column gap-2">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border rounded d-flex justify-content-between align-items-center ${
                    n.isRead ? 'bg-light' : 'bg-primary-subtle border-primary-subtle'
                  }`}
                >
                  <div>
                    <div className="d-flex align-items-center mb-1">
                      <span className="fw-semibold text-dark small me-2">{n.title}</span>
                      <span className={`badge ${
                        n.type === 'APPROVAL' ? 'bg-success' :
                        n.type === 'DEADLINE' ? 'bg-warning text-dark' : 'bg-secondary'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {n.type}
                      </span>
                    </div>
                    <div className="text-secondary small">{n.message}</div>
                    <div className="text-muted mt-1" style={{ fontSize: '0.7rem' }}>
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!n.isRead && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm py-1 px-2"
                      style={{ fontSize: '0.75rem' }}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted bg-light border rounded">
                No notifications matching current filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ANNOUNCEMENTS */}
      {subTab === 'announcements' && (
        <div>
          {currentUser?.role === 'HOD' && (
            <div className="card border p-3 bg-light mb-4">
              <h6 className="fw-bold text-dark mb-2">Publish Department Announcement</h6>
              <form onSubmit={publishAnnouncement}>
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Announcement Title..."
                    value={newAnnTitle}
                    onChange={(e) => setNewAnnTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-2">
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    placeholder="Announcement content..."
                    value={newAnnContent}
                    onChange={(e) => setNewAnnContent(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="form-check form-check-inline small">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="pinCheck"
                      checked={newAnnPinned}
                      onChange={(e) => setNewAnnPinned(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="pinCheck">Pin to top of board</label>
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Publish to Department
                  </button>
                </div>
              </form>
            </div>
          )}

          <h6 className="fw-bold text-dark mb-3">Active Department Announcements</h6>
          <div className="d-flex flex-column gap-3">
            {announcements.map((a) => (
              <div key={a.id} className="card border p-3 bg-white">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <h6 className="fw-bold text-dark mb-0">{a.title}</h6>
                  <div className="d-flex align-items-center gap-1">
                    {a.isPinned && <span className="badge bg-warning text-dark"><Pin size={10} className="me-1 inline" /> PINNED</span>}
                    {currentUser?.role === 'HOD' && (
                      <>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm py-0 px-1"
                          onClick={() => togglePin(a.id)}
                          title="Toggle Pin"
                        >
                          <Pin size={12} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm py-0 px-1"
                          onClick={() => deleteAnnouncement(a.id)}
                          title="Delete announcement"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
                  By {a.authorName} ({a.authorRole}) • {new Date(a.createdAt).toLocaleDateString()}
                </div>
                <p className="small text-secondary mb-0">{a.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. ACADEMIC CALENDAR */}
      {subTab === 'calendar' && (
        <div>
          <h6 className="fw-bold text-dark mb-3">Academic Term Calendar & Defense Deadlines</h6>
          <div className="row g-3">
            {calendarEvents.map((e) => (
              <div key={e.id} className="col-md-6">
                <div className="border rounded p-3 bg-light h-100">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold text-dark small">{e.title}</span>
                    <span className={`badge ${
                      e.category === 'DEADLINE' ? 'bg-danger' :
                      e.category === 'REVIEW' ? 'bg-primary' :
                      e.category === 'PRESENTATION' ? 'bg-info text-dark' : 'bg-success'
                    }`}>
                      {e.category}
                    </span>
                  </div>
                  <div className="small text-muted mb-2">
                    <Clock size={12} className="me-1 inline" /> {e.startDate} {e.endDate !== e.startDate && `to ${e.endDate}`}
                  </div>
                  <p className="small text-secondary mb-0">{e.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. PERSONAL REMINDERS */}
      {subTab === 'reminders' && (
        <div>
          <h6 className="fw-bold text-dark mb-2">Personal Academic Reminders & Checklist</h6>
          <p className="text-muted small mb-3">
            Set personal study, implementation, and dissertation deadlines synchronized with your authenticated profile.
          </p>

          {/* Create Reminder Form */}
          <form onSubmit={addReminder} className="card border p-3 bg-light mb-4">
            <div className="row g-2 align-items-center">
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Reminder Title (e.g. Complete load test graphs)..."
                  value={newRemTitle}
                  onChange={(e) => setNewRemTitle(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={newRemDate}
                  onChange={(e) => setNewRemDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center">
                  <Plus size={14} className="me-1" /> Add
                </button>
              </div>
            </div>
          </form>

          {/* Reminders List */}
          <div className="d-flex flex-column gap-2">
            {reminders.map((rem) => (
              <div
                key={rem.id}
                className="p-3 border rounded bg-white d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <button
                    type="button"
                    className="btn btn-link p-0 me-3 text-dark"
                    onClick={() => toggleReminder(rem.id)}
                  >
                    {rem.isResolved ? (
                      <CheckCircle2 size={20} className="text-success" />
                    ) : (
                      <div className="border border-secondary rounded" style={{ width: 18, height: 18 }} />
                    )}
                  </button>
                  <div>
                    <span className={`small fw-semibold ${rem.isResolved ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>
                      {rem.title}
                    </span>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Due Date: <strong>{rem.dueDate}</strong>
                    </div>
                  </div>
                </div>
                <span className={`badge ${rem.isResolved ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {rem.isResolved ? 'Resolved' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. FEEDBACK & CORRECTIONS WORKFLOW */}
      {subTab === 'corrections' && (
        <div>
          <h6 className="fw-bold text-dark mb-2">Mentor Review Feedback & Student Corrections Resolution</h6>
          <p className="text-muted small mb-3">
            Facilitates the formal loop between supervisor review remarks, student correction evidence submissions, and mentor sign-offs.
          </p>

          <div className="card border p-4 bg-light">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 className="fw-bold text-dark mb-1">Feedback Item #FB-01 (Midterm Progress Review)</h6>
                <div className="small text-muted">
                  Supervisor: <strong>Prof. Sunita Sharma</strong> • Project: <strong>Distributed IoT Fleet Telemetry</strong>
                </div>
              </div>
              <span className={`badge ${correctionResolved ? 'bg-success' : 'bg-warning text-dark'}`}>
                {correctionResolved ? 'CORRECTION_VERIFIED' : 'PENDING_VERIFICATION'}
              </span>
            </div>

            <div className="p-3 bg-white border rounded mb-3">
              <span className="small text-muted fw-bold">Required Student Correction:</span>
              <p className="small text-dark mb-0 mt-1">
                "Include latency graphs comparing edge anomaly clustering against central cloud MQTT broker baseline under 95th percentile load."
              </p>
            </div>

            {/* Student action */}
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">Student Resolution Notes & Evidence:</label>
              <textarea
                className="form-control form-control-sm"
                rows={2}
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
                disabled={correctionResolved}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-primary btn-sm d-flex align-items-center"
                onClick={handleSubmitCorrection}
                disabled={correctionResolved}
              >
                <Check size={14} className="me-1" /> Submit Correction Proof (Student)
              </button>
              {(currentUser?.role === 'PROJECT_MENTOR' || currentUser?.role === 'HOD') && (
                <button
                  type="button"
                  className="btn btn-success btn-sm d-flex align-items-center"
                  onClick={handleVerifyCorrection}
                  disabled={correctionResolved}
                >
                  <FileCheck2 size={14} className="me-1" /> Ratify & Close Correction (Mentor/HOD)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. AUDIT LOGS & CSV EXPORT */}
      {subTab === 'audit' && currentUser?.role === 'HOD' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="fw-bold text-dark mb-0">Department Security Audit Log Explorer</h6>
              <div className="text-muted small">Immutable administrative event stream</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ width: 220 }}>
                <span className="input-group-text"><Search size={14} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Filter logs..."
                  value={searchAudit}
                  onChange={(e) => setSearchAudit(e.target.value)}
                />
              </div>
              <a
                href="/api/audit-logs/export/csv"
                className="btn btn-outline-success btn-sm d-flex align-items-center"
                download
              >
                <Download size={14} className="me-1" /> Export CSV
              </a>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-sm align-middle">
              <thead className="table-light small">
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Actor</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody className="small font-monospace">
                {auditLogs
                  .filter((l) => !searchAudit || l.details?.toLowerCase().includes(searchAudit.toLowerCase()) || l.action?.toLowerCase().includes(searchAudit.toLowerCase()))
                  .map((log) => (
                    <tr key={log.id}>
                      <td className="text-muted">{new Date(log.timestamp).toLocaleString()}</td>
                      <td><span className="badge bg-dark">{log.action}</span></td>
                      <td>{log.resource}</td>
                      <td>{log.actorName}</td>
                      <td className="text-secondary">{log.details}</td>
                      <td className="text-muted">{log.ipAddress}</td>
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
