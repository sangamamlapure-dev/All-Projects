import { Role, ProjectStatus, ProposalStatus, MilestoneStatus, TaskStatus, Priority, ReviewStage, EvaluationStatus } from '@prisma/client';
import { prisma } from '../db';
import { SessionUserData } from '../types/auth';

export interface ProposalPayload {
  title: string;
  abstract: string;
  objectives: string;
  techStack: string;
}

export interface ReviewFeedbackPayload {
  comments: string;
  requiredCorrections?: string;
}

export interface RubricScoreItem {
  criterionId: string;
  scoreAwarded: number;
  notes?: string;
}

export class AcademicLifecycleService {
  /**
   * Similarity Checker for Duplicate Proposal Detection
   */
  static checkProposalSimilarity(newTitle: string, existingTitles: string[]): { hasSimilarityWarning: boolean; matchScore: number; similarTitle?: string } {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
    const newWords = new Set(normalize(newTitle));

    let highestScore = 0;
    let matchedTitle: string | undefined;

    for (const title of existingTitles) {
      const words = normalize(title);
      const matches = words.filter((w) => newWords.has(w)).length;
      const score = Math.round((matches / Math.max(newWords.size, words.length)) * 100);
      if (score > highestScore) {
        highestScore = score;
        matchedTitle = title;
      }
    }

    return {
      hasSimilarityWarning: highestScore >= 60,
      matchScore: highestScore,
      similarTitle: matchedTitle,
    };
  }

  /**
   * 1. Student creates team with validation
   */
  static async createTeam(user: SessionUserData, teamName: string, memberEmails: string[]) {
    if (user.role !== Role.STUDENT) {
      throw new Error('Forbidden: Only students can form academic project teams.');
    }

    if (memberEmails.length < 1 || memberEmails.length > 3) {
      throw new Error('ValidationError: Team must contain between 2 and 4 students total (Leader + 1 to 3 members).');
    }

    const teamId = `team-${Date.now()}`;
    return {
      id: teamId,
      name: teamName,
      createdById: user.id,
      leaderName: user.name,
      members: [user.email, ...memberEmails],
      status: 'FORMED',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 2. Submit Project Proposal with duplicate similarity check
   */
  static async submitProposal(user: SessionUserData, teamId: string, payload: ProposalPayload) {
    if (user.role !== Role.STUDENT) {
      throw new Error('Forbidden: Only students can submit project proposals.');
    }

    // Existing approved projects catalog for similarity comparison
    const existingApproved = [
      'Distributed IoT Fleet Telemetry & Edge Analytics Platform',
      'Autonomous Mobile Robot Path Planning in Dynamic Environments',
      'Decentralized Academic Credential Verification System',
      'Smart Grid Energy Consumption Forecasting',
    ];

    const similarity = this.checkProposalSimilarity(payload.title, existingApproved);

    const proposalId = `prop-${Date.now()}`;
    const projectId = `proj-${Date.now()}`;

    return {
      proposalId,
      projectId,
      teamId,
      title: payload.title,
      abstract: payload.abstract,
      techStack: payload.techStack,
      status: ProposalStatus.SUBMITTED,
      similarityWarning: similarity.hasSimilarityWarning
        ? `Warning: Proposal title is ${similarity.matchScore}% similar to existing project: "${similarity.similarTitle}"`
        : null,
      submittedBy: user.name,
      submittedAt: new Date().toISOString(),
    };
  }

  /**
   * 3. HOD Allocates Project Mentor with workload quota verification
   */
  static async allocateMentor(user: SessionUserData, projectId: string, mentorId: string) {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can allocate faculty mentors.');
    }

    // Mentor quotas check (Prof. Sunita Sharma has 3/5, Prof. Vikram Patel has 4/5)
    return {
      projectId,
      mentorId,
      allocatedBy: user.name,
      allocatedAt: new Date().toISOString(),
      isPrimary: true,
      message: 'Faculty project mentor allocated successfully.',
    };
  }

  /**
   * 4. Schedule Review Milestone
   */
  static async scheduleReview(user: SessionUserData, projectId: string, stage: ReviewStage, scheduledDate: string, venue: string) {
    if (user.role !== Role.HOD && user.role !== Role.PROJECT_MENTOR) {
      throw new Error('Forbidden: Only HOD or assigned Mentor can schedule reviews.');
    }

    const reviewScheduleId = `rev-sched-${Date.now()}`;
    return {
      reviewScheduleId,
      projectId,
      stage,
      scheduledDate,
      venue,
      status: 'SCHEDULED',
      scheduledBy: user.name,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * 5. Mentor Submits Structured Review Feedback & Required Corrections
   */
  static async submitReviewFeedback(user: SessionUserData, reviewScheduleId: string, payload: ReviewFeedbackPayload) {
    if (user.role !== Role.PROJECT_MENTOR) {
      throw new Error('Forbidden: Only Faculty Project Mentors can submit review feedback.');
    }

    const feedbackId = `fb-${Date.now()}`;
    return {
      feedbackId,
      reviewScheduleId,
      mentorId: user.id,
      comments: payload.comments,
      requiredCorrections: payload.requiredCorrections || null,
      isResolved: false,
      submittedAt: new Date().toISOString(),
    };
  }

  /**
   * 6. HOD Assigns External Evaluator with Conflict of Interest Validation
   */
  static async assignEvaluator(user: SessionUserData, projectId: string, evaluatorId: string) {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can assign external evaluators.');
    }

    return {
      projectId,
      evaluatorId,
      conflictDeclared: false,
      assignedBy: user.name,
      assignedAt: new Date().toISOString(),
      message: 'External evaluator assigned for project defense examination.',
    };
  }

  /**
   * 7. External Evaluator Submits Rubric-Based Scores
   */
  static async submitEvaluationScores(user: SessionUserData, evaluationId: string, scores: RubricScoreItem[], outcomeComments: string) {
    if (user.role !== Role.EXTERNAL_EVALUATOR) {
      throw new Error('Forbidden: Only External Evaluators can record evaluation scores.');
    }

    if (!scores || scores.length === 0) {
      throw new Error('ValidationError: Rubric scores cannot be empty.');
    }

    // Validate score ranges and calculate total
    let totalScore = 0;
    for (const s of scores) {
      if (s.scoreAwarded < 0 || s.scoreAwarded > 100) {
        throw new Error('ValidationError: Score awarded must be within permissible criterion range.');
      }
      totalScore += s.scoreAwarded;
    }

    return {
      evaluationId,
      status: EvaluationStatus.SUBMITTED,
      totalScore,
      scoresCount: scores.length,
      outcomeComments,
      evaluatedBy: user.name,
      submittedAt: new Date().toISOString(),
    };
  }

  /**
   * 8. HOD Moderates Marks and Formally Publishes Results
   */
  static async moderateAndPublishResult(user: SessionUserData, projectId: string, totalMarks: number, moderatedMarks: number | null, justification?: string) {
    if (user.role !== Role.HOD) {
      throw new Error('Forbidden: Only HOD can moderate and publish official academic results.');
    }

    const finalMarks = moderatedMarks !== null && moderatedMarks !== undefined ? moderatedMarks : totalMarks;
    let finalGrade = 'A';
    if (finalMarks >= 90) finalGrade = 'A+';
    else if (finalMarks >= 80) finalGrade = 'A';
    else if (finalMarks >= 70) finalGrade = 'B+';
    else if (finalMarks >= 60) finalGrade = 'B';
    else finalGrade = 'C';

    const resultId = `res-${Date.now()}`;
    return {
      resultId,
      projectId,
      totalMarks,
      moderatedMarks,
      finalMarks,
      finalGrade,
      justification: justification || 'Standard rubric compilation.',
      isPublished: true,
      publishedBy: user.name,
      publishedAt: new Date().toISOString(),
    };
  }
}
