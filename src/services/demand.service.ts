import prisma from '../config/prisma.js';
import { DemandStatus, LockingLevel, Role } from '@prisma/client';

export const getSeasons = async () => await prisma.season.findMany();
export const getCropCategories = async () => await prisma.cropCategory.findMany({ include: { cropTypes: true } });
export const getFertilizerTypes = async () => await prisma.fertilizerType.findMany();

export const createFarmerDemand = async (demandData: any) => {
  return await prisma.farmerDemand.create({
    data: {
      status: DemandStatus.PENDING,
      lockedAtLevel: LockingLevel.NONE,
      ...demandData,
    },
  });
};

export const adjustFarmerDemand = async (
  id: string,
  adjustedQuantity: number,
  level: LockingLevel,
  userRole: Role
) => {
  const demand = await prisma.farmerDemand.findUnique({
    where: { id },
  });

  if (!demand) throw new Error('Demand not found');

  // Check locking
  const lockingOrder = [
    LockingLevel.NONE,
    LockingLevel.KEBELE,
    LockingLevel.WOREDA,
    LockingLevel.ZONE,
    LockingLevel.REGION,
    LockingLevel.MOA,
  ];
  
  const currentLockIndex = lockingOrder.indexOf(demand.lockedAtLevel);
  const targetLevelIndex = lockingOrder.indexOf(level);

  if (currentLockIndex >= targetLevelIndex && demand.lockedAtLevel !== LockingLevel.NONE) {
    throw new Error(`Demand is locked at ${demand.lockedAtLevel} level`);
  }

  // Define adjustment field based on level
  const adjustmentFields: any = {
    [LockingLevel.KEBELE]: 'kebeleAdjustedQuantity',
    [LockingLevel.WOREDA]: 'woredaAdjustedQuantity',
    [LockingLevel.ZONE]: 'zoneAdjustedQuantity',
    [LockingLevel.REGION]: 'regionAdjustedQuantity',
    [LockingLevel.MOA]: 'moaAdjustedQuantity',
  };

  const field = adjustmentFields[level];
  if (!field) throw new Error('Invalid adjustment level');

  return await prisma.farmerDemand.update({
    where: { id },
    data: {
      [field]: adjustedQuantity,
      status: DemandStatus.APPROVED, // Automatically set to approved if adjusted by higher level
    },
  });
};

export const lockDemands = async (level: LockingLevel, scope: any) => {
  const { regionId, zoneId, woredaId, kebeleId } = scope;

  const where: any = {};
  if (kebeleId) where.farmer = { kebeleId };
  else if (woredaId) where.farmer = { kebele: { woredaId } };
  else if (zoneId) where.farmer = { kebele: { woreda: { zoneId } } };
  else if (regionId) where.farmer = { kebele: { woreda: { zone: { regionId } } } };

  return await prisma.farmerDemand.updateMany({
    where,
    data: {
      lockedAtLevel: level,
      status: DemandStatus.LOCKED,
    },
  });
};

export const getDemandDashboard = async (scope: any) => {
  const { regionId, zoneId, woredaId, kebeleId } = scope;

  const where: any = {};
  if (kebeleId) where.farmer = { kebeleId };
  else if (woredaId) where.farmer = { kebele: { woredaId } };
  else if (zoneId) where.farmer = { kebele: { woreda: { zoneId } } };
  else if (regionId) where.farmer = { kebele: { woreda: { zone: { regionId } } } };

  const demands = await prisma.farmerDemand.findMany({
    where,
    include: {
      farmer: true,
      season: true,
      cropType: true,
      fertilizerType: true,
    },
  });

  // Aggregation logic
  const aggregated = demands.reduce((acc: any, demand) => {
    const key = `${demand.season.name}-${demand.fertilizerType.name}`;
    if (!acc[key]) {
      acc[key] = {
        season: demand.season.name,
        fertilizer: demand.fertilizerType.name,
        originalTotal: 0,
        kebeleTotal: 0,
        woredaTotal: 0,
        zoneTotal: 0,
        regionTotal: 0,
        moaTotal: 0,
      };
    }

    acc[key].originalTotal += demand.originalQuantity;
    acc[key].kebeleTotal += demand.kebeleAdjustedQuantity || demand.originalQuantity;
    acc[key].woredaTotal += demand.woredaAdjustedQuantity || acc[key].kebeleTotal;
    acc[key].zoneTotal += demand.zoneAdjustedQuantity || acc[key].woredaTotal;
    acc[key].regionTotal += demand.regionAdjustedQuantity || acc[key].zoneTotal;
    acc[key].moaTotal += demand.moaAdjustedQuantity || acc[key].regionTotal;

    return acc;
  }, {});

  return Object.values(aggregated);
};
