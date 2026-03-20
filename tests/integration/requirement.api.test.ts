import { jest, describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// We'll use the actual app for integration testing
// Assuming app.ts exports 'app'
import app from '../../src/app.js';

describe('FarmerRequirement API Integration', () => {
  let prisma: PrismaClient;
  let pool: pg.Pool;
  let token: string;
  let fertTypeId: string;
  let cropTypeId: string;

  beforeAll(async () => {
    const connectionString = process.env.DATABASE_URL;
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    const adapter = new PrismaPg(pool as any);
    prisma = new PrismaClient({ adapter });

    // 1. Get a valid token (Login as admin)
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin_sa', password: 'Password123!' });
    token = loginRes.body.token;

    // 2. Get master data IDs
    const fert = await prisma.fertilizerType.findFirst();
    const crop = await prisma.cropType.findFirst();
    fertTypeId = fert!.id;
    cropTypeId = crop!.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.farmerRequirement.deleteMany({
      where: { uniqueFarmerId: 'TEST-INTEGRATION-001' }
    });
    await prisma.$disconnect();
    await pool.end();
  });

  const testPayload = {
    uniqueFarmerId: 'TEST-INTEGRATION-001',
    seasons: [{ seasonName: 'Meher', month: 'Tikimt' }],
    fertilizers: [{ fertilizerTypeId: '', quantity: 2 }],
    cropTypeIds: ['']
  };

  it('should create, retrieve, update and delete a requirement', async () => {
    testPayload.fertilizers[0].fertilizerTypeId = fertTypeId;
    testPayload.cropTypeIds[0] = cropTypeId;

    // 1. POST
    const createRes = await request(app)
      .post('/api/requirements')
      .set('Authorization', `Bearer ${token}`)
      .send(testPayload);
    
    expect(createRes.status).toBe(201);
    expect(createRes.body.uniqueFarmerId).toBe(testPayload.uniqueFarmerId);

    // 2. GET by ID
    const getRes = await request(app)
      .get(`/api/requirements/${testPayload.uniqueFarmerId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.uniqueFarmerId).toBe(testPayload.uniqueFarmerId);

    // 3. PUT
    const updatedPayload = { ...testPayload, seasons: [{ seasonName: 'Belg', month: 'Hidar' }] };
    const updateRes = await request(app)
      .put(`/api/requirements/${testPayload.uniqueFarmerId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedPayload);
    
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.seasons[0].seasonName).toBe('Belg');

    // 4. DELETE
    const deleteRes = await request(app)
      .delete(`/api/requirements/${testPayload.uniqueFarmerId}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(deleteRes.status).toBe(204);
  });

  it('should return 400 for invalid data', async () => {
    const invalidPayload = { ...testPayload, uniqueFarmerId: '' };
    const res = await request(app)
      .post('/api/requirements')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidPayload);
    
    expect(res.status).toBe(400);
  });
});
