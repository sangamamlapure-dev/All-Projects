import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app';

describe('Phase 7 Supplementary Real-World Features Suite', () => {
  let hodCookie: string;
  let studentCookie: string;
  let evaluatorCookie: string;

  beforeAll(async () => {
    // Authenticate HOD
    const hodRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'hod.cse@college.edu', password: 'Password123!' });
    hodCookie = Array.isArray(hodRes.headers['set-cookie']) ? hodRes.headers['set-cookie'][0] : hodRes.headers['set-cookie'];

    // Authenticate Student
    const studentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student.aarav@college.edu', password: 'Password123!' });
    studentCookie = Array.isArray(studentRes.headers['set-cookie']) ? studentRes.headers['set-cookie'][0] : studentRes.headers['set-cookie'];

    // Authenticate Evaluator
    const evalRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'evaluator.drgupta@external.ac.in', password: 'Password123!' });
    evaluatorCookie = Array.isArray(evalRes.headers['set-cookie']) ? evalRes.headers['set-cookie'][0] : evalRes.headers['set-cookie'];
  });

  // 1. Student Portfolio & Resume Generator
  it('should retrieve structured student capstone portfolio data', async () => {
    const res = await request(app)
      .get('/api/supplementary/portfolio/user-student-01')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.portfolio).toHaveProperty('name', 'Aarav Deshmukh');
    expect(res.body.portfolio.skills.length).toBeGreaterThanOrEqual(4);
    expect(res.body.portfolio.project).toHaveProperty('roleInTeam');
  });

  it('should generate resume-ready Student Project Portfolio in PDF format', async () => {
    const res = await request(app)
      .get('/api/supplementary/portfolio/user-student-01/pdf')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('Student_Project_Portfolio_user-student-01.pdf');
  });

  // 2. Pre-Flight Submission Checklist
  it('should return project submission checklist and allow toggling items', async () => {
    const listRes = await request(app)
      .get('/api/supplementary/projects/proj-01/checklist')
      .set('Cookie', studentCookie);

    expect(listRes.status).toBe(200);
    expect(listRes.body.checklist.length).toBeGreaterThanOrEqual(5);

    const toggleRes = await request(app)
      .post('/api/supplementary/projects/proj-01/checklist/chk-06/toggle')
      .set('Cookie', studentCookie);

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.item.id).toBe('chk-06');
    expect(toggleRes.body.item.isCompleted).toBe(true);
  });

  // 3. Team Contribution Records
  it('should return individual student team contribution metrics and attendance', async () => {
    const res = await request(app)
      .get('/api/supplementary/projects/proj-01/contributions')
      .set('Cookie', studentCookie);

    expect(res.status).toBe(200);
    expect(res.body.contributions.members.length).toBe(3);
    expect(res.body.contributions.totalHoursLogged).toBeGreaterThan(100);
  });

  // 4. Discussions & Replies
  it('should create discussion threads and add collaborative replies', async () => {
    const threadRes = await request(app)
      .post('/api/supplementary/projects/proj-01/discussions')
      .set('Cookie', studentCookie)
      .send({
        title: 'Benchmarking Results of Time-Series Ingestion',
        content: 'We reached 12,500 messages/sec under Docker swarm load testing.',
      });

    expect(threadRes.status).toBe(201);
    expect(threadRes.body.thread).toHaveProperty('id');
    const threadId = threadRes.body.thread.id;

    const replyRes = await request(app)
      .post(`/api/supplementary/projects/proj-01/discussions/${threadId}/replies`)
      .set('Cookie', studentCookie)
      .send({ content: 'Impressive metrics! I will update the presentation deck.' });

    expect(replyRes.status).toBe(201);
    expect(replyRes.body.reply.content).toContain('Impressive metrics');
  });

  // 5. Meeting Notes & Action Items
  it('should record structured meeting notes and toggle action items', async () => {
    const noteRes = await request(app)
      .post('/api/supplementary/projects/proj-01/meeting-notes')
      .set('Cookie', studentCookie)
      .send({
        title: 'Pre-Defense Rehearsal & Presentation Dry-run',
        minutes: 'Reviewed viva presentation slides. Prof. Sharma gave feedback on slide 14.',
        actionItems: ['Rehearse live MQTT failover demo', 'Check microphone and AV in Room 402'],
      });

    expect(noteRes.status).toBe(201);
    expect(noteRes.body.note.actionItems.length).toBe(2);
    const actionId = noteRes.body.note.actionItems[0].id;

    const actRes = await request(app)
      .post(`/api/supplementary/projects/proj-01/action-items/${actionId}/toggle`)
      .set('Cookie', studentCookie);

    expect(actRes.status).toBe(200);
    expect(actRes.body.isCompleted).toBe(true);
  });

  // 6. Submission Window Controls
  it('should allow HOD to inspect and toggle proposal submission window status', async () => {
    const getRes = await request(app)
      .get('/api/supplementary/submission-window')
      .set('Cookie', studentCookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('isOpen');

    const toggleRes = await request(app)
      .post('/api/supplementary/submission-window/toggle')
      .set('Cookie', hodCookie)
      .send({ isOpen: false, reason: 'Submission window closed for Term 8.' });

    expect(toggleRes.status).toBe(200);
    expect(toggleRes.body.status.isOpen).toBe(false);

    // Reopen window
    await request(app)
      .post('/api/supplementary/submission-window/toggle')
      .set('Cookie', hodCookie)
      .send({ isOpen: true });
  });

  it('should block Student from toggling proposal submission window (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/supplementary/submission-window/toggle')
      .set('Cookie', studentCookie)
      .send({ isOpen: false });

    expect(res.status).toBe(403);
  });

  // 7. Bulk CSV Import Preview
  it('should parse and preview bulk CSV imports with validation and error reporting', async () => {
    const sampleCsv = `name,email,enrollmentNumber,batch
Aarav Deshmukh,student.aarav@college.edu,ENROLL-001,2023-2027
Priya Sharma,student.priya@college.edu,ENROLL-004,2023-2027
Vikram Singh,student.vikram@college.edu,ENROLL-005,2023-2027`;

    const res = await request(app)
      .post('/api/supplementary/bulk-import/preview')
      .set('Cookie', hodCookie)
      .send({ csvContent: sampleCsv, targetType: 'STUDENTS' });

    expect(res.status).toBe(200);
    expect(res.body.totalRows).toBe(3);
    expect(res.body.validRecordsCount).toBe(3);
    expect(res.body.errorsCount).toBe(0);
  });

  // 8. Evaluator Conflict of Interest Declaration
  it('should allow External Evaluator to formally record conflict of interest declaration', async () => {
    const res = await request(app)
      .post('/api/supplementary/evaluators/declare-coi')
      .set('Cookie', evaluatorCookie)
      .send({ hasConflict: false, notes: 'No personal, financial or research conflict of interest with candidates.' });

    expect(res.status).toBe(200);
    expect(res.body.declaration).toHaveProperty('declaredAt');
    expect(res.body.declaration.hasConflict).toBe(false);
  });

  // 9. Score Discrepancies & Outlier Detection
  it('should allow HOD to inspect score discrepancies between mentors and evaluators', async () => {
    const res = await request(app)
      .get('/api/supplementary/moderation/discrepancies')
      .set('Cookie', hodCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('flaggedDiscrepancies');
    expect(res.body.flaggedDiscrepancies.length).toBeGreaterThanOrEqual(1);
    expect(res.body.flaggedDiscrepancies[0]).toHaveProperty('deviationPercentage');
  });

  // 10. Academic Rollover Tool
  it('should allow HOD to execute academic year rollover with audit trail', async () => {
    const res = await request(app)
      .post('/api/supplementary/academic/rollover')
      .set('Cookie', hodCookie)
      .send({ targetYear: '2027-2028', targetSemester: 7 });

    expect(res.status).toBe(200);
    expect(res.body.result).toHaveProperty('status', 'COMPLETED');
    expect(res.body.result.newYear).toContain('2027-2028');
  });

  it('should block Student from executing academic rollover (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/supplementary/academic/rollover')
      .set('Cookie', studentCookie)
      .send({ targetYear: '2027-2028', targetSemester: 7 });

    expect(res.status).toBe(403);
  });
});
