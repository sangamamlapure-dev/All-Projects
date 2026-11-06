import React, { useState } from 'react';
import { 
  GitMerge, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Briefcase, 
  Calendar, 
  Award, 
  Check, 
  ArrowRight, 
  Play, 
  RefreshCw 
} from 'lucide-react';

interface LifecycleProps {
  currentUser: any;
  onRefresh: () => void;
}

export function LifecycleNavigator({ currentUser, onRefresh }: LifecycleProps) {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [stepOutput, setStepOutput] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for steps
  const [teamName, setTeamName] = useState<string>('Team Apex - Edge AI');
  const [memberEmails, setMemberEmails] = useState<string>('student.diya@college.edu, student.rohan@college.edu');
  const [proposalTitle, setProposalTitle] = useState<string>('Distributed IoT Fleet Telemetry & Edge Analytics Platform');
  const [similarityResult, setSimilarityResult] = useState<any>(null);

  const steps = [
    { num: 1, title: 'Team Formation', role: 'STUDENT', desc: 'Students form academic project teams (2-4 members)' },
    { num: 2, title: 'Proposal & Duplicate Check', role: 'STUDENT', desc: 'Submit project abstract with automated title similarity warnings' },
    { num: 3, title: 'HOD Proposal Approval', role: 'HOD', desc: 'HOD formally approves, rejects, or requests revisions' },
    { num: 4, title: 'Mentor Allocation', role: 'HOD', desc: 'HOD allocates faculty supervisor based on workload quotas' },
    { num: 5, title: 'Milestone Review Session', role: 'MENTOR / HOD', desc: 'Schedule presentation milestones and defense sessions' },
    { num: 6, title: 'Mentor Structured Feedback', role: 'PROJECT_MENTOR', desc: 'Record feedback, meeting minutes, and required student corrections' },
    { num: 7, title: 'External Rubric Defense', role: 'EXTERNAL_EVALUATOR', desc: 'Evaluator enters weighted scores across 4 standardized criteria' },
    { num: 8, title: 'HOD Moderation & Publishing', role: 'HOD', desc: 'HOD moderates final scores, assigns grades, and publishes results' },
  ];

  const checkSimilarity = async (title: string) => {
    try {
      const res = await fetch(`/api/academic/similarity-check?title=${encodeURIComponent(title)}`);
      const data = await res.json();
      setSimilarityResult(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const executeStep = async (stepNum: number) => {
    setLoading(true);
    setErrorMsg(null);
    setStepOutput(null);

    try {
      if (stepNum === 1) {
        // Step 1: Create Team
        const emails = memberEmails.split(',').map((e) => e.trim());
        const res = await fetch('/api/academic/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamName, memberEmails: emails }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Team creation failed');
        setStepOutput(data);
      } else if (stepNum === 2) {
        // Step 2: Submit Proposal
        const res = await fetch('/api/academic/teams/team-demo-01/proposals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: proposalTitle,
            abstract: 'Real-time telemetry ingestion and edge stream processing for industrial sensors.',
            objectives: '10,000 msgs/sec ingestion with sub-50ms latency.',
            techStack: 'Node.js, Go, MQTT, React',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Proposal submission failed');
        setStepOutput(data);
      } else if (stepNum === 3) {
        // Step 3: HOD Decision
        const res = await fetch('/api/dashboard/hod/proposals/prop-01/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision: 'APPROVED', feedback: 'Approved by HOD. Verified technical scope.' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Proposal approval failed');
        setStepOutput(data);
      } else if (stepNum === 4) {
        // Step 4: Allocate Mentor
        const res = await fetch('/api/academic/projects/proj-01/allocate-mentor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mentorId: 'user-mentor-01' }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Mentor allocation failed');
        setStepOutput(data);
      } else if (stepNum === 5) {
        // Step 5: Schedule Review
        const res = await fetch('/api/academic/projects/proj-01/reviews/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stage: 'MIDTERM',
            scheduledDate: '2026-11-20T10:00:00Z',
            venue: 'Lab 402 / Online',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Review scheduling failed');
        setStepOutput(data);
      } else if (stepNum === 6) {
        // Step 6: Mentor Feedback
        const res = await fetch('/api/academic/reviews/rev-01/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comments: 'High architectural rigor. Ensure 95th percentile load metrics are reported.',
            requiredCorrections: 'Include latency graphs comparing edge clustering vs cloud baseline.',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Feedback submission failed');
        setStepOutput(data);
      } else if (stepNum === 7) {
        // Step 7: Evaluator Rubric
        const res = await fetch('/api/academic/evaluations/eval-01/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scores: [
              { criterionId: 'crit-01', scoreAwarded: 19, notes: 'Rigorous literature survey' },
              { criterionId: 'crit-02', scoreAwarded: 28, notes: 'Excellent distributed architecture' },
              { criterionId: 'crit-03', scoreAwarded: 27, notes: 'Thorough load benchmarks' },
              { criterionId: 'crit-04', scoreAwarded: 18, notes: 'High confidence defense' },
            ],
            outcomeComments: 'Exemplary capstone project execution and presentation.',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Evaluation scoring failed');
        setStepOutput(data);
      } else if (stepNum === 8) {
        // Step 8: HOD Moderate & Publish
        const res = await fetch('/api/academic/results/proj-01/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            totalMarks: 92,
            moderatedMarks: 93,
            justification: 'Normalized for outstanding reproducible performance benchmarks.',
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Result publishing failed');
        setStepOutput(data);
      }
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4">
      <div className="d-md-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <div className="d-flex align-items-center">
            <span className="badge bg-primary px-3 py-2 fs-6 me-2 d-flex align-items-center">
              <GitMerge size={18} className="me-1" /> Complete Academic Lifecycle Stepper
            </span>
            <span className="text-muted small">Sequential 8-Stage Academic Governance</span>
          </div>
          <p className="text-muted small mt-1 mb-0">
            Execute and verify every phase of the project lifecycle from proposal submission, mentor allocation, and reviews to rubric scoring and official result publication.
          </p>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-dark p-2">
            Logged In As: <strong>{currentUser?.name}</strong> ({currentUser?.role})
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="alert alert-danger d-flex align-items-center small py-2 mb-4" role="alert">
          <AlertTriangle size={16} className="me-2 flex-shrink-0" />
          <div><strong>Error:</strong> {errorMsg}</div>
        </div>
      )}

      {/* Stepper Navigation */}
      <div className="row g-2 mb-4">
        {steps.map((s) => (
          <div key={s.num} className="col-sm-6 col-md-3">
            <div
              className={`p-3 rounded border text-start cursor-pointer transition ${
                activeStep === s.num ? 'border-primary bg-primary-subtle shadow-xs' : 'bg-light hover-shadow'
              }`}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setActiveStep(s.num);
                setStepOutput(null);
                setErrorMsg(null);
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="fw-bold small text-dark">Step {s.num}</span>
                <span className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>{s.role}</span>
              </div>
              <div className="fw-semibold text-dark small">{s.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Step Working Card */}
      <div className="card border p-4 bg-light mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">
              Step {activeStep}: {steps[activeStep - 1].title}
            </h5>
            <p className="small text-muted mb-0">{steps[activeStep - 1].desc}</p>
          </div>
          <span className="badge bg-primary">Required Role: {steps[activeStep - 1].role}</span>
        </div>

        {/* Step-specific inputs */}
        {activeStep === 1 && (
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Team Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-semibold">Member Emails (comma-separated)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={memberEmails}
                onChange={(e) => setMemberEmails(e.target.value)}
              />
              <div className="form-text small">Requires 2 to 4 students total.</div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="mb-3">
            <label className="form-label small fw-semibold">Proposal Title</label>
            <div className="input-group input-group-sm mb-2">
              <input
                type="text"
                className="form-control"
                value={proposalTitle}
                onChange={(e) => {
                  setProposalTitle(e.target.value);
                  checkSimilarity(e.target.value);
                }}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => checkSimilarity(proposalTitle)}
              >
                Check Similarity
              </button>
            </div>
            {similarityResult?.hasSimilarityWarning && (
              <div className="alert alert-warning py-1 px-2 small mb-0">
                <AlertTriangle size={14} className="me-1 inline" />
                <strong>Similarity Warning:</strong> {similarityResult.matchScore}% similarity detected with existing approved project: <em>"{similarityResult.similarTitle}"</em>.
              </div>
            )}
          </div>
        )}

        {/* Action Trigger Button */}
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-primary btn-sm d-flex align-items-center"
            onClick={() => executeStep(activeStep)}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner-border spinner-border-sm me-2" role="status" />
            ) : (
              <Play size={14} className="me-2" />
            )}
            Execute Step {activeStep} via REST API
          </button>
          <span className="small text-muted">
            Will execute using active session: <strong>{currentUser?.role}</strong>
          </span>
        </div>

        {/* Step Output Box */}
        {stepOutput && (
          <div className="mt-3 p-3 bg-white border rounded">
            <div className="d-flex align-items-center text-success fw-bold small mb-2">
              <CheckCircle2 size={16} className="me-1" />
              API Execution Succeeded (HTTP 200/201 OK)
            </div>
            <pre className="font-monospace small text-dark mb-0 bg-light p-2 rounded" style={{ maxHeight: 200, overflow: 'auto' }}>
              {JSON.stringify(stepOutput, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
