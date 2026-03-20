import { LockingLevel, DemandStatus, Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import { getEffectiveQty } from './demand.service.js';
import { logger } from '../utils/logger.js';

export interface AdjustmentDistribution {
  childId: string; // e.g., kebeleId, woredaId, zoneId, regionId
  quantity: number;
}

/**
 * Adjusts fertilizer demand at a specific administrative level.
 * 
 * @param lockingLevel The level making the adjustment (e.g., WOREDA, ZONE, REGION, MOA)
 * @param parentId The ID of the parent unit (e.g., woredaId if adjusting kebeles)
 * @param fertilizerTypeId The fertilizer being adjusted
 * @param distributions Array of { childId, quantity } adjustments
 * @param userId The user performing the adjustment
 */
export const adjustDemand = async (
  lockingLevel: LockingLevel,
  parentId: string,
  fertilizerTypeId: string,
  distributions: AdjustmentDistribution[],
  userId: string
) => {
  logger.info({
    message: 'Processing demand adjustment',
    lockingLevel: lockingLevel.toString(),
    parentId,
    fertilizerTypeId,
    distributionCount: distributions.length,
    userId
  });

  return await prisma.$transaction(async (tx) => {
    for (const dist of distributions) {
      // 1. Build location filter based on the level we are adjusting
      const locationFilter: any = { fertilizerTypeId };
      
      if (lockingLevel === LockingLevel.WOREDA) {
        // Woreda level adjusts Kebeles
        locationFilter.farmer = { kebeleId: dist.childId, kebele: { woredaId: parentId } };
      } else if (lockingLevel === LockingLevel.ZONE) {
        // Zone level adjusts Woredas
        locationFilter.farmer = { kebele: { woredaId: dist.childId, woreda: { zoneId: parentId } } };
      } else if (lockingLevel === LockingLevel.REGION) {
        // Region level adjusts Zones
        locationFilter.farmer = { kebele: { woreda: { zoneId: dist.childId, zone: { regionId: parentId } } } };
      } else if (lockingLevel === LockingLevel.MOA) {
        // MOA level adjusts Regions
        locationFilter.farmer = { kebele: { woreda: { zone: { regionId: dist.childId } } } };
      } else {
        throw new Error(`Invalid locking level for adjustment: ${lockingLevel}`);
      }

      // 2. Check if already locked at a HIGHER level
      const higherLevels: LockingLevel[] = [];
      const levels: LockingLevel[] = [
        LockingLevel.NONE,
        LockingLevel.KEBELE,
        LockingLevel.WOREDA,
        LockingLevel.ZONE,
        LockingLevel.REGION,
        LockingLevel.MOA
      ];
      
      const currentLevelIndex = levels.indexOf(lockingLevel);
      for (let i = currentLevelIndex + 1; i < levels.length; i++) {
        higherLevels.push(levels[i]);
      }

      const lockedDemand = await tx.farmerDemand.findFirst({
        where: {
          ...locationFilter,
          lockedAtLevel: { in: higherLevels }
        },
        select: { lockedAtLevel: true }
      });

      if (lockedDemand) {
        throw new Error(`Cannot adjust: Unit ${dist.childId} is already locked at a higher level (${lockedDemand.lockedAtLevel})`);
      }

      // 3. Calculate current totals for the child unit to distribute proportionately
      // The user provides a target TOTAL for the child unit.
      // We need to update all individual farmer demands within that child unit.
      
      const childDemands = await tx.farmerDemand.findMany({
        where: locationFilter,
        select: { id: true, originalQuantity: true }
      });

      if (childDemands.length === 0) {
        logger.warn(`No demands found for adjustment child unit: ${dist.childId} with filter ${JSON.stringify(locationFilter)}`);
        continue;
      }

      const currentTotalOriginal = childDemands.reduce((sum, d) => sum + d.originalQuantity, 0);
      
      // 4. Update each demand proportionately
      // Formula: (farmer_original / total_original) * target_total
      for (const d of childDemands) {
        const proportion = currentTotalOriginal > 0 ? d.originalQuantity / currentTotalOriginal : 1 / childDemands.length;
        const newAdjustedQty = dist.quantity * proportion;

        const updateData: any = {
          status: DemandStatus.APPROVED,
          lockedAtLevel: lockingLevel
        };

        // Set the correct adjustment field
        if (lockingLevel === LockingLevel.WOREDA) updateData.woredaAdjustedQuantity = newAdjustedQty;
        else if (lockingLevel === LockingLevel.ZONE) updateData.zoneAdjustedQuantity = newAdjustedQty;
        else if (lockingLevel === LockingLevel.REGION) updateData.regionAdjustedQuantity = newAdjustedQty;
        else if (lockingLevel === LockingLevel.MOA) updateData.moaAdjustedQuantity = newAdjustedQty;

        await tx.farmerDemand.update({
          where: { id: d.id },
          data: updateData
        });
      }

      logger.info({
        message: 'Unit adjustment applied',
        childId: dist.childId,
        farmerCount: childDemands.length,
        targetTotal: dist.quantity,
        originalTotal: currentTotalOriginal
      });
    }

    return { success: true };
  });
};

/**
 * Calculates the totals (Total, Urea, DAP) for a given administrative level.
 */
export const calculateLevelTotals = async (
  level: 'FEDERAL' | 'REGION' | 'ZONE' | 'WOREDA' | 'KEBELE',
  levelId: string,
  seasonName: string
) => {
  const locationFilter: any = {};
  if (level === 'REGION') locationFilter.farmer = { kebele: { woreda: { zone: { regionId: levelId } } } };
  if (level === 'ZONE') locationFilter.farmer = { kebele: { woreda: { zoneId: levelId } } };
  if (level === 'WOREDA') locationFilter.farmer = { kebele: { woredaId: levelId } };
  if (level === 'KEBELE') locationFilter.farmer = { kebeleId: levelId };

  const demands = await prisma.farmerDemand.findMany({
    where: {
      season: { name: seasonName },
      ...locationFilter
    },
    include: { fertilizerType: true }
  });

  let totalAmount = 0;
  let totalUreaAmount = 0;
  let totalDapAmount = 0;

  for (const d of demands) {
    const qty = getEffectiveQty(d);
    const type = d.fertilizerType.name.toUpperCase();

    totalAmount += qty;
    if (type.includes('UREA')) totalUreaAmount += qty;
    if (type.includes('DAP')) totalDapAmount += qty;
  }

  return {
    totalAmount: Number(totalAmount.toFixed(2)),
    totalUreaAmount: Number(totalUreaAmount.toFixed(2)),
    totalDapAmount: Number(totalDapAmount.toFixed(2))
  };
};
