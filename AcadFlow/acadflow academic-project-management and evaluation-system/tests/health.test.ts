import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server/src/app';

describe('Phase 1 & Phase 2 System & Database Integration Checks', () => {
  it('should return 200 OK with healthy status, 4-role verification, and database state', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('service', 'AcadFlow API');
    expect(response.body).toHaveProperty('version');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
    expect(response.body).toHaveProperty('database');
    expect(response.body.database).toHaveProperty('provider', 'mysql');
    expect(response.body.roles).toEqual([
      'HOD',
      'STUDENT',
      'PROJECT_MENTOR',
      'EXTERNAL_EVALUATOR',
    ]);
  });

  it('should return database diagnostics schema entity groups and 4-role seed accounts', async () => {
    const response = await request(app).get('/api/db/diagnostics');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('provider', 'MySQL 8');
    expect(response.body).toHaveProperty('orm', 'Prisma 6.19.3');
    expect(response.body.entityGroups.length).toBeGreaterThan(3);

    // Verify all 4 roles exist in seed accounts
    const rolesInSeed = response.body.seedAccounts.map((a: any) => a.role);
    expect(rolesInSeed).toContain('HOD');
    expect(rolesInSeed).toContain('PROJECT_MENTOR');
    expect(rolesInSeed).toContain('STUDENT');
    expect(rolesInSeed).toContain('EXTERNAL_EVALUATOR');
  });

  it('should return 404 for unknown API endpoints', async () => {
    const response = await request(app).get('/api/v1/undefined-endpoint');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Not Found');
  });
});
