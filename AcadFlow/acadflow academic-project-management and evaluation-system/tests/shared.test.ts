import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app';

describe('Phase 6 Shared Modules, Reports, Storage & Audit Suite', () => {
  let hodCookie: string;
  let studentCookie: string;

  beforeAll(async () => {
    // Authenticate HOD and Student
    const hodRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hod.cse@college.edu', password: 'Password123!' });
    hodCookie = Array.isArray(hodRes.headers['set-cookie']) ? hodRes.headers['set-cookie'][0] : hodRes.headers['set-cookie'];

    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.aarav@college.edu', password: 'Password123!' });
    studentCookie = Array.isArray(studentRes.headers['set-cookie']) ? studentRes.headers['set-cookie'][0] : studentRes.headers['set-cookie'];
  });

  // 1. PDF Reports
  it('should generate Project Summary PDF report', async () => {
    const res = await request(app)
      .get('/api/reports/project-summary/proj-01/pdf')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body).toBeDefined();
  });

  it('should allow HOD to generate Department Marksheet PDF report', async () => {
    const res = await request(app)
      .get('/api/reports/department-marksheet/pdf')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
  });

  it('should block Student from generating Department Marksheet PDF (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/reports/department-marksheet/pdf')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
  });

  // 2. Excel Reports
  it('should generate Department Projects Catalog in Excel format (.xlsx)', async () => {
    const res = await request(app)
      .get('/api/reports/department-catalog/excel')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml.sheet');
  });

  it('should block Student from exporting Mentor Workload Excel (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/reports/mentor-workload/excel')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
  });

  // 3. Document Storage & Security Validation
  it('should securely accept valid PDF document upload with randomized opaque key', async () => {
    const fakePdfBuffer = Buffer.from('%PDF-1.4 test document content %%EOF');

    const res = await request(app)
      .post('/api/storage/projects/proj-01/upload')
      .set('Cookie', studentCookie)
      .field('title', 'Final Architecture Document')
      .attach('file', fakePdfBuffer, 'architecture.pdf');

    expect(res.status).toBe(201);
    expect(res.body.document).toHaveProperty('storageKey');
    expect(res.body.document.storageKey).not.toBe('architecture.pdf'); // Must be randomized opaque key
  });

  it('should reject unpermitted file extensions (.exe / script)', async () => {
    const maliciousBuffer = Buffer.from('malicious payload');

    const res = await request(app)
      .post('/api/storage/projects/proj-01/upload')
      .set('Cookie', studentCookie)
      .field('title', 'Malicious Script')
      .attach('file', maliciousBuffer, 'exploit.exe');

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('is not permitted');
  });

  it('should allow authorized download of document version', async () => {
    const res = await request(app)
      .get('/api/storage/documents/doc-ver-01/download')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  // 4. Notifications & Announcements
  it('should retrieve student in-app notifications and mark as read', async () => {
    const getRes = await request(app)
      .get('/api/notifications')
      .set('Cookie', studentCookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body.notifications.length).toBeGreaterThanOrEqual(1);

    const notifId = getRes.body.notifications[0].id;
    const readRes = await request(app)
      .post(`/api/notifications/${notifId}/read`)
      .set('Cookie', studentCookie);

    expect(readRes.status).toBe(200);
    expect(readRes.body.success).toBe(true);
  });

  it('should allow HOD to publish department announcement', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .set('Cookie', hodCookie)
      .send({
        title: 'Project Submission Window Closing Notice',
        content: 'Final submission window closes in 48 hours.',
        isPinned: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.announcement).toHaveProperty('title');
  });

  // 5. Calendar Events
  it('should retrieve academic calendar events and deadlines', async () => {
    const res = await request(app)
      .get('/api/calendar/events')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.events.length).toBeGreaterThanOrEqual(3);
  });

  // 6. Security Audit Logging
  it('should allow HOD to query security audit logs with pagination', async () => {
    const res = await request(app)
      .get('/api/audit-logs?limit=10')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('logs');
    expect(res.body.logs.length).toBeGreaterThanOrEqual(1);
  });

  it('should block Student from querying security audit logs (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/audit-logs')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(403);
  });

  // 7. Advanced PDF & Excel Exports
  it('should generate Evaluation Rubric Defense Sheet PDF', async () => {
    const res = await request(app)
      .get('/api/reports/evaluation-sheet/eval-01/pdf')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('Evaluation_Score_Sheet_eval-01.pdf');
  });

  it('should allow HOD to generate Consolidated Marksheet in Excel (.xlsx)', async () => {
    const res = await request(app)
      .get('/api/reports/department-marksheet/excel')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml.sheet');
    expect(res.headers['content-disposition']).toContain('Department_Consolidated_Marksheet.xlsx');
  });

  it('should generate Submissions Audit Matrix in Excel (.xlsx)', async () => {
    const res = await request(app)
      .get('/api/reports/submissions-matrix/excel')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('spreadsheetml.sheet');
  });

  // 8. Personal Reminders Lifecycle
  it('should create, list, and resolve personal deadline reminders', async () => {
    const createRes = await request(app)
      .post('/api/reminders')
      .set('Cookie', studentCookie)
      .send({ title: 'Prepare demonstration test vectors', dueDate: '2026-11-12' });

    expect(createRes.status).toBe(201);
    expect(createRes.body.reminder).toHaveProperty('id');
    const reminderId = createRes.body.reminder.id;

    const listRes = await request(app)
      .get('/api/reminders')
      .set('Cookie', studentCookie);

    expect(listRes.status).toBe(200);
    expect(listRes.body.reminders.some((r: any) => r.id === reminderId)).toBe(true);

    const resolveRes = await request(app)
      .post(`/api/reminders/${reminderId}/resolve`)
      .set('Cookie', studentCookie);

    expect(resolveRes.status).toBe(200);
    expect(resolveRes.body.success).toBe(true);
  });

  // 9. Document Revision & Listing
  it('should list project documents and allow uploading revisions', async () => {
    const listRes = await request(app)
      .get('/api/storage/projects/proj-01/documents')
      .set('Cookie', studentCookie);

    expect(listRes.status).toBe(200);
    expect(listRes.body.documents.length).toBeGreaterThanOrEqual(1);

    const fakeRevisionBuffer = Buffer.from('%PDF-1.4 revised specification %%EOF');
    const verRes = await request(app)
      .post('/api/storage/documents/doc-01/version')
      .set('Cookie', studentCookie)
      .attach('file', fakeRevisionBuffer, 'SRS_Architecture_v2.0.pdf');

    expect(verRes.status).toBe(201);
    expect(verRes.body.document).toHaveProperty('versionNumber', 2);
  });

  // 10. Security Audit CSV Export
  it('should allow HOD to export security audit trail as CSV', async () => {
    const res = await request(app)
      .get('/api/audit-logs/export/csv')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Audit ID');
    expect(res.text).toContain('Timestamp');
  });

  // 11. Correction Submission & Mentor Verification Workflow
  it('should execute student correction submission and mentor resolution', async () => {
    // Authenticate mentor
    const mentorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'mentor.sharma@college.edu', password: 'Password123!' });
    const mentorCookie = Array.isArray(mentorRes.headers['set-cookie']) ? mentorRes.headers['set-cookie'][0] : mentorRes.headers['set-cookie'];

    // Student submits correction notes
    const submitRes = await request(app)
      .post('/api/academic/feedback/fb-01/submit-correction')
      .set('Cookie', studentCookie)
      .send({ notes: 'Latency comparisons added to section 4.3 of report.' });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.item.studentProof).toContain('Latency comparisons added');

    // Mentor verifies correction
    const verifyRes = await request(app)
      .post('/api/academic/feedback/fb-01/verify-correction')
      .set('Cookie', mentorCookie);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.item.isResolved).toBe(true);
  });
});

