import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app';

describe('Phase 4 Four-Role Dashboards & Lifecycle Actions Suite', () => {
  let hodCookie: string;
  let studentCookie: string;
  let mentorCookie: string;
  let evaluatorCookie: string;

  beforeAll(async () => {
    // Authenticate all 4 roles to obtain valid session cookies
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

  // 1. HOD Dashboard
  it('should load HOD Department Admin Dashboard with metrics and proposals', async () => {
    const res = await request(app)
      .get('/api/dashboard/hod')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('department');
    expect(res.body).toHaveProperty('metrics');
    expect(res.body.metrics.activeProjects).toBeGreaterThanOrEqual(1);
    expect(res.body.proposalsPending.length).toBeGreaterThanOrEqual(1);
    expect(res.body.mentorWorkloads.length).toBeGreaterThanOrEqual(2);
  });

  // 2. Student Portal Dashboard
  it('should load Student Dashboard with team, milestones, and tasks', async () => {
    const res = await request(app)
      .get('/api/dashboard/student')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('student');
    expect(res.body).toHaveProperty('team');
    expect(res.body).toHaveProperty('project');
    expect(res.body.milestones.length).toBeGreaterThanOrEqual(2);
    expect(res.body.tasks.length).toBeGreaterThanOrEqual(3);
  });

  // 3. Project Mentor Dashboard
  it('should load Project Mentor Dashboard with assigned projects and reviews', async () => {
    const res = await request(app)
      .get('/api/dashboard/mentor')
      .set('Cookie', mentorCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('assignedProjects');
    expect(res.body.assignedProjects.length).toBeGreaterThanOrEqual(1);
    expect(res.body).toHaveProperty('upcomingSchedules');
  });

  // 4. External Evaluator Dashboard
  it('should load External Evaluator Dashboard with assigned defenses and rubrics', async () => {
    const res = await request(app)
      .get('/api/dashboard/evaluator')
      .set('Cookie', evaluatorCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('assignedEvaluations');
    expect(res.body.assignedEvaluations.length).toBeGreaterThanOrEqual(1);
    const evalItem = res.body.assignedEvaluations[0];
    expect(evalItem).toHaveProperty('rubricCriteria');
    expect(evalItem.rubricCriteria.length).toBeGreaterThanOrEqual(3);
  });

  // 5. Cross-Role Access Restrictions (RBAC)
  it('should block Student from accessing HOD dashboard (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/dashboard/hod')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain("Role 'STUDENT' is not authorized");
  });

  it('should block Evaluator from accessing Mentor dashboard (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/dashboard/mentor')
      .set('Cookie', evaluatorCookie);

    expect(res.status).toBe(403);
  });

  it('should block unauthenticated requests to dashboards (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/dashboard/hod');
    expect(res.status).toBe(401);
  });

  // 6. Action: HOD Proposal Approval
  it('should allow HOD to record decision on pending proposal', async () => {
    const res = await request(app)
      .post('/api/dashboard/hod/proposals/prop-01/decision')
      .set('Cookie', hodCookie)
      .send({ decision: 'APPROVED', feedback: 'Approved with high recommendation.' });

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty('status', 'APPROVED');
  });

  // 7. Action: Student Task Status Update
  it('should allow Student to update personal task status', async () => {
    const res = await request(app)
      .post('/api/dashboard/student/tasks/task-03/status')
      .set('Cookie', studentCookie)
      .send({ status: 'COMPLETED' });

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty('status', 'COMPLETED');
  });
});
