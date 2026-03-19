import request from 'supertest';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import app from '../../../src/server'; // Adjust path as needed
import prisma from '../../../src/config/prisma';

// Mock Prisma client to control database state
jest.mock('../../../src/config/prisma', () => ({
  __esModule: true,
  default: {
    kebele: {
      findUnique: jest.fn(),
    },
    season: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    farmerDemand: {
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    regionalFlag: {
      findUnique: jest.fn(),
    },
  },
}));

describe('GET /api/kebele/dashboard-summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockActiveSeason = { id: 'season-1', name: 'Meher 2026' };
  const mockKebele = { id: 'kbl-001', name: 'Kebele 01', sections: [] };

  it('should return kebele dashboard summary with correct format', async () => {
    (prisma.kebele.findUnique as jest.Mock).mockResolvedValue(mockKebele);
    (prisma.season.findUnique as jest.Mock).mockResolvedValue(mockActiveSeason);
    (prisma.farmerDemand.findMany as jest.Mock).mockResolvedValue([
      {
        originalQuantity: 60,
        moaAdjustedQuantity: 70,
        fertilizerType: { id: 'ft-001', name: 'DAP' },
      },
      {
        originalQuantity: 60,
        moaAdjustedQuantity: 60,
        fertilizerType: { id: 'ft-002', name: 'NPSB' },
      },
    ]);

    const response = await request(app)
      .get('/api/kebele/dashboard-summary')
      .query({ kebeleId: 'kbl-001', productionSeason: 'Meher 2026' });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      woredaId: 'kbl-001',
      woredaName: 'Kebele 01',
      productionSeason: 'Meher 2026',
      totalAmount: 120,
      totalAdjustedAmount: 130,
      fertilizerBreakdown: expect.arrayContaining([
        { type: 'DAP', originalAmount: 60, adjustedAmount: 70, fertilizerTypeId: 'ft-001' },
        { type: 'NPSB', originalAmount: 60, adjustedAmount: 60, fertilizerTypeId: 'ft-002' },
      ]),
    });
  });

  it('should return 404 if kebele not found', async () => {
    (prisma.kebele.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.season.findUnique as jest.Mock).mockResolvedValue(mockActiveSeason);

    const response = await request(app)
      .get('/api/kebele/dashboard-summary')
      .query({ kebeleId: 'kbl-001', productionSeason: 'Meher 2026' });

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({ message: 'Kebele with ID kbl-001 not found.' });
  });

  it('should return 404 if active season not found', async () => {
    (prisma.kebele.findUnique as jest.Mock).mockResolvedValue(mockKebele);
    (prisma.season.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .get('/api/kebele/dashboard-summary')
      .query({ kebeleId: 'kbl-001', productionSeason: 'Meher 2026' });

    expect(response.statusCode).toEqual(404);
    expect(response.body).toEqual({ message: 'Active season not found.' });
  });
});
