import prisma from '../config/prisma.js';
import { DemandStatus, LockingLevel, Role } from '@prisma/client';

export const getSeasons = async () => await prisma.season.findMany();
export const getSeasonByName = async (name: string) => {
  return await prisma.season.findUnique({
    where: { name },
  });
};
export const getCropCategories = async () => await prisma.cropCategory.findMany({ include: { cropTypes: true } });
export const getFertilizerTypes = async () => await prisma.fertilizerType.findMany();

export const createBatchFarmerDemands = async (data: any) => {
  const { farmerId, seasonId, cropTypeIds, fertilizers, generateRequestId } = data;

  return await prisma.$transaction(async (tx) => {
    let createdCount = 0;

    for (const cropTypeId of cropTypeIds) {
      // Verify crop type exists
      const cropType = await tx.cropType.findUnique({ where: { id: cropTypeId } });
      if (!cropType) throw new Error(`Crop type ID ${cropTypeId} not found`);

      for (const fert of fertilizers) {
        // Verify fertilizer type exists
        const fertType = await tx.fertilizerType.findUnique({ where: { id: fert.fertilizerTypeId } });
        if (!fertType) throw new Error(`Fertilizer type ID ${fert.fertilizerTypeId} not found`);

        await tx.farmerDemand.create({
          data: {
            id: generateRequestId(),
            farmerId,
            seasonId,
            cropTypeId,
            fertilizerTypeId: fert.fertilizerTypeId,
            originalQuantity: fert.quantity,
            status: DemandStatus.PENDING,
            lockedAtLevel: LockingLevel.NONE,
          },
        });
        createdCount++;
      }
    }

    return { count: createdCount };
  });
};

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

export const getDemandDashboardSummary = async (params: any, scope: any) => {
  const { page = 1, limit = 5, status, seasonName } = params;
  const { regionId, zoneId, woredaId, kebeleId } = scope;

  // 1. Get active season
  let activeSeason;
  if (seasonName) {
    activeSeason = await prisma.season.findUnique({ where: { name: seasonName } });
  } else {
    activeSeason = await prisma.season.findFirst({ orderBy: { createdAt: 'desc' } });
  }

  if (!activeSeason) return null;

  // 2. Build filter
  const where: any = { seasonId: activeSeason.id };
  if (status) where.status = status;

  // Geographic Scoping
  if (kebeleId) where.farmer = { kebeleId };
  else if (woredaId) where.farmer = { kebele: { woredaId } };
  else if (zoneId) where.farmer = { kebele: { woreda: { zoneId } } };
  else if (regionId) where.farmer = { kebele: { woreda: { zone: { regionId } } } };

  // 3. KPI Metrics (Top Cards)
  // Fetch everything needed for KPIs in parallel
  const [kebeleCount, farmerCount, demandAgg, allDemands] = await Promise.all([
   
    // totalKebeles: Group by kebeleId to get unique IDs, then we take the length
  prisma.farmer.groupBy({
    by: ['kebeleId'],
    where: { demands: { some: where } },
  }),
  
  // totalFarmers: Standard count
  prisma.farmer.count({
    where: { demands: { some: where } },
  }),

  // totalDemand & totalAllocated Aggregations
  prisma.farmerDemand.aggregate({
    where,
    _sum: {
      originalQuantity: true,
      moaAdjustedQuantity: true,
      regionAdjustedQuantity: true,
      zoneAdjustedQuantity: true,
      woredaAdjustedQuantity: true,
      kebeleAdjustedQuantity: true,
    },
  }),

  // Fetch all demands for summary aggregation
  prisma.farmerDemand.findMany({
    where,
    include: {
      fertilizerType: true,
      farmer: { select: { farmAreaHectares: true } },
    },
  }),
  ]);

  // Calculate totalAllocated by picking the best adjustment for each record
  // (We have to do this in memory or via a complex SQL query because it's conditional per record)
  let totalAllocated = 0;
  const summaryMap: Record<string, any> = {};

  allDemands.forEach((d) => {
    const type = d.fertilizerType.name;
    const approvedVal = d.moaAdjustedQuantity ?? d.regionAdjustedQuantity ?? 
                        d.zoneAdjustedQuantity ?? d.woredaAdjustedQuantity ?? 
                        d.kebeleAdjustedQuantity ?? 0;
    
    totalAllocated += approvedVal;

    if (!summaryMap[type]) {
      summaryMap[type] = {
        fertilizerType: type,
        collectedQty: 0,
        intelligenceQty: 0,
        approvedQty: 0,
        finalAllocatedQty: 0,
      };
    }

    const item = summaryMap[type];
    item.collectedQty += d.originalQuantity;
    
    // Intelligence Logic: Area * Constant (Example: Urea=2.5, DAP=2.0)
    const constant = type.toLowerCase().includes('urea') ? 2.5 : 2.0;
    item.intelligenceQty += (d.farmer.farmAreaHectares || 0) * constant;
    
    item.approvedQty += approvedVal;
    item.finalAllocatedQty += approvedVal; // Assuming finalAllocated = approved for now
  });

  const metrics = {
    totalKebeles: kebeleCount,
    totalFarmers: farmerCount,
    totalDemand: demandAgg._sum.originalQuantity || 0,
    totalAllocated: totalAllocated,
  };

  // 4. Pagination for Summary
  const fullSummary = Object.values(summaryMap);
  const totalRecords = fullSummary.length;
  const totalPages = Math.ceil(totalRecords / limit);
  const paginatedSummary = fullSummary.slice((page - 1) * limit, page * limit);

  // 5. Check Locking Status (Adjustment Status)
  const lockStatus = await prisma.farmerDemand.findFirst({
    where: {
      ...where,
      lockedAtLevel: { not: LockingLevel.NONE }
    },
    select: { lockedAtLevel: true }
  });

  const isLocked = !!lockStatus;
  const lockMessage = isLocked 
    ? `Adjustment stopped at ${lockStatus.lockedAtLevel} level` 
    : "Edit is available until Woreda Stops Adjustment";

  return {
    activeSeason,
    metrics,
    summary: paginatedSummary,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages,
      totalRecords,
    },
    adjustmentStatus: {
      isLocked,
      lockMessage
    }
  };
};

export const getDemandDetailList = async (params: any, scope: any) => {
  const { q, status, fertilizerType, page = 1, limit = 10, seasonName } = params;
  const { regionId, zoneId, woredaId, kebeleId, role } = scope;

  const skip = (page - 1) * limit;
  const take = limit;

  const where: any = {};

  // Smart Scoping
  if (kebeleId) where.farmer = { kebeleId };
  else if (woredaId) where.farmer = { kebele: { woredaId } };
  else if (zoneId) where.farmer = { kebele: { woreda: { zoneId } } };
  else if (regionId) where.farmer = { kebele: { woreda: { zone: { regionId } } } };

  // Season filter
  if (seasonName) {
    where.season = { name: seasonName };
  }

  // Search
  if (q) {
    where.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { farmer: { fullName: { contains: q, mode: 'insensitive' } } },
      { farmer: { uniqueFarmerId: { contains: q, mode: 'insensitive' } } }
    ];
  }

  // Filters
  if (status) where.status = status as DemandStatus;
  if (fertilizerType) where.fertilizerType = { name: fertilizerType };

  const [demands, totalCount] = await Promise.all([
    prisma.farmerDemand.findMany({
      where,
      skip,
      take,
      include: {
        farmer: {
          include: {
            kebele: {
              include: {
                woreda: {
                  include: { zone: true }
                }
              }
            }
          }
        },
        fertilizerType: true,
        season: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.farmerDemand.count({ where })
  ]);

  const mappedDemands = demands.map((d) => {
    const isManagerOrExpert = role.includes('MANAGER') || role.includes('EXPERT') || role === 'SUPER_ADMIN';
    const canEdit = d.status === DemandStatus.PENDING && isManagerOrExpert;
    const canDelete = d.status === DemandStatus.PENDING && isManagerOrExpert;

    return {
      id: d.id,
      requestId: d.id,
      farmerName: d.farmer.fullName,
      uniqueFarmerId: d.farmer.uniqueFarmerId,
      sex: d.farmer.gender,
      kebele: d.farmer.kebele.name,
      woreda: d.farmer.kebele.woreda.name,
      zone: d.farmer.kebele.woreda.zone.name,
      fertilizerType: d.fertilizerType.name,
      seasonName: d.season.name,
      amount: `${d.originalQuantity} Qt`,
      status: d.status,
      permissions: { canEdit, canDelete }
    };
  });

  return {
    demands: mappedDemands,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount
    }
  };
};

export const getDemandById = async (id: string) => {
  return await prisma.farmerDemand.findUnique({
    where: { id },
    include: { fertilizerType: true }
  });
};

export const updateFarmerDemand = async (id: string, data: any) => {
  return await prisma.farmerDemand.update({
    where: { id },
    data
  });
};

export const deleteFarmerDemand = async (id: string) => {
  const demand = await prisma.farmerDemand.findUnique({
    where: { id }
  });

  if (!demand) throw new Error('Demand not found');
  if (demand.status !== DemandStatus.PENDING) {
    throw new Error('Only PENDING demands can be deleted');
  }

  return await prisma.farmerDemand.delete({
    where: { id }
  });
};

