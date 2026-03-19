import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
import * as fertilizerService from '../../src/services/fertilizer.service.js';

describe('Fertilizer Search Service (Restricted)', () => {
  let prisma: PrismaClient;
  let pool: pg.Pool;

  beforeAll(() => {
    const connectionString = process.env.DATABASE_URL;
    pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
    const adapter = new PrismaPg(pool as any);
    prisma = new PrismaClient({ adapter });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

  it('should successfully search for UREA', async () => {
    const urea = await prisma.fertilizerType.findFirst({ where: { name: 'UREA' } });
    if (urea) {
      const result = await fertilizerService.searchFertilizer(urea.id);
      expect(result).toBeDefined();
      expect(result?.name).toBe('UREA');
    }
  });

  it('should successfully search for DAP', async () => {
    const dap = await prisma.fertilizerType.findFirst({ where: { name: 'DAP' } });
    if (dap) {
      const result = await fertilizerService.searchFertilizer(dap.id);
      expect(result).toBeDefined();
      expect(result?.name).toBe('DAP');
    }
  });

  it('should reject non-UREA/DAP fertilizer types', async () => {
    const other = await prisma.fertilizerType.findFirst({ 
      where: { name: { notIn: ['UREA', 'DAP'] } } 
    });
    
    if (other) {
      await expect(fertilizerService.searchFertilizer(other.id))
        .rejects
        .toThrow('Invalid fertilizer type. Only UREA and DAP are supported for search.');
    }
  });

  it('should reject invalid fertilizer IDs', async () => {
    const invalidId = '00000000-0000-0000-0000-000000000000';
    await expect(fertilizerService.searchFertilizer(invalidId))
      .rejects
      .toThrow('Invalid fertilizer type. Only UREA and DAP are supported for search.');
  });
});
