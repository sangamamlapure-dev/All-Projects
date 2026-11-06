import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Server, 
  Database, 
  Users, 
  GraduationCap, 
  Briefcase, 
  UserCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  LogOut, 
  LogIn, 
  Terminal, 
  Key, 
  Layers, 
  LayoutDashboard,
  GitMerge,
  FileSpreadsheet,
  Sparkles
} from 'lucide-react';
import { HodDashboard } from './components/dashboard/HodDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { MentorDashboard } from './components/dashboard/MentorDashboard';
import { EvaluatorDashboard } from './components/dashboard/EvaluatorDashboard';
import { LifecycleNavigator } from './components/lifecycle/LifecycleNavigator';
import { SharedModulesHub } from './components/shared/SharedModulesHub';
import { SupplementaryFeaturesHub } from './components/supplementary/SupplementaryFeaturesHub';
import { FullStackHub } from './components/database/FullStackHub';


interface DatabaseHealth {
  configured: boolean;
  connected: boolean;
  provider: string;
  message: string;
}

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptime: number;
  database: DatabaseHealth;
  roles: string[];
}

interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: 'HOD' | 'STUDENT' | 'PROJECT_MENTOR' | 'EXTERNAL_EVALUATOR';
  departmentId: string | null;
  departmentCode?: string;
  departmentName?: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'lifecycle' | 'shared_modules' | 'supplementary' | 'security_lab' | 'fullstack' | 'schema' | 'powershell'>('dashboard');


  // Login form state
  const [emailInput, setEmailInput] = useState<string>('hod.cse@college.edu');
  const [passwordInput, setPasswordInput] = useState<string>('Password123!');
  const [loginFeedback, setLoginFeedback] = useState<string | null>(null);
  const [securityTestResult, setSecurityTestResult] = useState<{ title: string; status: number; body: any } | null>(null);

  const seedLogins = [
    {
      role: 'HOD',
      label: 'Dr. Ramesh Kulkarni',
      roleLabel: 'HOD (Dept Admin)',
      email: 'hod.cse@college.edu',
      desc: 'Department Admin Panel: approvals, mentor workloads, result publishing',
      badge: 'bg-primary',
      icon: <ShieldCheck size={18} className="text-primary me-2" />,
    },
    {
      role: 'STUDENT',
      label: 'Aarav Deshmukh',
      roleLabel: 'Student (Team Leader)',
      email: 'student.aarav@college.edu',
      desc: 'Student Portal: proposals, milestones timeline, personal tasks board',
      badge: 'bg-success',
      icon: <GraduationCap size={18} className="text-success me-2" />,
    },
    {
      role: 'PROJECT_MENTOR',
      label: 'Prof. Sunita Sharma',
      roleLabel: 'Faculty Project Mentor',
      email: 'mentor.sharma@college.edu',
      desc: 'Mentor Dashboard: assigned project teams, reviews & feedback tracking',
      badge: 'bg-warning text-dark',
      icon: <Briefcase size={18} className="text-warning text-dark me-2" />,
    },
    {
      role: 'EXTERNAL_EVALUATOR',
      label: 'Dr. Arvind Gupta',
      roleLabel: 'External Evaluator',
      email: 'evaluator.drgupta@external.ac.in',
      desc: 'Evaluator Portal: assigned defense evaluations & standardized rubric scoring',
      badge: 'bg-info text-dark',
      icon: <UserCheck size={18} className="text-info me-2" />,
    },
  ];

  const fetchDashboardData = async (role: string) => {
    setDashboardLoading(true);
    let endpoint = '/api/dashboard/hod';
    if (role === 'STUDENT') endpoint = '/api/dashboard/student';
    else if (role === 'PROJECT_MENTOR') endpoint = '/api/dashboard/mentor';
    else if (role === 'EXTERNAL_EVALUATOR') endpoint = '/api/dashboard/evaluator';

    try {
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setDashboardLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        await fetchDashboardData(data.user.role);
      } else {
        // Auto-login as default HOD for immediate interactive experience if unauthenticated
        await handleLogin('hod.cse@college.edu', false);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: HealthData = await res.json();
        setHealth(data);
      }
      await checkAuthStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleLogin = async (emailToUse?: string, notify = true) => {
    setAuthLoading(true);
    setLoginFeedback(null);
    const targetEmail = emailToUse || emailInput;
    const targetPass = passwordInput || 'Password123!';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setCurrentUser(data.user);
      setEmailInput(targetEmail);
      if (notify) setLoginFeedback(`Authenticated as ${data.user.name} (${data.user.role})`);
      await fetchDashboardData(data.user.role);
    } catch (err: any) {
      setLoginFeedback(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setDashboardData(null);
      setLoginFeedback('Logged out successfully. Session invalidated.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container">
          <span className="navbar-brand d-flex align-items-center fw-bold">
            <span className="badge bg-primary me-2 px-2 py-1">AF</span>
            AcadFlow
          </span>
          <div className="d-flex align-items-center text-light">
            <div className="d-none d-md-flex align-items-center gap-2 me-3">
              <span className="badge bg-primary">Frontend: React 19</span>
              <span className="badge bg-success">Backend: Express 4.21</span>
              <span className="badge bg-warning text-dark">Database: 37 Entities</span>
            </div>
            {currentUser ? (


              <div className="d-flex align-items-center bg-dark border border-secondary rounded px-2 py-1">
                <span className="p-1 rounded-circle bg-success me-2" style={{ width: 8, height: 8 }} />
                <span className="small text-light me-2">{currentUser.name}</span>
                <span className={`badge ${
                  currentUser.role === 'HOD' ? 'bg-primary' :
                  currentUser.role === 'STUDENT' ? 'bg-success' :
                  currentUser.role === 'PROJECT_MENTOR' ? 'bg-warning text-dark' : 'bg-info text-dark'
                }`}>
                  {currentUser.role}
                </span>
                <button
                  type="button"
                  className="btn btn-link btn-sm text-danger p-0 ms-3"
                  onClick={handleLogout}
                  title="Log out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <span className="small text-white-50 d-flex align-items-center">
                <Lock size={14} className="me-1" /> Not Authenticated
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* Role Switcher Toolbar */}
      <div className="bg-white border-bottom py-2 shadow-xs">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center small text-muted">
              <Users size={16} className="me-2 text-primary" />
              <strong className="text-dark me-2">Switch Active Role:</strong>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {seedLogins.map((s) => (
                <button
                  key={s.email}
                  type="button"
                  className={`btn btn-sm d-flex align-items-center ${
                    currentUser?.email === s.email ? 'btn-primary shadow-sm' : 'btn-outline-secondary'
                  }`}
                  onClick={() => handleLogin(s.email)}
                  disabled={authLoading}
                >
                  <span className={`p-1 rounded-circle me-1 ${currentUser?.email === s.email ? 'bg-white' : 'bg-secondary'}`} style={{ width: 6, height: 6 }} />
                  {s.roleLabel}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <ul className="nav nav-pills small">
            <li className="nav-item">
              <button
                className={`nav-link py-1 px-3 fw-semibold ${viewMode === 'dashboard' ? 'active' : ''}`}
                onClick={() => setViewMode('dashboard')}
              >
                <LayoutDashboard size={14} className="me-1 inline" /> Active Role Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-1 px-3 fw-semibold ${viewMode === 'lifecycle' ? 'active' : ''}`}
                onClick={() => setViewMode('lifecycle')}
              >
                <GitMerge size={14} className="me-1 inline" /> Lifecycle Stepper (8 Stages)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-1 px-3 fw-semibold ${viewMode === 'shared_modules' ? 'active' : ''}`}
                onClick={() => setViewMode('shared_modules')}
              >
                <FileSpreadsheet size={14} className="me-1 inline" /> Reports & Shared Hub
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-1 px-3 fw-semibold ${viewMode === 'supplementary' ? 'active' : ''}`}
                onClick={() => setViewMode('supplementary')}
              >
                <Sparkles size={14} className="me-1 inline" /> Real-World Hub (Phase 7)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-1 px-3 fw-semibold ${viewMode === 'security_lab' ? 'active' : ''}`}
                onClick={() => setViewMode('security_lab')}
              >

                <Key size={14} className="me-1 inline" /> RBAC & Security Lab
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-1 px-3 fw-semibold ${viewMode === 'fullstack' ? 'active' : ''}`}
                onClick={() => setViewMode('fullstack')}
              >
                <Layers size={14} className="me-1 inline" /> Full-Stack Hub (Frontend • Backend • DB)
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-1 px-3 fw-semibold ${viewMode === 'schema' ? 'active' : ''}`}
                onClick={() => setViewMode('schema')}
              >
                <Database size={14} className="me-1 inline" /> Database & Schema
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-1 px-3 fw-semibold ${viewMode === 'powershell' ? 'active' : ''}`}
                onClick={() => setViewMode('powershell')}
              >
                <Terminal size={14} className="me-1 inline" /> PowerShell Guide
              </button>
            </li>
          </ul>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center"
            onClick={() => currentUser && fetchDashboardData(currentUser.role)}
            disabled={dashboardLoading}
          >
            <RefreshCw size={12} className={`me-1 ${dashboardLoading ? 'spin' : ''}`} /> Sync Dashboard
          </button>
        </div>

        {/* View Mode 1: Active Role Dashboard */}
        {viewMode === 'dashboard' && (
          <div>
            {dashboardLoading && (
              <div className="text-center py-5 text-muted bg-white border rounded">
                <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                Loading {currentUser?.role} Dashboard...
              </div>
            )}

            {!dashboardLoading && currentUser?.role === 'HOD' && (
              <HodDashboard
                data={dashboardData}
                onRefresh={() => fetchDashboardData('HOD')}
              />
            )}

            {!dashboardLoading && currentUser?.role === 'STUDENT' && (
              <StudentDashboard
                data={dashboardData}
                onRefresh={() => fetchDashboardData('STUDENT')}
              />
            )}

            {!dashboardLoading && currentUser?.role === 'PROJECT_MENTOR' && (
              <MentorDashboard
                data={dashboardData}
                onRefresh={() => fetchDashboardData('PROJECT_MENTOR')}
              />
            )}

            {!dashboardLoading && currentUser?.role === 'EXTERNAL_EVALUATOR' && (
              <EvaluatorDashboard
                data={dashboardData}
                onRefresh={() => fetchDashboardData('EXTERNAL_EVALUATOR')}
              />
            )}
          </div>
        )}

        {/* View Mode: Academic Lifecycle Stepper */}
        {viewMode === 'lifecycle' && (
          <LifecycleNavigator
            currentUser={currentUser}
            onRefresh={() => currentUser && fetchDashboardData(currentUser.role)}
          />
        )}

        {/* View Mode: Shared Modules & Reports */}
        {viewMode === 'shared_modules' && (
          <SharedModulesHub
            currentUser={currentUser}
            onRefresh={() => currentUser && fetchDashboardData(currentUser.role)}
          />
        )}

        {/* View Mode: Supplementary Real-World Hub (Phase 7) */}
        {viewMode === 'supplementary' && (
          <SupplementaryFeaturesHub
            currentUser={currentUser}
            onRefresh={() => currentUser && fetchDashboardData(currentUser.role)}
          />
        )}

        {/* View Mode: Full-Stack Architecture & Live Database Hub */}
        {viewMode === 'fullstack' && (
          <FullStackHub
            currentUser={currentUser}
            onRefresh={() => currentUser && fetchDashboardData(currentUser.role)}
          />
        )}

        {/* View Mode 2: Security & IDOR Lab */}
        {viewMode === 'security_lab' && (
          <div className="card border p-4 bg-white shadow-sm">
            <h5 className="fw-bold text-dark mb-2">Phase 8 Security Hardening & Penetration Defense Lab</h5>
            <p className="text-muted small mb-4">
              Currently logged in as <strong>{currentUser?.name}</strong> (Role: <span className="badge bg-dark">{currentUser?.role}</span>).
              Test how server-side middleware and authentication boundaries defend against OWASP vulnerabilities and unauthorized privilege escalations.
            </p>

            {/* Security Test Response Viewer */}
            {securityTestResult && (
              <div className="alert alert-secondary border shadow-xs mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-dark d-flex align-items-center">
                    <ShieldCheck size={16} className="text-primary me-2" />
                    Security Probe Result: {securityTestResult.title}
                  </span>
                  <div>
                    <span className={`badge me-2 ${
                      securityTestResult.status === 200 ? 'bg-success' :
                      securityTestResult.status === 403 ? 'bg-danger' :
                      securityTestResult.status === 429 ? 'bg-warning text-dark' : 'bg-dark'
                    }`}>
                      HTTP {securityTestResult.status}
                    </span>
                    <button
                      type="button"
                      className="btn-close btn-sm"
                      onClick={() => setSecurityTestResult(null)}
                      aria-label="Close"
                    />
                  </div>
                </div>
                <pre className="bg-dark text-light p-3 rounded small mb-0 overflow-auto" style={{ maxHeight: 200 }}>
                  {JSON.stringify(securityTestResult.body, null, 2)}
                </pre>
              </div>
            )}

            <div className="row g-3">
              <div className="col-md-6 col-lg-4">
                <div className="border rounded p-3 bg-light h-100">
                  <h6 className="fw-bold text-dark">Test 1: Department Admin RBAC</h6>
                  <p className="small text-muted mb-2"><code>GET /api/departments/dept-cse-01/summary</code></p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      const res = await fetch('/api/departments/dept-cse-01/summary');
                      const data = await res.json();
                      setSecurityTestResult({ title: 'Department Admin RBAC', status: res.status, body: data });
                    }}
                  >
                    Execute Request
                  </button>
                  <div className="small text-secondary mt-2">
                    Expected: <strong>200 OK</strong> for HOD; <strong>403 Forbidden</strong> for Student, Mentor, Evaluator.
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="border rounded p-3 bg-light h-100">
                  <h6 className="fw-bold text-dark">Test 2: Cross-Dept IDOR Attack</h6>
                  <p className="small text-muted mb-2"><code>GET /api/departments/dept-foreign-99/summary</code></p>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                      const res = await fetch('/api/departments/dept-foreign-99/summary');
                      const data = await res.json();
                      setSecurityTestResult({ title: 'Cross-Dept IDOR Attack', status: res.status, body: data });
                    }}
                  >
                    Attempt IDOR Attack
                  </button>
                  <div className="small text-secondary mt-2">
                    Expected: Always <strong>403 Forbidden</strong> due to server-side department scope isolation.
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="border rounded p-3 bg-light h-100">
                  <h6 className="fw-bold text-dark">Test 3: SQL Injection Payload</h6>
                  <p className="small text-muted mb-2"><code>POST /api/auth/login with ' OR 1=1 --</code></p>
                  <button
                    type="button"
                    className="btn btn-warning btn-sm text-dark"
                    onClick={async () => {
                      const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: "' OR 1=1 --", password: 'Password123!' }),
                      });
                      const data = await res.json();
                      setSecurityTestResult({ title: 'SQL Injection Payload', status: res.status, body: data });
                    }}
                  >
                    Inject SQL Vector
                  </button>
                  <div className="small text-secondary mt-2">
                    Expected: <strong>400 ValidationError</strong> or <strong>401 Unauthorized</strong>. No SQL execution or data leak.
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="border rounded p-3 bg-light h-100">
                  <h6 className="fw-bold text-dark">Test 4: Rate Limiter Defense</h6>
                  <p className="small text-muted mb-2">Simulate rapid burst logins (12 requests)</p>
                  <button
                    type="button"
                    className="btn btn-dark btn-sm"
                    onClick={async () => {
                      let lastStatus = 0;
                      let lastBody: any = null;
                      for (let i = 0; i < 11; i++) {
                        const r = await fetch('/api/auth/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: 'student.aarav@college.edu', password: 'WrongPassword!' }),
                        });
                        lastStatus = r.status;
                        lastBody = await r.json().catch(() => ({}));
                      }
                      setSecurityTestResult({ title: 'Rate Limiter Defense (11 rapid requests)', status: lastStatus, body: lastBody });
                    }}
                  >
                    Simulate Rapid Login Burst
                  </button>
                  <div className="small text-secondary mt-2">
                    Expected: <strong>429 Too Many Requests</strong> with <code>Retry-After</code> response header.
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="border rounded p-3 bg-light h-100">
                  <h6 className="fw-bold text-dark">Test 5: Path Traversal Attack</h6>
                  <p className="small text-muted mb-2"><code>GET /api/storage/documents/../../etc/passwd/download</code></p>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                      const res = await fetch('/api/storage/documents/..%2f..%2fetc%2fpasswd/download');
                      const data = await res.json().catch(() => ({ status: res.status }));
                      setSecurityTestResult({ title: 'Path Traversal Attack', status: res.status, body: data });
                    }}
                  >
                    Attempt Path Traversal
                  </button>
                  <div className="small text-secondary mt-2">
                    Expected: <strong>400</strong> or <strong>404</strong>. Directory isolation strictly enforced.
                  </div>
                </div>
              </div>

              <div className="col-md-6 col-lg-4">
                <div className="border rounded p-3 bg-light h-100">
                  <h6 className="fw-bold text-dark">Test 6: Privilege Escalation Attack</h6>
                  <p className="small text-muted mb-2"><code>POST /api/academic/results/proj-01/publish</code></p>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                      const res = await fetch('/api/academic/results/proj-01/publish', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ totalMarks: 100 }),
                      });
                      const data = await res.json();
                      setSecurityTestResult({ title: 'Privilege Escalation Attack', status: res.status, body: data });
                    }}
                  >
                    Attempt Privilege Escalation
                  </button>
                  <div className="small text-secondary mt-2">
                    Expected: <strong>200 OK</strong> for HOD; <strong>403 Forbidden</strong> for Student/Mentor/Evaluator.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* View Mode 3: Schema & Architecture */}
        {viewMode === 'schema' && (
          <div className="card border p-4 bg-white shadow-sm">
            <h5 className="fw-bold text-dark mb-2">MySQL 8 & Prisma Schema Architecture</h5>
            <p className="text-muted small mb-3">
              All 37 entities generated into Prisma Client and migration DDL (<code>prisma/migrations/0_init/migration.sql</code>).
            </p>

            <div className="row g-3">
              {seedLogins.map((s) => (
                <div key={s.role} className="col-md-6">
                  <div className="border rounded p-3 bg-light h-100">
                    <div className="d-flex align-items-center mb-1">
                      {s.icon}
                      <span className={`badge ${s.badge} me-2`}>{s.role}</span>
                      <strong className="text-dark small">{s.label}</strong>
                    </div>
                    <div className="text-muted small font-monospace">{s.email}</div>
                    <p className="small text-secondary mt-1 mb-0">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View Mode 4: PowerShell Guide */}
        {viewMode === 'powershell' && (
          <div className="card border p-4 bg-white shadow-sm">
            <h5 className="fw-bold text-dark mb-2">Windows PowerShell Commands for Phase 4</h5>
            <p className="text-muted small mb-3">
              Target directory: <code>C:\MYPROJECT\AcadFlow</code>
            </p>

            <div className="bg-dark text-white p-3 rounded font-monospace small">
              <div className="text-secondary"># Run all 25 automated Vitest unit & integration tests</div>
              <div>npm test</div>
              <br />
              <div className="text-secondary"># Run TypeScript lint check</div>
              <div>npm run lint</div>
              <br />
              <div className="text-secondary"># Start full-stack server</div>
              <div>npm run dev</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
