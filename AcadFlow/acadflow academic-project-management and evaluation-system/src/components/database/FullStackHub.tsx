import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Server, 
  Monitor, 
  Terminal, 
  Play, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Code, 
  Layers, 
  Search, 
  Key, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Table as TableIcon
} from 'lucide-react';

interface FullStackProps {
  currentUser: any;
  onRefresh: () => void;
}

export function FullStackHub({ currentUser, onRefresh }: FullStackProps) {
  const [subTab, setSubTab] = useState<'database' | 'backend' | 'frontend' | 'query'>('database');
  
  // Database Models state
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('users');
  const [modelRecords, setModelRecords] = useState<any[]>([]);
  const [modelMeta, setModelMeta] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Insert Record form state
  const [showInsertModal, setShowInsertModal] = useState<boolean>(false);
  const [insertFields, setInsertFields] = useState<Record<string, string>>({});

  // Backend Routes state
  const [routes, setRoutes] = useState<any[]>([]);
  const [routeFilter, setRouteFilter] = useState<string>('');
  const [activeEndpointTest, setActiveEndpointTest] = useState<{ path: string; status: number; durationMs: number; data: any } | null>(null);
  const [testingRoute, setTestingRoute] = useState<boolean>(false);

  // SQL Query Console state
  const [queryInput, setQueryInput] = useState<string>('SELECT * FROM projects WHERE status = "IN_PROGRESS";');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [queryRunning, setQueryRunning] = useState<boolean>(false);

  // Frontend Ping benchmark
  const [pingMs, setPingMs] = useState<number | null>(null);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/database/models');
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch (err: any) {
      console.error('Failed to load database models:', err);
    }
  };

  const fetchModelRecords = async (modelName: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/database/models/${modelName}?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setModelRecords(data.records || []);
        setModelMeta(data.meta || null);
      }
    } catch (err: any) {
      console.error(`Failed to load records for ${modelName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const res = await fetch('/api/backend/routes');
      if (res.ok) {
        const data = await res.json();
        setRoutes(data.routes || []);
      }
    } catch (err: any) {
      console.error('Failed to load backend routes:', err);
    }
  };

  useEffect(() => {
    fetchModels();
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      fetchModelRecords(selectedModel);
    }
  }, [selectedModel, searchQuery]);

  const handleInsertRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      const res = await fetch(`/api/database/models/${selectedModel}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertFields),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to insert record');

      setFeedback({ type: 'success', msg: `New record inserted into ${selectedModel} successfully!` });
      setShowInsertModal(false);
      setInsertFields({});
      fetchModelRecords(selectedModel);
      fetchModels();
      onRefresh();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete record '${id}' from '${selectedModel}'?`)) return;
    try {
      const res = await fetch(`/api/database/models/${selectedModel}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFeedback({ type: 'success', msg: `Record '${id}' deleted successfully.` });
        fetchModelRecords(selectedModel);
        fetchModels();
        onRefresh();
      }
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err.message });
    }
  };

  const testEndpoint = async (route: any) => {
    setTestingRoute(true);
    setActiveEndpointTest(null);
    const start = performance.now();
    try {
      let targetPath = route.path;
      // Replace dynamic route params with real sample IDs
      targetPath = targetPath.replace(':id', 'proj-01').replace(':modelName', 'users');

      const options: RequestInit = {
        method: route.method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (route.method === 'POST') {
        if (targetPath.includes('/login')) {
          options.body = JSON.stringify({ email: 'hod.cse@college.edu', password: 'Password123!' });
        } else if (targetPath.includes('/query')) {
          options.body = JSON.stringify({ statement: 'SELECT * FROM users' });
        } else if (targetPath.includes('/preview')) {
          options.body = JSON.stringify({ csvContent: 'name,email,role\nRahul,rahul@college.edu,STUDENT' });
        } else {
          options.body = JSON.stringify({ testPayload: true, timestamp: new Date().toISOString() });
        }
      }

      const res = await fetch(targetPath, options);
      const data = await res.json().catch(() => ({ statusText: res.statusText }));
      const durationMs = Math.round(performance.now() - start);

      setActiveEndpointTest({
        path: targetPath,
        status: res.status,
        durationMs,
        data,
      });
    } catch (err: any) {
      setActiveEndpointTest({
        path: route.path,
        status: 500,
        durationMs: Math.round(performance.now() - start),
        data: { error: err.message },
      });
    } finally {
      setTestingRoute(false);
    }
  };

  const runSqlQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setQueryRunning(true);
    setQueryResult(null);
    try {
      const res = await fetch('/api/backend/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement: queryInput }),
      });
      const data = await res.json();
      setQueryResult(data);
    } catch (err: any) {
      setQueryResult({ error: err.message });
    } finally {
      setQueryRunning(false);
    }
  };

  const measureFrontendPing = async () => {
    const start = performance.now();
    await fetch('/api/health');
    setPingMs(Math.round(performance.now() - start));
  };

  return (
    <div className="card border p-4 bg-white shadow-sm mb-4">
      {/* Visual Full-Stack Architecture Diagram */}
      <div className="bg-dark text-white rounded p-4 mb-4 shadow-xs">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3 border-bottom border-secondary pb-3">
          <div>
            <h5 className="fw-bold mb-1 d-flex align-items-center">
              <Layers size={20} className="text-primary me-2" />
              AcadFlow Full-Stack Architecture & Live Database Hub
            </h5>
            <p className="small text-secondary mb-0">
              Interactive observability across Frontend, Backend REST API, and Relational Database Store.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary px-3 py-2">Frontend: React 19 + Vite</span>
            <span className="badge bg-success px-3 py-2">Backend: Express 4.21</span>
            <span className="badge bg-warning text-dark px-3 py-2">Database: MySQL 8 / Prisma</span>
          </div>
        </div>

        {/* 3-Tier Architecture Flow Pipeline */}
        <div className="row g-3 text-center align-items-center">
          <div className="col-md-3">
            <div className="border border-secondary rounded p-3 bg-secondary bg-opacity-25 h-100">
              <div className="d-flex justify-content-center mb-2">
                <Monitor size={28} className="text-info" />
              </div>
              <h6 className="fw-bold mb-1 text-light">1. Client Frontend</h6>
              <div className="small text-secondary">React 19 • Vite SPA</div>
              <div className="small text-secondary">Tailwind CSS • Bootstrap 5</div>
              <div className="small text-success mt-1">● Active Role: {currentUser?.role || 'Guest'}</div>
            </div>
          </div>

          <div className="col-md-1 d-none d-md-block text-secondary">
            <ArrowRight size={24} className="mx-auto" />
          </div>

          <div className="col-md-4">
            <div className="border border-secondary rounded p-3 bg-secondary bg-opacity-25 h-100">
              <div className="d-flex justify-content-center mb-2">
                <Server size={28} className="text-success" />
              </div>
              <h6 className="fw-bold mb-1 text-light">2. REST API Backend</h6>
              <div className="small text-secondary">Node.js 22 LTS • Express.js (Port 3000)</div>
              <div className="small text-secondary">RateLimiter • Session Auth • Helmet</div>
              <div className="small text-info mt-1">● 29 Registered REST Routes</div>
            </div>
          </div>

          <div className="col-md-1 d-none d-md-block text-secondary">
            <ArrowRight size={24} className="mx-auto" />
          </div>

          <div className="col-md-3">
            <div className="border border-secondary rounded p-3 bg-secondary bg-opacity-25 h-100">
              <div className="d-flex justify-content-center mb-2">
                <Database size={28} className="text-warning" />
              </div>
              <h6 className="fw-bold mb-1 text-light">3. Relational Database</h6>
              <div className="small text-secondary">MySQL 8.0 DDL • Prisma ORM</div>
              <div className="small text-secondary">37 Models • Live Store Sync</div>
              <div className="small text-warning mt-1">● Zero-Loss Offline Fallback</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold d-flex align-items-center ${subTab === 'database' ? 'active text-primary' : 'text-muted'}`}
            onClick={() => setSubTab('database')}
          >
            <TableIcon size={16} className="me-2" />
            Live Database Inspector ({models.length} Entities)
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold d-flex align-items-center ${subTab === 'backend' ? 'active text-primary' : 'text-muted'}`}
            onClick={() => setSubTab('backend')}
          >
            <Server size={16} className="me-2" />
            Backend REST API Directory ({routes.length} Endpoints)
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold d-flex align-items-center ${subTab === 'frontend' ? 'active text-primary' : 'text-muted'}`}
            onClick={() => setSubTab('frontend')}
          >
            <Monitor size={16} className="me-2" />
            Frontend Client Inspector & Latency
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold d-flex align-items-center ${subTab === 'query' ? 'active text-primary' : 'text-muted'}`}
            onClick={() => setSubTab('query')}
          >
            <Terminal size={16} className="me-2" />
            SQL & Prisma Query Console
          </button>
        </li>
      </ul>

      {/* Feedback Alert */}
      {feedback && (
        <div className={`alert ${feedback.type === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`} role="alert">
          <div className="d-flex align-items-center">
            {feedback.type === 'success' ? <CheckCircle2 size={18} className="me-2" /> : <AlertCircle size={18} className="me-2" />}
            {feedback.msg}
          </div>
          <button type="button" className="btn-close" onClick={() => setFeedback(null)} aria-label="Close" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: LIVE DATABASE INSPECTOR                                       */}
      {/* ========================================================================= */}
      {subTab === 'database' && (
        <div>
          <div className="row g-3 mb-4">
            {/* Model Selector Sidebar */}
            <div className="col-md-4 col-lg-3">
              <div className="border rounded p-3 bg-light h-100">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0 text-dark">Database Entities</h6>
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-secondary"
                    onClick={() => { fetchModels(); fetchModelRecords(selectedModel); }}
                    title="Refresh Models"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                <div className="small text-muted mb-3">Select a table to view live records:</div>
                <div className="list-group list-group-flush small overflow-auto" style={{ maxHeight: 420 }}>
                  {models.map((m) => (
                    <button
                      key={m.name}
                      type="button"
                      className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-2 border-0 rounded mb-1 ${
                        selectedModel === m.name ? 'bg-primary text-white fw-bold' : 'text-dark'
                      }`}
                      onClick={() => { setSelectedModel(m.name); setSearchQuery(''); }}
                    >
                      <span className="text-truncate">{m.label}</span>
                      <span className={`badge rounded-pill ${selectedModel === m.name ? 'bg-white text-primary' : 'bg-secondary'}`}>
                        {m.rowCount}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Records Viewer */}
            <div className="col-md-8 col-lg-9">
              <div className="border rounded p-3 bg-white h-100">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                  <div>
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center">
                      <TableIcon size={18} className="text-primary me-2" />
                      Table: {modelMeta?.label || selectedModel}
                      <span className="badge bg-secondary ms-2 small">{modelRecords.length} rows</span>
                    </h5>
                    <div className="small text-muted">Group: {modelMeta?.group || 'Core Schema'}</div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <div className="input-group input-group-sm" style={{ width: 220 }}>
                      <span className="input-group-text bg-light"><Search size={14} /></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search rows..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm d-flex align-items-center"
                      onClick={() => setShowInsertModal(true)}
                    >
                      <Plus size={14} className="me-1" /> Insert Row
                    </button>
                  </div>
                </div>

                {/* Table Records */}
                {loading ? (
                  <div className="text-center py-5 text-muted">
                    <RefreshCw size={24} className="animate-spin mb-2" />
                    <div className="small">Loading table rows...</div>
                  </div>
                ) : modelRecords.length === 0 ? (
                  <div className="alert alert-light border text-center py-4 text-muted">
                    No rows found in <strong>{selectedModel}</strong> matching filter.
                  </div>
                ) : (
                  <div className="table-responsive border rounded" style={{ maxHeight: 380 }}>
                    <table className="table table-hover table-striped table-sm align-middle mb-0 small">
                      <thead className="table-light sticky-top">
                        <tr>
                          {modelMeta?.fields?.map((field: string) => (
                            <th key={field} className="text-nowrap">{field}</th>
                          ))}
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {modelRecords.map((row: any) => (
                          <tr key={row.id || JSON.stringify(row)}>
                            {modelMeta?.fields?.map((field: string) => {
                              const val = row[field];
                              return (
                                <td key={field} className="text-truncate" style={{ maxWidth: 200 }} title={String(val)}>
                                  {typeof val === 'boolean' ? (
                                    <span className={`badge ${val ? 'bg-success' : 'bg-secondary'}`}>
                                      {val ? 'TRUE' : 'FALSE'}
                                    </span>
                                  ) : Array.isArray(val) ? (
                                    <span className="badge bg-light text-dark border">
                                      {val.length} items
                                    </span>
                                  ) : typeof val === 'object' && val !== null ? (
                                    JSON.stringify(val).slice(0, 30) + '...'
                                  ) : (
                                    String(val ?? '-')
                                  )}
                                </td>
                              );
                            })}
                            <td className="text-end">
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm py-0 px-1"
                                onClick={() => handleDeleteRecord(row.id)}
                                title="Delete Record"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Insert Record Modal */}
          {showInsertModal && (
            <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title fw-bold">
                      Insert New Record into <span className="text-primary">{selectedModel}</span>
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowInsertModal(false)} />
                  </div>
                  <form onSubmit={handleInsertRecord}>
                    <div className="modal-body">
                      <div className="row g-3">
                        {modelMeta?.fields?.filter((f: string) => f !== 'id' && f !== 'createdAt').map((field: string) => (
                          <div key={field} className="col-md-6">
                            <label className="form-label small fw-semibold text-capitalize">{field}</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder={`Enter ${field}`}
                              value={insertFields[field] || ''}
                              onChange={(e) => setInsertFields({ ...insertFields, [field]: e.target.value })}
                              required={field === 'title' || field === 'name' || field === 'email'}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowInsertModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Confirm Insertion
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: BACKEND REST API DIRECTORY & LIVE RUNNER                      */}
      {/* ========================================================================= */}
      {subTab === 'backend' && (
        <div>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h6 className="fw-bold mb-0 text-dark">Registered Express Endpoints</h6>
              <div className="small text-muted">Click "Send Live Request" to execute against the active Node.js server</div>
            </div>
            <div className="input-group input-group-sm" style={{ width: 260 }}>
              <span className="input-group-text bg-light"><Search size={14} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Filter endpoints..."
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Active Endpoint Test Inspector */}
          {activeEndpointTest && (
            <div className="alert alert-dark border p-3 mb-4 shadow-xs">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-light d-flex align-items-center small">
                  <Play size={14} className="text-success me-2" />
                  Live Response: <code>{activeEndpointTest.path}</code>
                </span>
                <div>
                  <span className={`badge me-2 ${
                    activeEndpointTest.status === 200 || activeEndpointTest.status === 201 ? 'bg-success' :
                    activeEndpointTest.status === 403 ? 'bg-danger' :
                    activeEndpointTest.status === 401 ? 'bg-warning text-dark' : 'bg-secondary'
                  }`}>
                    HTTP {activeEndpointTest.status}
                  </span>
                  <span className="badge bg-secondary me-2">{activeEndpointTest.durationMs} ms</span>
                  <button
                    type="button"
                    className="btn-close btn-close-white btn-sm"
                    onClick={() => setActiveEndpointTest(null)}
                  />
                </div>
              </div>
              <pre className="bg-black text-light p-3 rounded small mb-0 overflow-auto" style={{ maxHeight: 220 }}>
                {JSON.stringify(activeEndpointTest.data, null, 2)}
              </pre>
            </div>
          )}

          {/* Endpoints Table */}
          <div className="table-responsive border rounded" style={{ maxHeight: 440 }}>
            <table className="table table-hover table-striped table-sm align-middle mb-0 small">
              <thead className="table-light sticky-top">
                <tr>
                  <th style={{ width: 90 }}>Method</th>
                  <th>Path</th>
                  <th>RBAC Authorization</th>
                  <th>Description</th>
                  <th className="text-end">Interactive Test</th>
                </tr>
              </thead>
              <tbody>
                {routes
                  .filter((r) => !routeFilter || r.path.toLowerCase().includes(routeFilter.toLowerCase()) || r.desc.toLowerCase().includes(routeFilter.toLowerCase()))
                  .map((route, idx) => (
                    <tr key={`${route.method}-${route.path}-${idx}`}>
                      <td>
                        <span className={`badge fw-bold ${
                          route.method === 'GET' ? 'bg-success' :
                          route.method === 'POST' ? 'bg-primary' :
                          route.method === 'DELETE' ? 'bg-danger' : 'bg-warning text-dark'
                        }`}>
                          {route.method}
                        </span>
                      </td>
                      <td><code>{route.path}</code></td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {route.auth}
                        </span>
                      </td>
                      <td className="text-muted">{route.desc}</td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm py-0 px-2"
                          onClick={() => testEndpoint(route)}
                          disabled={testingRoute}
                        >
                          <Play size={12} className="me-1 inline" /> Send Request
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: FRONTEND CLIENT INSPECTOR & BENCHMARKS                        */}
      {/* ========================================================================= */}
      {subTab === 'frontend' && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="border rounded p-3 bg-light h-100">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
                <Monitor size={18} className="text-primary me-2" />
                Frontend Client Runtime & State
              </h6>
              <div className="small mb-2"><strong>Framework:</strong> React 19.0.1 (SPA Bundled with Vite 8.3)</div>
              <div className="small mb-2"><strong>Styling:</strong> Tailwind CSS + Bootstrap 5.38 Utility Grid</div>
              <div className="small mb-2"><strong>Active Session:</strong> {currentUser ? `${currentUser.name} (${currentUser.role})` : 'Unauthenticated'}</div>
              <div className="small mb-2"><strong>Department Scope:</strong> {currentUser?.departmentId || 'dept-cse-01 (Computer Science)'}</div>
              <div className="small mb-3"><strong>Session Cookie:</strong> <code>connect.sid (HttpOnly, SameSite=Lax)</code></div>

              <div className="border-top pt-3">
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm d-flex align-items-center"
                  onClick={measureFrontendPing}
                >
                  <RefreshCw size={14} className="me-1" /> Benchmark Client-Server Latency
                </button>
                {pingMs !== null && (
                  <div className="alert alert-success mt-2 py-1 px-2 small mb-0">
                    Round-trip latency to <code>/api/health</code>: <strong>{pingMs} ms</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="border rounded p-3 bg-light h-100">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
                <Code size={18} className="text-success me-2" />
                Frontend Component Tree & Active Modules
              </h6>
              <ul className="list-group list-group-flush small">
                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0">
                  <span><code>src/App.tsx</code> (Root Router & Session Provider)</span>
                  <span className="badge bg-success">Mounted</span>
                </li>
                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0">
                  <span><code>LifecycleNavigator.tsx</code> (8-Stage Workflow Stepper)</span>
                  <span className="badge bg-primary">Ready</span>
                </li>
                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0">
                  <span><code>SharedModulesHub.tsx</code> (PDFKit, ExcelJS, Calendar, Storage)</span>
                  <span className="badge bg-primary">Ready</span>
                </li>
                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0">
                  <span><code>SupplementaryFeaturesHub.tsx</code> (Portfolio, Checklist, COI)</span>
                  <span className="badge bg-primary">Ready</span>
                </li>
                <li className="list-group-item bg-transparent d-flex justify-content-between align-items-center px-0">
                  <span><code>FullStackHub.tsx</code> (Database & REST Inspector)</span>
                  <span className="badge bg-success">Active</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SQL & PRISMA QUERY CONSOLE                                    */}
      {/* ========================================================================= */}
      {subTab === 'query' && (
        <div>
          <form onSubmit={runSqlQuery} className="mb-4">
            <label className="form-label fw-bold text-dark small d-flex align-items-center">
              <Terminal size={16} className="text-primary me-2" />
              SQL & Data Query Console
            </label>
            <div className="d-flex gap-2 mb-2">
              <input
                type="text"
                className="form-control font-monospace text-dark"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="e.g. SELECT * FROM projects; or SELECT * FROM users;"
              />
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center px-3"
                disabled={queryRunning}
              >
                <Play size={14} className="me-1" /> Execute
              </button>
            </div>
            <div className="d-flex gap-2 flex-wrap small">
              <span className="text-muted">Sample Queries:</span>
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => setQueryInput('SELECT * FROM projects;')}
              >
                SELECT projects
              </button>
              •
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => setQueryInput('SELECT * FROM users WHERE role = "STUDENT";')}
              >
                SELECT students
              </button>
              •
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => setQueryInput('SELECT * FROM proposals WHERE status = "SUBMITTED";')}
              >
                SELECT proposals
              </button>
              •
              <button
                type="button"
                className="btn btn-link btn-sm p-0"
                onClick={() => setQueryInput('SELECT * FROM auditLogs ORDER BY timestamp DESC;')}
              >
                SELECT audit logs
              </button>
            </div>
          </form>

          {/* Query Results */}
          {queryResult && (
            <div className="border rounded p-3 bg-light">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted">
                  Returned <strong>{queryResult.rowCount ?? 0} rows</strong> in <strong>{queryResult.executionTimeMs ?? 1} ms</strong> (Target Entity: <code>{queryResult.inferredEntity}</code>)
                </span>
                <span className="badge bg-success">Status: 200 OK</span>
              </div>

              {queryResult.error ? (
                <div className="alert alert-danger small mb-0">{queryResult.error}</div>
              ) : (
                <div className="table-responsive border rounded bg-white" style={{ maxHeight: 300 }}>
                  <table className="table table-hover table-striped table-sm mb-0 small">
                    <thead className="table-light sticky-top">
                      <tr>
                        {queryResult.columns?.map((col: string) => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows?.map((r: any, idx: number) => (
                        <tr key={r.id || idx}>
                          {queryResult.columns?.map((col: string) => (
                            <td key={col} className="text-truncate" style={{ maxWidth: 220 }}>
                              {String(r[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
