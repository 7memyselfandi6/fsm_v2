import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { LockingLevel, DemandStatus } from '@prisma/client';

// Mock Prisma client
const mockFarmerDemandFindMany = jest.fn();
const mockFarmerDemandUpdate = jest.fn();
const mockFarmerDemandUpdateMany = jest.fn();
const mockFarmerDemandFindFirst = jest.fn();
const mockTransaction = jest.fn((callback: any) => callback({
  farmerDemand: {
    findFirst: mockFarmerDemandFindFirst,
    findMany: mockFarmerDemandFindMany,
    update: mockFarmerDemandUpdate,
    updateMany: mockFarmerDemandUpdateMany,
  }
}));

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  __esModule: true,
  default: {
    farmerDemand: {
      findMany: mockFarmerDemandFindMany,
      findFirst: mockFarmerDemandFindFirst,
      update: mockFarmerDemandUpdate,
      updateMany: mockFarmerDemandUpdateMany,
    },
    $transaction: mockTransaction,
  },
}));

// Mock logger
jest.unstable_mockModule('../../src/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock demand service
jest.unstable_mockModule('../../src/services/demand.service.js', () => ({
  getEffectiveQty: (d: any) => d.moaAdjustedQuantity ?? d.originalQuantity,
}));

const { calculateLevelTotals, adjustDemand } = await import('../../src/services/adjustment.service.js');

describe('Adjustment Service - Aggregation Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateLevelTotals', () => {
    it('should correctly sum totals for multiple farmers at Kebele level', async () => {
      // Setup: 3 farmers with Urea and DAP
      // Farmer 1: 50 Total (30 Urea, 20 DAP)
      // Farmer 2: 30 Total (20 Urea, 10 DAP)
      // Farmer 3: 70 Total (40 Urea, 30 DAP)
      // Grand Totals: 150 Total, 90 Urea, 60 DAP
      
      mockFarmerDemandFindMany.mockResolvedValue([
        { originalQuantity: 30, fertilizerType: { name: 'UREA' } },
        { originalQuantity: 20, fertilizerType: { name: 'DAP' } },
        { originalQuantity: 20, fertilizerType: { name: 'UREA' } },
        { originalQuantity: 10, fertilizerType: { name: 'DAP' } },
        { originalQuantity: 40, fertilizerType: { name: 'UREA' } },
        { originalQuantity: 30, fertilizerType: { name: 'DAP' } },
      ]);

      const totals = await calculateLevelTotals('KEBELE', 'kb-1', '2026');

      expect(totals.totalAmount).toBe(150);
      expect(totals.totalUreaAmount).toBe(90);
      expect(totals.totalDapAmount).toBe(60);
    });

    it('should handle null/missing values gracefully', async () => {
        mockFarmerDemandFindMany.mockResolvedValue([
            { originalQuantity: 50, fertilizerType: { name: 'UREA' } },
            { originalQuantity: 0, fertilizerType: { name: 'DAP' } },
        ]);

        const totals = await calculateLevelTotals('KEBELE', 'kb-1', '2026');
        expect(totals.totalAmount).toBe(50);
        expect(totals.totalDapAmount).toBe(0);
    });
  });

  describe('adjustDemand', () => {
    it('should distribute adjustments proportionately to farmers', async () => {
      // Parent (Woreda) adjusts Kebele from 100 to 120
      // Farmer 1: 60 original -> should become 72
      // Farmer 2: 40 original -> should become 48
      
      mockFarmerDemandFindFirst.mockResolvedValue(null); // Not locked
      mockFarmerDemandFindMany.mockResolvedValue([
        { id: 'f-1', originalQuantity: 60 },
        { id: 'f-2', originalQuantity: 40 },
      ]);

      await adjustDemand(
        LockingLevel.WOREDA,
        'w-1',
        'fert-urea',
        [{ childId: 'k-1', quantity: 120 }],
        'user-1'
      );

      expect(mockFarmerDemandUpdate).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'f-1' },
        data: expect.objectContaining({ woredaAdjustedQuantity: 72 })
      }));
      expect(mockFarmerDemandUpdate).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 'f-2' },
        data: expect.objectContaining({ woredaAdjustedQuantity: 48 })
      }));
    });

    it('should block adjustment if locked at a higher level', async () => {
        mockFarmerDemandFindFirst.mockResolvedValue({ lockedAtLevel: LockingLevel.REGION });

        await expect(adjustDemand(
            LockingLevel.WOREDA,
            'w-1',
            'fert-urea',
            [{ childId: 'k-1', quantity: 120 }],
            'user-1'
        )).rejects.toThrow('already locked at a higher level (REGION)');
    });
  });
});
