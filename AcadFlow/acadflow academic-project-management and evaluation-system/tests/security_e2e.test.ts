import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app';
import { resetRateLimits } from '../server/src/middleware/rateLimit';

describe('Phase 8 Comprehensive Security Hardening & End-to-End User Journey Suite', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  // ========================================================
  // 1. END-TO-END 4-ROLE ACADEMIC USER JOURNEY
  // ========================================================
  describe('Full End-to-End 4-Role Academic Lifecycle Journey', () => {
    it('should complete the full lifecycle across Student, HOD, Mentor, and Evaluator', async () => {
      // Step A: Student logs in and forms team
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student.aarav@college.edu', password: 'Password123!' });
      expect(studentLogin.status).toBe(200);
      const studentCookie = studentLogin.headers['set-cookie'];

      const teamRes = await request(app)
        .post('/api/academic/teams')
        .set('Cookie', studentCookie)
        .send({
          teamName: 'Team E2E Horizon',
          memberEmails: ['student.diya@college.edu', 'student.rohan@college.edu'],
        });
      expect(teamRes.status).toBe(201);
      const teamId = teamRes.body.team.id;

      // Step B: Student submits proposal
      const propRes = await request(app)
        .post(`/api/academic/teams/${teamId}/proposals`)
        .set('Cookie', studentCookie)
        .send({
          title: 'Quantum Key Distribution for High-Speed Optical Rail Transit',
          abstract: 'Secure quantum key distribution protocols resilient against decoherence in high-vibration train corridors.',
          objectives: 'Simulate photon polarization and maintain error rate under 1.5%.',
          techStack: 'Python, Qiskit, C++, ZeroMQ',
        });
      expect(propRes.status).toBe(201);
      const projectId = propRes.body.proposal.projectId;
      const proposalId = propRes.body.proposal.proposalId;

      // Step C: HOD logs in and approves proposal
      const hodLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'hod.cse@college.edu', password: 'Password123!' });
      expect(hodLogin.status).toBe(200);
      const hodCookie = hodLogin.headers['set-cookie'];

      const approveRes = await request(app)
        .post(`/api/dashboard/hod/proposals/${proposalId}/decision`)
        .set('Cookie', hodCookie)
        .send({ decision: 'APPROVED', feedback: 'Approved by HOD. Feasible and innovative research topic.' });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.result.status).toBe('APPROVED');

      // Step D: HOD allocates Mentor
      const allocRes = await request(app)
        .post(`/api/academic/projects/${projectId}/allocate-mentor`)
        .set('Cookie', hodCookie)
        .send({ mentorId: 'user-mentor-01' });
      expect(allocRes.status).toBe(200);

      // Step E: Mentor logs in and schedules review
      const mentorLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'mentor.sharma@college.edu', password: 'Password123!' });
      expect(mentorLogin.status).toBe(200);
      const mentorCookie = mentorLogin.headers['set-cookie'];

      const schedRes = await request(app)
        .post(`/api/academic/projects/${projectId}/reviews/schedule`)
        .set('Cookie', mentorCookie)
        .send({
          stage: 'MIDTERM',
          scheduledDate: '2026-11-28T14:00:00Z',
          venue: 'Room 405 / Hybrid',
        });
      expect(schedRes.status).toBe(201);
      const reviewScheduleId = schedRes.body.schedule.reviewScheduleId;

      // Step F: Mentor records review feedback
      const feedbackRes = await request(app)
        .post(`/api/academic/reviews/${reviewScheduleId}/feedback`)
        .set('Cookie', mentorCookie)
        .send({
          comments: 'Theoretical formulation is rigorous. Provide simulation results for Doppler shift.',
          requiredCorrections: 'Include fiber optic attenuation constants under high speed.',
        });
      expect(feedbackRes.status).toBe(201);
      const feedbackId = feedbackRes.body.feedback.feedbackId;

      // Step G: Student submits correction proof and Mentor verifies
      const corrSubmit = await request(app)
        .post(`/api/academic/feedback/${feedbackId}/submit-correction`)
        .set('Cookie', studentCookie)
        .send({ notes: 'Fiber attenuation graph added in Appendix B.' });
      expect(corrSubmit.status).toBe(200);

      const corrVerify = await request(app)
        .post(`/api/academic/feedback/${feedbackId}/verify-correction`)
        .set('Cookie', mentorCookie);
      expect(corrVerify.status).toBe(200);
      expect(corrVerify.body.item.isResolved).toBe(true);

      // Step H: Evaluator logs in, declares COI, and enters scores
      const evalLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'evaluator.drgupta@external.ac.in', password: 'Password123!' });
      expect(evalLogin.status).toBe(200);
      const evalCookie = evalLogin.headers['set-cookie'];

      const coiRes = await request(app)
        .post('/api/supplementary/evaluators/declare-coi')
        .set('Cookie', evalCookie)
        .send({ hasConflict: false, notes: 'No conflict of interest with candidate team.' });
      expect(coiRes.status).toBe(200);

      const scoreRes = await request(app)
        .post(`/api/academic/evaluations/eval-e2e-${projectId}/score`)
        .set('Cookie', evalCookie)
        .send({
          scores: [
            { criterionId: 'crit-01', scoreAwarded: 20, notes: 'Groundbreaking formulation' },
            { criterionId: 'crit-02', scoreAwarded: 29, notes: 'Robust simulation architecture' },
            { criterionId: 'crit-03', scoreAwarded: 29, notes: 'Verified low error rate' },
            { criterionId: 'crit-04', scoreAwarded: 18, notes: 'Clear presentation' },
          ],
          outcomeComments: 'Exceptional undergraduate research paper caliber.',
        });
      expect(scoreRes.status).toBe(200);
      expect(scoreRes.body.evaluation.totalScore).toBe(96);

      // Step I: HOD moderates marks and formally publishes results
      const publishRes = await request(app)
        .post(`/api/academic/results/${projectId}/publish`)
        .set('Cookie', hodCookie)
        .send({
          totalMarks: 96,
          moderatedMarks: 97,
          justification: 'Ratified by Department Examination Board.',
        });
      expect(publishRes.status).toBe(200);
      expect(publishRes.body.result.isPublished).toBe(true);
      expect(publishRes.body.result.finalGrade).toBe('A+');

      // Step J: Student generates authenticated Resume Portfolio PDF
      const portfolioRes = await request(app)
        .get('/api/supplementary/portfolio/user-student-01/pdf')
        .set('Cookie', studentCookie);
      expect(portfolioRes.status).toBe(200);
      expect(portfolioRes.headers['content-type']).toContain('application/pdf');
    });
  });

  // ========================================================
  // 2. RATE LIMITING & BRUTE FORCE ATTACK DEFENSE
  // ========================================================
  describe('Rate Limiting & Brute Force Defense', () => {
    it('should trigger 429 Too Many Requests when login limit is exceeded', async () => {
      // Execute 10 rapid attempts (allowed limit)
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/login')
          .set('x-forwarded-for', '198.51.100.42')
          .send({ email: 'student.aarav@college.edu', password: 'WrongPassword!' });
      }

      // 11th request must be blocked with 429
      const blockedRes = await request(app)
        .post('/api/auth/login')
        .set('x-forwarded-for', '198.51.100.42')
        .send({ email: 'student.aarav@college.edu', password: 'Password123!' });

      expect(blockedRes.status).toBe(429);
      expect(blockedRes.body).toHaveProperty('error', 'TooManyRequests');
      expect(blockedRes.headers).toHaveProperty('retry-after');
    });
  });

  // ========================================================
  // 3. INJECTION & XSS ATTACK DEFENSE
  // ========================================================
  describe('Input Sanitization & Injection Defense', () => {
    it('should safely reject SQL injection authentication payloads without crashing', async () => {
      const payloads = [
        "' OR 1=1 --",
        "admin' --",
        "' UNION SELECT * FROM users --",
        "'; DROP TABLE users; --",
      ];

      for (const sqlPayload of payloads) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: sqlPayload, password: 'Password123!' });

        expect([400, 401]).toContain(res.status);
      }
    });


    it('should sanitize XSS script tags from proposal payload inputs', async () => {
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student.aarav@college.edu', password: 'Password123!' });
      const cookie = studentLogin.headers['set-cookie'];

      const res = await request(app)
        .post('/api/academic/teams/team-01/proposals')
        .set('Cookie', cookie)
        .send({
          title: 'Decentralized Energy Grid <script>alert("XSS")</script>',
          abstract: 'Normal abstract text <script>evilPayload()</script>',
          objectives: 'Test objectives',
          techStack: 'Node.js, Docker',
        });

      expect(res.status).toBe(201);
      expect(res.body.proposal.title).not.toContain('<script>');
      expect(res.body.proposal.abstract).not.toContain('<script>');
    });
  });

  // ========================================================
  // 4. PATH TRAVERSAL ATTACK DEFENSE
  // ========================================================
  describe('Path Traversal Mitigation in Storage', () => {
    it('should reject path traversal in document upload and download requests', async () => {
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student.aarav@college.edu', password: 'Password123!' });
      const cookie = studentLogin.headers['set-cookie'];

      // Attempt download with directory traversal in version id
      const downloadRes = await request(app)
        .get('/api/storage/documents/../../etc/passwd/download')
        .set('Cookie', cookie);

      // Express router or security middleware handles this safely
      expect([400, 404]).toContain(downloadRes.status);
    });
  });

  // ========================================================
  // 5. PRIVILEGE ESCALATION & IDOR DEFENSE
  // ========================================================
  describe('Strict Role-Based Access Control & IDOR Scoping', () => {
    it('should prevent Student from publishing department results (403 Forbidden)', async () => {
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student.aarav@college.edu', password: 'Password123!' });
      const cookie = studentLogin.headers['set-cookie'];

      const res = await request(app)
        .post('/api/academic/results/proj-01/publish')
        .set('Cookie', cookie)
        .send({ totalMarks: 100 });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("Role 'STUDENT' is not authorized");
    });

    it('should prevent External Evaluator from scheduling mentor reviews (403 Forbidden)', async () => {
      const evalLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'evaluator.drgupta@external.ac.in', password: 'Password123!' });
      const cookie = evalLogin.headers['set-cookie'];

      const res = await request(app)
        .post('/api/academic/projects/proj-01/reviews/schedule')
        .set('Cookie', cookie)
        .send({ stage: 'MIDTERM', scheduledDate: '2026-11-20T10:00:00Z' });

      expect(res.status).toBe(403);
    });

    it('should prevent Student from creating department announcements (403 Forbidden)', async () => {
      const studentLogin = await request(app)
        .post('/api/auth/login')
        .send({ email: 'student.aarav@college.edu', password: 'Password123!' });
      const cookie = studentLogin.headers['set-cookie'];

      const res = await request(app)
        .post('/api/announcements')
        .set('Cookie', cookie)
        .send({ title: 'Unauthorized Notice', content: 'Fake notice' });

      expect(res.status).toBe(403);
    });
  });
});
