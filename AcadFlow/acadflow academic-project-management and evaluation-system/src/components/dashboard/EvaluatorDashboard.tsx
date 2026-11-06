import React, { useState } from 'react';
import { 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Award, 
  Download, 
  Send 
} from 'lucide-react';

interface EvaluatorProps {
  data: any;
  onRefresh: () => void;
}

export function EvaluatorDashboard({ data, onRefresh }: EvaluatorProps) {
  const evaluator = data?.evaluator;
  const evaluation = data?.assignedEvaluations?.[0];

  const [scores, setScores] = useState<{ [key: string]: number }>({
    'crit-01': 18,
    'crit-02': 27,
    'crit-03': 26,
    'crit-04': 17,
  });

  const [notes, setNotes] = useState<{ [key: string]: string }>({
    'crit-01': 'Clear gap identified, good comparative literature study.',
    'crit-02': 'Robust distributed architecture with fault tolerance.',
    'crit-03': 'Verified load testing up to 10k messages per second.',
    'crit-04': 'Answered edge clustering queries confidently.',
  });

  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const [outcomeComment, setOutcomeComment] = useState<string>(
    'The project demonstrates high technical rigor, reproducible benchmarking, and clean modular code architecture.'
  );

  const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

  const handleScoreChange = (critId: string, val: number, max: number) => {
    if (isFinalized) return;
    const clamped = Math.max(0, Math.min(val, max));
    setScores((prev) => ({ ...prev, [critId]: clamped }));
  };

  const handleFinalize = () => {
    setIsFinalized(true);
    alert('Evaluation formally submitted and finalized. Scores locked.');
  };

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4">
      {/* Top Banner */}
      <div className="d-md-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <div className="d-flex align-items-center">
            <span className="badge bg-info text-dark px-3 py-2 fs-6 me-2 d-flex align-items-center">
              <UserCheck size={18} className="me-1" /> External Evaluator Portal
            </span>
            <span className="text-muted small">{evaluator?.name}</span>
          </div>
          <p className="text-muted small mt-1 mb-0">
            {evaluator?.institution} • {evaluator?.designation} • Standardized Rubric Scoring & Final Dissertation Defense
          </p>
        </div>
        <div className="mt-3 mt-md-0 d-flex gap-2">
          <span className="badge bg-success-subtle text-success border border-success-subtle p-2 d-flex align-items-center">
            <ShieldCheck size={14} className="me-1" /> No Conflict of Interest Declared
          </span>
        </div>
      </div>

      {evaluation ? (
        <div className="row g-4">
          {/* Left Column: Project Details & Defense Materials */}
          <div className="col-lg-5">
            <div className="card border p-3 bg-light mb-4">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h5 className="fw-bold text-dark mb-1">{evaluation.projectTitle}</h5>
                <span className={`badge ${isFinalized ? 'bg-success' : 'bg-primary'}`}>
                  {isFinalized ? 'FINALIZED' : 'DRAFT SCORING'}
                </span>
              </div>
              <div className="small text-muted mb-2">
                <strong>Team:</strong> {evaluation.teamName} • <strong>Department:</strong> {evaluation.department}
              </div>
              <div className="small text-secondary mb-3">
                <strong>Defense Schedule:</strong> {evaluation.defenseDate} ({evaluation.venue})
              </div>

              <h6 className="fw-bold text-dark small mb-2 border-top pt-2">Candidate Submissions:</h6>
              <div className="d-flex flex-column gap-2 small">
                {evaluation.documentsAvailable?.map((doc: any, i: number) => (
                  <div key={i} className="d-flex justify-content-between align-items-center p-2 rounded bg-white border">
                    <span className="text-dark fw-medium d-flex align-items-center">
                      <FileText size={14} className="me-1 text-primary" /> {doc.title}
                    </span>
                    <button type="button" className="btn btn-outline-secondary btn-sm py-0 px-2 text-dark" style={{ fontSize: '0.75rem' }}>
                      <Download size={12} className="me-1" /> {doc.size}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Score Summary Card */}
            <div className="card border p-3 bg-white text-center">
              <Award size={28} className="text-warning text-dark mx-auto mb-2" />
              <div className="h3 fw-bold mb-0 text-dark">{totalScore} / 100</div>
              <div className="text-muted small mb-2">Calculated Composite Rubric Score</div>
              <div className="progress mb-3" style={{ height: 10 }}>
                <div
                  className={`progress-bar ${
                    totalScore >= 80 ? 'bg-success' : totalScore >= 60 ? 'bg-primary' : 'bg-warning'
                  }`}
                  style={{ width: `${totalScore}%` }}
                />
              </div>

              {!isFinalized ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
                  onClick={handleFinalize}
                >
                  <Send size={14} className="me-1" /> Finalize & Lock Evaluation
                </button>
              ) : (
                <div className="alert alert-success py-1 small mb-0">
                  <CheckCircle size={14} className="me-1 inline" /> Evaluation Finalized & Awaiting HOD Moderation
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Standardized Rubric Form */}
          <div className="col-lg-7">
            <div className="card border p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h6 className="fw-bold text-dark mb-0">
                  {evaluation.rubricTitle}
                </h6>
                <span className="badge bg-secondary">4 Criteria</span>
              </div>

              <div className="d-flex flex-column gap-4">
                {evaluation.rubricCriteria?.map((crit: any) => (
                  <div key={crit.id} className="border-bottom pb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <span className="fw-bold text-dark small">{crit.name}</span>
                        <span className="badge bg-light text-muted border ms-2" style={{ fontSize: '0.7rem' }}>
                          Weight: {crit.weight} • Max: {crit.maxMarks} marks
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <input
                          type="number"
                          className="form-control form-control-sm text-center fw-bold"
                          style={{ width: 65 }}
                          value={scores[crit.id] ?? crit.scoreAwarded}
                          onChange={(e) => handleScoreChange(crit.id, parseInt(e.target.value) || 0, crit.maxMarks)}
                          disabled={isFinalized}
                          min={0}
                          max={crit.maxMarks}
                        />
                        <span className="small text-muted ms-1">/ {crit.maxMarks}</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Evaluation remarks and criterion notes..."
                        value={notes[crit.id] ?? crit.notes}
                        onChange={(e) => setNotes((prev) => ({ ...prev, [crit.id]: e.target.value }))}
                        disabled={isFinalized}
                      />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="form-label small fw-bold text-dark">Overall Evaluator Defense Comments</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={3}
                    value={outcomeComment}
                    onChange={(e) => setOutcomeComment(e.target.value)}
                    disabled={isFinalized}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 text-muted">
          No defense evaluations currently assigned.
        </div>
      )}
    </div>
  );
}
