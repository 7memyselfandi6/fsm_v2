import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';
import * as service from '../../src/services/hierarchicalDemand.service.js';

describe('Hierarchical Demand Rollup Logic', () => {
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

  it('should roll up federal summary correctly', async () => {
    const fertType = await prisma.fertilizerType.findFirst({ where: { name: 'UREA' } });
    const season = await prisma.season.findFirst();
    
    if (fertType && season) {
      const summary = await service.getFederalSummary({ productionSeason: season.name });
      expect(summary).toBeDefined();
      if (summary) {
        expect(summary.productionSeason).toBe(season.name);
        expect(summary.fertilizerBreakdown).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ type: 'UREA' })
          ])
        );
      }
    }
  }, 30000);

  it('should return null for non-existent season', async () => {
    const summary = await service.getFederalSummary({ productionSeason: 'NON_EXISTENT_SEASON_9999' });
    expect(summary).toBeNull();
  });

  it('should perform federal drill-down for UREA', async () => {
    const season = await prisma.season.findFirst();
    if (season) {
      const drillDown = await service.getFederalDrillDown('UREA', { productionSeason: season.name });
      expect(Array.isArray(drillDown)).toBe(true);
      if (drillDown.length > 0) {
        expect(drillDown[0]).toHaveProperty('childId');
        expect(drillDown[0]).toHaveProperty('originalAmount');
      }
    }
  }, 30000);

  it('should return 404-like null for non-existent Region ID', async () => {
    const result = await service.getRegionSummary('invalid-uuid-123', { productionSeason: 'Meher 2025' });
    expect(result).toBeNull();
  });

  it('should return empty array for valid unit but no matching fertilizer requests', async () => {
    const region = await prisma.region.findFirst();
    const season = await prisma.season.findFirst();
    if (region && season) {
      const drillDown = await service.getRegionDrillDown(region.id, 'NON_EXISTENT_FERTILIZER', { productionSeason: season.name });
      expect(drillDown).toEqual([]);
    }
  });
});
