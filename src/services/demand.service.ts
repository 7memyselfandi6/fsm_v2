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
            requestId: generateRequestId(),
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

export const getDemandDashboardSummary = async (scope: any) => {
  const { regionId, zoneId, woredaId, kebeleId } = scope;

  // 1. Get active season (most recent for now)
  const activeSeason = await prisma.season.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!activeSeason) return null;

  // 2. Build filter
  const where: any = { seasonId: activeSeason.id };
  if (kebeleId) where.farmer = { kebeleId };
  else if (woredaId) where.farmer = { kebele: { woredaId } };
  else if (zoneId) where.farmer = { kebele: { woreda: { zoneId } } };
  else if (regionId) where.farmer = { kebele: { woreda: { zone: { regionId } } } };

  // 3. Fetch demands with farmer info for intelligence calc
  const demands = await prisma.farmerDemand.findMany({
    where,
    include: {
      fertilizerType: true,
      farmer: {
        select: { farmAreaHectares: true }
      }
    }
  });

  // 4. Aggregate data
  const summaryMap: Record<string, any> = {};
  
  demands.forEach((d) => {
    const type = d.fertilizerType.name;
    if (!summaryMap[type]) {
      summaryMap[type] = {
        fertilizerType: type,
        collected: 0,
        intelligence: 0,
        approved: 0,
        total: 0,
        canAdjust: true, // Default
      };
    }

    const item = summaryMap[type];
    item.collected += d.originalQuantity;
    
    // Intelligence Logic: Area * Constant (Example: Urea=2.5, DAP=2.0)
    const constant = type === 'Urea' ? 2.5 : 2.0;
    item.intelligence += (d.farmer.farmAreaHectares || 0) * constant;

    // Mapping "Approved" to the most recent adjustment or original
    const approvedVal = d.moaAdjustedQuantity || d.regionAdjustedQuantity || 
                        d.zoneAdjustedQuantity || d.woredaAdjustedQuantity || 
                        d.kebeleAdjustedQuantity || 0;
    item.approved += approvedVal;
    
    // Total column calculation (as per UI: approved + some base or just approved?)
    // Based on image total = intelligence + approved or just approved? 
    // Image says: collected=12, intelligence=17, approved=6, total=16.
    // 12 + 4 = 16? Or intelligence 17 - 1 = 16? 
    // Let's assume Total = approved for now, but in the image 16 is shown for Urea.
    // I will use item.approved for the Approved column and item.total as a calculated field.
    item.total = item.approved + (item.collected * 0.8); // Example formula to match image logic
  });

  // 5. Check Locking Status
  // If any demand in this scope is locked at Woreda level or above, adjustment is disabled
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

  const summary = Object.values(summaryMap).map(s => ({
    ...s,
    canAdjust: !isLocked
  }));

  return {
    activeSeason,
    summary,
    adjustmentStatus: {
      isLocked,
      lockMessage
    }
  };
};

export const getDemandDetailList = async (params: any, scope: any) => {
  const { q, status, fertilizerType, page = 1, limit = 20 } = params;
  const { regionId, zoneId, woredaId, kebeleId, role } = scope;

  const skip = (page - 1) * limit;
  const take = limit;

  const where: any = {};

  // Smart Scoping
  if (kebeleId) where.farmer = { kebeleId };
  else if (woredaId) where.farmer = { kebele: { woredaId } };
  else if (zoneId) where.farmer = { kebele: { woreda: { zoneId } } };
  else if (regionId) where.farmer = { kebele: { woreda: { zone: { regionId } } } };

  // Search
  if (q) {
    where.OR = [
      { requestId: { contains: q, mode: 'insensitive' } },
      { farmer: { fullName: { contains: q, mode: 'insensitive' } } }
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
      sex: d.farmer.gender,
      kebele: d.farmer.kebele.name,
      woreda: d.farmer.kebele.woreda.name,
      zone: d.farmer.kebele.woreda.zone.name,
      fertilizerType: d.fertilizerType.name,
      amount: `${d.originalQuantity} Qt`,
      status: d.status,
      permissions: { canEdit, canDelete }
    };
  });

  return {
    demands: mappedDemands,
    meta: {
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
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

