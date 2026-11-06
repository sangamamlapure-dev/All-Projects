import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app';

describe('Phase 5 Core Academic Lifecycle Workflows Suite', () => {
  let hodCookie: string;
  let studentCookie: string;
  let mentorCookie: string;
  let evaluatorCookie: string;

  beforeAll(async () => {
    // Authenticate all 4 roles
    const hodRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hod.cse@college.edu', password: 'Password123!' });
    hodCookie = Array.isArray(hodRes.headers['set-cookie']) ? hodRes.headers['set-cookie'][0] : hodRes.headers['set-cookie'];

    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.aarav@college.edu', password: 'Password123!' });
    studentCookie = Array.isArray(studentRes.headers['set-cookie']) ? studentRes.headers['set-cookie'][0] : studentRes.headers['set-cookie'];

    const mentorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mentor.sharma@college.edu', password: 'Password123!' });
    mentorCookie = Array.isArray(mentorRes.headers['set-cookie']) ? mentorRes.headers['set-cookie'][0] : mentorRes.headers['set-cookie'];

    const evalRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'evaluator.drgupta@external.ac.in', password: 'Password123!' });
    evaluatorCookie = Array.isArray(evalRes.headers['set-cookie']) ? evalRes.headers['set-cookie'][0] : evalRes.headers['set-cookie'];
  });

  let createdTeamId: string;
  let createdProjectId: string;

  // 1. Team Creation & Validation
  it('should allow student to form team with valid member count (2 to 4)', async () => {
    const res = await request(app)
      .post('/api/academic/teams')
      .set('Cookie', studentCookie)
      .send({
        teamName: 'Team Sigma - Vision AI',
        memberEmails: ['student.diya@college.edu', 'student.rohan@college.edu'],
      });

    expect(res.status).toBe(201);
    expect(res.body.team).toHaveProperty('id');
    expect(res.body.team.members.length).toBe(3);
    createdTeamId = res.body.team.id;
  });

  it('should reject team creation if member count exceeds policy', async () => {
    const res = await request(app)
      .post('/api/academic/teams')
      .set('Cookie', studentCookie)
      .send({
        teamName: 'Oversized Team',
        memberEmails: ['m1@col.edu', 'm2@col.edu', 'm3@col.edu', 'm4@col.edu'], // 5 total
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Team must contain between 2 and 4 students');
  });

  // 2. Proposal Submission & Duplicate Similarity Check
  it('should submit proposal and flag similarity warning for duplicate-sounding titles', async () => {
    const res = await request(app)
      .post(`/api/academic/teams/${createdTeamId}/proposals`)
      .set('Cookie', studentCookie)
      .send({
        title: 'Distributed IoT Fleet Telemetry Platform', // very similar to existing
        abstract: 'Ingesting vehicular IoT sensors with edge stream processing.',
        objectives: 'Build low-latency pipeline.',
        techStack: 'Go, React, MQTT',
      });

    expect(res.status).toBe(201);
    expect(res.body.proposal).toHaveProperty('proposalId');
    expect(res.body.proposal).toHaveProperty('similarityWarning');
    expect(res.body.proposal.similarityWarning).toContain('Warning: Proposal title is');
    createdProjectId = res.body.proposal.projectId;
  });

  // 3. HOD Allocates Project Mentor
  it('should allow HOD to allocate faculty mentor to project', async () => {
    const res = await request(app)
      .post(`/api/academic/projects/${createdProjectId}/allocate-mentor`)
      .set('Cookie', hodCookie)
      .send({ mentorId: 'user-mentor-01' });

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty('mentorId', 'user-mentor-01');
  });

  it('should block Student from allocating mentor (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/academic/projects/${createdProjectId}/allocate-mentor`)
      .set('Cookie', studentCookie)
      .send({ mentorId: 'user-mentor-01' });

    expect(res.status).toBe(403);
  });

  // 4. Milestone Review Scheduling
  let reviewScheduleId: string;
  it('should allow Mentor or HOD to schedule milestone review', async () => {
    const res = await request(app)
      .post(`/api/academic/projects/${createdProjectId}/reviews/schedule`)
      .set('Cookie', mentorCookie)
      .send({
        stage: 'MIDTERM',
        scheduledDate: '2026-11-20T10:00:00Z',
        venue: 'Room 305 / Online',
      });

    expect(res.status).toBe(201);
    expect(res.body.schedule).toHaveProperty('reviewScheduleId');
    reviewScheduleId = res.body.schedule.reviewScheduleId;
  });

  // 5. Mentor Submits Structured Review Feedback
  it('should allow Mentor to record structured review feedback and corrections', async () => {
    const res = await request(app)
      .post(`/api/academic/reviews/${reviewScheduleId}/feedback`)
      .set('Cookie', mentorCookie)
      .send({
        comments: 'Solid architectural defense. Pipeline throughput exceeds expectations.',
        requiredCorrections: 'Include latency graphs under 95th percentile load.',
      });

    expect(res.status).toBe(201);
    expect(res.body.feedback).toHaveProperty('feedbackId');
    expect(res.body.feedback.requiredCorrections).toBeDefined();
  });

  // 6. HOD Assigns External Evaluator
  it('should allow HOD to assign external evaluator for project defense', async () => {
    const res = await request(app)
      .post(`/api/academic/projects/${createdProjectId}/assign-evaluator`)
      .set('Cookie', hodCookie)
      .send({ evaluatorId: 'user-evaluator-01' });

    expect(res.status).toBe(200);
    expect(res.body.assignment).toHaveProperty('evaluatorId', 'user-evaluator-01');
  });

  // 7. Evaluator Submits Standardized Rubric Scores
  it('should allow Evaluator to score defense based on rubric criteria', async () => {
    const res = await request(app)
      .post('/api/academic/evaluations/eval-test-01/score')
      .set('Cookie', evaluatorCookie)
      .send({
        scores: [
          { criterionId: 'crit-01', scoreAwarded: 18, notes: 'Clear research problem' },
          { criterionId: 'crit-02', scoreAwarded: 28, notes: 'Scalable architecture' },
          { criterionId: 'crit-03', scoreAwarded: 27, notes: 'Thorough benchmarks' },
          { criterionId: 'crit-04', scoreAwarded: 18, notes: 'Convincing defense' },
        ],
        outcomeComments: 'Demonstrated high competence and solid engineering practice.',
      });

    expect(res.status).toBe(200);
    expect(res.body.evaluation.totalScore).toBe(91);
    expect(res.body.evaluation.status).toBe('SUBMITTED');
  });

  // 8. HOD Moderation & Result Publication
  it('should allow HOD to moderate marks and publish official results', async () => {
    const res = await request(app)
      .post(`/api/academic/results/${createdProjectId}/publish`)
      .set('Cookie', hodCookie)
      .send({
        totalMarks: 91,
        moderatedMarks: 92,
        justification: 'Normalized for exemplary load test reproducibility.',
      });

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty('finalGrade', 'A+');
    expect(res.body.result).toHaveProperty('isPublished', true);
  });

  it('should block Student from publishing results (403 Forbidden)', async () => {
    const res = await request(app)
      .post(`/api/academic/results/${createdProjectId}/publish`)
      .set('Cookie', studentCookie)
      .send({ totalMarks: 100 });

    expect(res.status).toBe(403);
  });
});
