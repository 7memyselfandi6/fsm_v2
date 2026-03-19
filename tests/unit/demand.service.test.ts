
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock Prisma client
const mockPrismaKebeleFindUnique = jest.fn();
const mockPrismaWoredaFindUnique = jest.fn();
const mockPrismaZoneFindUnique = jest.fn();
const mockPrismaRegionFindUnique = jest.fn();
const mockPrismaSeasonFindUnique = jest.fn();
const mockPrismaFarmerDemandFindMany = jest.fn();
const mockPrismaFarmerDemandGroupBy = jest.fn();
const mockPrismaSeasonFindFirst = jest.fn();
const mockPrismaRegionalFlagFindUnique = jest.fn();

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  __esModule: true,
  default: {
    kebele: { findUnique: mockPrismaKebeleFindUnique },
    woreda: { findUnique: mockPrismaWoredaFindUnique },
    zone: { findUnique: mockPrismaZoneFindUnique },
    region: { findUnique: mockPrismaRegionFindUnique },
    season: { findUnique: mockPrismaSeasonFindUnique, findFirst: mockPrismaSeasonFindFirst },
    farmerDemand: { findMany: mockPrismaFarmerDemandFindMany, groupBy: mockPrismaFarmerDemandGroupBy },
    regionalFlag: { findUnique: mockPrismaRegionalFlagFindUnique },
  },
}));

// Dynamically import the service after mocks are set up
const { getKebeleSummary, getWoredaSummary, getZoneSummary, getRegionSummary, getEffectiveQty } = await import('../../src/services/demand.service.js');

describe('demand.service.ts Dashboard Summary Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockActiveSeason = { id: 'season-1', name: 'Meher 2026' };
  const mockRegionalFlag = { id: 'flag-1', regionId: 'region-1', imageUrl: 'http://example.com/flag.png' };

  // Helper for common demand data
  const createMockDemand = (fertilizerTypeName: string, fertilizerTypeId: string, originalQuantity: number, adjustedQuantity: number) => ({
    id: `demand-${Math.random()}`,
    originalQuantity: originalQuantity,
    fertilizerType: { id: fertilizerTypeId, name: fertilizerTypeName },
    farmer: { kebeleId: 'kbl-001' }, // Dummy kebeleId for getEffectiveQty to work
    moaAdjustedQuantity: adjustedQuantity, // Use moaAdjustedQuantity to make it simple for testing getEffectiveQty
  });

  describe('getKebeleSummary', () => {
                const mockUser = { kebeleId: 'kbl-001', regionId: 'region-1', role: 'KEBELE_MANAGER' };
                const mockKebele = { id: 'kbl-001', name: 'Kebele 01', sections: [] };

                it('should return a DashboardSummaryOutput for a kebele with multiple fertilizer types', async () => {
                  mockPrismaKebeleFindUnique.mockResolvedValue(mockKebele);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([
                    createMockDemand('DAP', 'ft-001', 60, 70),
                    createMockDemand('NPSB', 'ft-002', 60, 60),
                  ]);

                  const result = await getKebeleSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
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
                  expect(mockPrismaKebeleFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'kbl-001' } }));
                  expect(mockPrismaSeasonFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'Meher 2026' } }));
                  expect(mockPrismaFarmerDemandFindMany).toHaveBeenCalledWith(expect.objectContaining({
                    where: { seasonId: 'season-1', farmer: { kebeleId: 'kbl-001' } },
                  }));
                });

                it('should return a DashboardSummaryOutput for a kebele with no farmer demands', async () => {
                  mockPrismaKebeleFindUnique.mockResolvedValue(mockKebele);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([]); // No demands

                  const result = await getKebeleSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'kbl-001',
                    woredaName: 'Kebele 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 0,
                    totalAdjustedAmount: 0,
                    fertilizerBreakdown: [],
                  });
                });

                it('should return a DashboardSummaryOutput for a kebele with a single fertilizer type', async () => {
                  mockPrismaKebeleFindUnique.mockResolvedValue(mockKebele);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([
                    createMockDemand('UREA', 'ft-003', 100, 110),
                  ]);

                  const result = await getKebeleSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'kbl-001',
                    woredaName: 'Kebele 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 100,
                    totalAdjustedAmount: 110,
                    fertilizerBreakdown: expect.arrayContaining([
                      { type: 'UREA', originalAmount: 100, adjustedAmount: 110, fertilizerTypeId: 'ft-003' },
                    ]),
                  });
                });

                it('should throw error if active season not found', async () => {
                  mockPrismaKebeleFindUnique.mockResolvedValue(mockKebele);
                  mockPrismaSeasonFindUnique.mockResolvedValue(null); // No active season
                  await expect(getKebeleSummary(mockUser, 'Meher 2026')).rejects.toThrow('Active season not found.');
                });

                it('should throw error if kebele not found', async () => {
                  mockPrismaKebeleFindUnique.mockResolvedValue(null); // Kebele not found
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  await expect(getKebeleSummary(mockUser, 'Meher 2026')).rejects.toThrow('Kebele with ID kbl-001 not found.');
                });
              });

  describe('getWoredaSummary', () => {
                const mockUser = { woredaId: 'wrd-001', regionId: 'region-1', role: 'WOREDA_MANAGER' };
                const mockWoreda = { id: 'wrd-001', name: 'Woreda 01', kebeles: [], zone: { id: 'zone-1', name: 'Zone 01', region: { id: 'region-1', name: 'Region 01' } } };

                it('should return a DashboardSummaryOutput for a woreda with multiple fertilizer types', async () => {
                  mockPrismaWoredaFindUnique.mockResolvedValue(mockWoreda);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([
                    createMockDemand('DAP', 'ft-001', 100, 110),
                    createMockDemand('NPSB', 'ft-002', 80, 80),
                  ]);

                  const result = await getWoredaSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'wrd-001',
                    woredaName: 'Woreda 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 180,
                    totalAdjustedAmount: 190,
                    fertilizerBreakdown: expect.arrayContaining([
                      { type: 'DAP', originalAmount: 100, adjustedAmount: 110, fertilizerTypeId: 'ft-001' },
                      { type: 'NPSB', originalAmount: 80, adjustedAmount: 80, fertilizerTypeId: 'ft-002' },
                    ]),
                  });
                  expect(mockPrismaWoredaFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'wrd-001' } }));
                  expect(mockPrismaSeasonFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'Meher 2026' } }));
                  expect(mockPrismaFarmerDemandFindMany).toHaveBeenCalledWith(expect.objectContaining({
                    where: { seasonId: 'season-1', farmer: { kebele: { woredaId: 'wrd-001' } } },
                  }));
                });

                it('should return a DashboardSummaryOutput for a woreda with no farmer demands', async () => {
                  mockPrismaWoredaFindUnique.mockResolvedValue(mockWoreda);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([]); // No demands

                  const result = await getWoredaSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'wrd-001',
                    woredaName: 'Woreda 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 0,
                    totalAdjustedAmount: 0,
                    fertilizerBreakdown: [],
                  });
                });

                it('should return a DashboardSummaryOutput for a woreda with a single fertilizer type', async () => {
                  mockPrismaWoredaFindUnique.mockResolvedValue(mockWoreda);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([
                    createMockDemand('UREA', 'ft-003', 150, 160),
                  ]);

                  const result = await getWoredaSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'wrd-001',
                    woredaName: 'Woreda 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 150,
                    totalAdjustedAmount: 160,
                    fertilizerBreakdown: expect.arrayContaining([
                      { type: 'UREA', originalAmount: 150, adjustedAmount: 160, fertilizerTypeId: 'ft-003' },
                    ]),
                  });
                });

                it('should throw error if active season not found', async () => {
                  mockPrismaWoredaFindUnique.mockResolvedValue(mockWoreda);
                  mockPrismaSeasonFindUnique.mockResolvedValue(null);
                  await expect(getWoredaSummary(mockUser, 'Meher 2026')).rejects.toThrow('Active season not found.');
                });

                it('should throw error if woreda not found', async () => {
                  mockPrismaWoredaFindUnique.mockResolvedValue(null);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  await expect(getWoredaSummary(mockUser, 'Meher 2026')).rejects.toThrow('Woreda with ID wrd-001 not found.');
                });
              });

  describe('getZoneSummary', () => {
                const mockUser = { zoneId: 'zone-001', regionId: 'region-1', role: 'ZONE_MANAGER' };
                const mockZone = { id: 'zone-001', name: 'Zone 01', woredas: [], region: { id: 'region-1', name: 'Region 01' } };

                it('should return a DashboardSummaryOutput for a zone with multiple fertilizer types', async () => {
                  mockPrismaZoneFindUnique.mockResolvedValue(mockZone);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([
                    createMockDemand('DAP', 'ft-001', 200, 220),
                    createMockDemand('NPSB', 'ft-002', 150, 150),
                  ]);

                  const result = await getZoneSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'zone-001',
                    woredaName: 'Zone 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 350,
                    totalAdjustedAmount: 370,
                    fertilizerBreakdown: expect.arrayContaining([
                      { type: 'DAP', originalAmount: 200, adjustedAmount: 220, fertilizerTypeId: 'ft-001' },
                      { type: 'NPSB', originalAmount: 150, adjustedAmount: 150, fertilizerTypeId: 'ft-002' },
                    ]),
                  });
                  expect(mockPrismaZoneFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'zone-001' } }));
                  expect(mockPrismaSeasonFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'Meher 2026' } }));
                  expect(mockPrismaFarmerDemandFindMany).toHaveBeenCalledWith(expect.objectContaining({
                    where: { seasonId: 'season-1', farmer: { kebele: { woreda: { zoneId: 'zone-001' } } } },
                  }));
                });

                it('should return a DashboardSummaryOutput for a zone with no farmer demands', async () => {
                  mockPrismaZoneFindUnique.mockResolvedValue(mockZone);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([]); // No demands

                  const result = await getZoneSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'zone-001',
                    woredaName: 'Zone 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 0,
                    totalAdjustedAmount: 0,
                    fertilizerBreakdown: [],
                  });
                });

                it('should return a DashboardSummaryOutput for a zone with a single fertilizer type', async () => {
                  mockPrismaZoneFindUnique.mockResolvedValue(mockZone);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([
                    createMockDemand('UREA', 'ft-003', 250, 260),
                  ]);

                  const result = await getZoneSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'zone-001',
                    woredaName: 'Zone 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 250,
                    totalAdjustedAmount: 260,
                    fertilizerBreakdown: expect.arrayContaining([
                      { type: 'UREA', originalAmount: 250, adjustedAmount: 260, fertilizerTypeId: 'ft-003' },
                    ]),
                  });
                });

                it('should throw error if active season not found', async () => {
                  mockPrismaZoneFindUnique.mockResolvedValue(mockZone);
                  mockPrismaSeasonFindUnique.mockResolvedValue(null);
                  await expect(getZoneSummary(mockUser, 'Meher 2026')).rejects.toThrow('Active season not found.');
                });

                it('should throw error if zone not found', async () => {
                  mockPrismaZoneFindUnique.mockResolvedValue(null);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  await expect(getZoneSummary(mockUser, 'Meher 2026')).rejects.toThrow('Zone with ID zone-001 not found.');
                });
              });

  describe('getRegionSummary', () => {
                const mockUser = { regionId: 'region-001', role: 'REGION_MANAGER' };
                const mockRegion = { id: 'region-001', name: 'Region 01', zones: [] };

                it('should return a DashboardSummaryOutput for a region with multiple fertilizer types', async () => {
                  mockPrismaRegionFindUnique.mockResolvedValue(mockRegion);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([
                    createMockDemand('DAP', 'ft-001', 300, 330),
                    createMockDemand('NPSB', 'ft-002', 250, 250),
                  ]);

                  const result = await getRegionSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'region-001',
                    woredaName: 'Region 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 550,
                    totalAdjustedAmount: 580,
                    fertilizerBreakdown: expect.arrayContaining([
                      { type: 'DAP', originalAmount: 300, adjustedAmount: 330, fertilizerTypeId: 'ft-001' },
                      { type: 'NPSB', originalAmount: 250, adjustedAmount: 250, fertilizerTypeId: 'ft-002' },
                    ]),
                  });
                  expect(mockPrismaRegionFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'region-001' } }));
                  expect(mockPrismaSeasonFindUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { name: 'Meher 2026' } }));
                  expect(mockPrismaFarmerDemandFindMany).toHaveBeenCalledWith(expect.objectContaining({
                    where: { seasonId: 'season-1', farmer: { kebele: { woreda: { zone: { regionId: 'region-001' } } } } },
                  }));
                });

                it('should return a DashboardSummaryOutput for a region with no farmer demands', async () => {
                  mockPrismaRegionFindUnique.mockResolvedValue(mockRegion);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([]); // No demands

                  const result = await getRegionSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'region-001',
                    woredaName: 'Region 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 0,
                    totalAdjustedAmount: 0,
                    fertilizerBreakdown: [],
                  });
                });

                it('should return a DashboardSummaryOutput for a region with a single fertilizer type', async () => {
                  mockPrismaRegionFindUnique.mockResolvedValue(mockRegion);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  mockPrismaRegionalFlagFindUnique.mockResolvedValue(mockRegionalFlag);
                  mockPrismaFarmerDemandFindMany.mockResolvedValue([
                    createMockDemand('UREA', 'ft-003', 350, 360),
                  ]);

                  const result = await getRegionSummary(mockUser, 'Meher 2026');

                  expect(result).toEqual({
                    woredaId: 'region-001',
                    woredaName: 'Region 01',
                    productionSeason: 'Meher 2026',
                    totalAmount: 350,
                    totalAdjustedAmount: 360,
                    fertilizerBreakdown: expect.arrayContaining([
                      { type: 'UREA', originalAmount: 350, adjustedAmount: 360, fertilizerTypeId: 'ft-003' },
                    ]),
                  });
                });

                it('should throw error if active season not found', async () => {
                  mockPrismaRegionFindUnique.mockResolvedValue(mockRegion);
                  mockPrismaSeasonFindUnique.mockResolvedValue(null);
                  await expect(getRegionSummary(mockUser, 'Meher 2026')).rejects.toThrow('Active season not found.');
                });

                it('should throw error if region not found', async () => {
                  mockPrismaRegionFindUnique.mockResolvedValue(null);
                  mockPrismaSeasonFindUnique.mockResolvedValue(mockActiveSeason);
                  await expect(getRegionSummary(mockUser, 'Meher 2026')).rejects.toThrow('Region with ID region-001 not found.');
                });
              });
});
