import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app';

describe('Phase 3 Authentication, Sessions & RBAC Authorization Suite', () => {
  let hodCookie: string;
  let studentCookie: string;
  let mentorCookie: string;
  let evaluatorCookie: string;

  // 1. Test Login for all 4 roles
  it('should authenticate HOD and set HttpOnly session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hod.cse@college.edu', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('HOD');
    expect(res.body.user.email).toBe('hod.cse@college.edu');

    // Extract session cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    hodCookie = Array.isArray(cookies) ? cookies[0] : cookies;
    expect(hodCookie).toContain('connect.sid');
  });

  it('should authenticate STUDENT with session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.aarav@college.edu', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('STUDENT');
    const cookies = res.headers['set-cookie'];
    studentCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  it('should authenticate PROJECT_MENTOR with session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mentor.sharma@college.edu', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('PROJECT_MENTOR');
    const cookies = res.headers['set-cookie'];
    mentorCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  it('should authenticate EXTERNAL_EVALUATOR with session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'evaluator.drgupta@external.ac.in', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('EXTERNAL_EVALUATOR');
    const cookies = res.headers['set-cookie'];
    evaluatorCookie = Array.isArray(cookies) ? cookies[0] : cookies;
  });

  // 2. Test Invalid Credentials
  it('should reject invalid password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hod.cse@college.edu', password: 'WrongPassword999!' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('should reject unknown email with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@college.edu', password: 'Password123!' });

    expect(res.status).toBe(401);
  });

  // 3. Test Session Verification (GET /api/auth/me)
  it('should return current user when authenticated with session cookie', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('HOD');
    expect(res.body.user.email).toBe('hod.cse@college.edu');
  });

  it('should reject unauthenticated request with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  // 4. Test Role-Based Access Control (RBAC)
  it('should prevent STUDENT from accessing HOD-only department route (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/departments/dept-cse-01/summary')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Forbidden');
    expect(res.body.message).toContain("Role 'STUDENT' is not authorized");
  });

  // 5. Test Department Isolation & Cross-Department IDOR Defense
  it('should allow HOD to access their own department summary (200 OK)', async () => {
    const res = await request(app)
      .get('/api/departments/dept-cse-01/summary')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('departmentId', 'dept-cse-01');
    expect(res.body.statistics).toHaveProperty('activeStudents');
  });

  it('should block HOD from accessing another department (403 Cross-Department Denied)', async () => {
    const res = await request(app)
      .get('/api/departments/dept-foreign-99/summary')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Forbidden');
    expect(res.body.message).toContain('Cross-Department Access Denied');
  });

  // 6. Test Password Reset One-Time Token Lifecycle
  it('should issue password reset token and invalidate upon one-time use', async () => {
    const reqRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'mentor.patel@college.edu' });

    expect(reqRes.status).toBe(200);
    const token = reqRes.body.token;
    expect(token).toBeDefined();

    // Reset password using token
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'NewSecurePassword123!' });

    expect(resetRes.status).toBe(200);

    // Attempting reuse must be rejected (one-time use)
    const reuseRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'AnotherPassword123!' });

    expect(reuseRes.status).toBe(400);
    expect(reuseRes.body).toHaveProperty('error', 'ResetError');
  });

  // 7. Test Logout and Session Destruction
  it('should destroy session on logout and reject subsequent authenticated requests', async () => {
    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', hodCookie);

    expect(logoutRes.status).toBe(200);

    // Subsequent request with old cookie must fail with 401
    const verifyRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', hodCookie);

    expect(verifyRes.status).toBe(401);
  });
});
