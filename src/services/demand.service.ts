import prisma from '../config/prisma.js';
import { DemandStatus, LockingLevel, Role } from '@prisma/client';

/** --- SHARED HELPERS --- **/

const getActiveSeason = async (seasonName?: string) => {
  if (seasonName) {
    return await prisma.season.findUnique({ where: { name: seasonName } });
  }
  // Find season with most demands, fallback to most recent
  const mostActive = await prisma.farmerDemand.groupBy({
    by: ['seasonId'],
    _count: { _all: true },
    orderBy: { _count: { seasonId: 'desc' } },
    take: 1
  });
  return mostActive.length > 0 
    ? await prisma.season.findUnique({ where: { id: mostActive[0].seasonId } })
    : await prisma.season.findFirst({ orderBy: { createdAt: 'desc' } });
};

const getRegionalFlag = async (regionId?: string | null) => {
  if (!regionId) return null;
  return await prisma.regionalFlag.findUnique({ where: { regionId } });
};

/** --- BASIC FETCHERS --- **/
export const getSeasons = async () => await prisma.season.findMany();
export const getSeasonByName = async (name: string) => await prisma.season.findUnique({ where: { name } });
export const getCropCategories = async () => await prisma.cropCategory.findMany({ include: { cropTypes: true } });
export const getFertilizerTypes = async () => await prisma.fertilizerType.findMany();

/** --- WOREDA MODULE --- **/

export const getWoredaSummary = async (user: any, seasonName?: string) => {
  const { woredaId, regionId, role } = user;
  const [woreda, activeSeason, flag] = await Promise.all([
    prisma.woreda.findUnique({ 
      where: { id: woredaId },
      include: { kebeles: true }
    }),
    getActiveSeason(seasonName),
    role === 'SUPER_ADMIN' ? Promise.resolve(null) : getRegionalFlag(regionId)
  ]);

  if (!activeSeason || !woreda) return null;

  const demands = await prisma.farmerDemand.findMany({
    where: { 
      seasonId: activeSeason.id, 
      farmer: { kebele: { woredaId } } 
    },
    include: { 
      fertilizerType: true,
      farmer: { select: { kebeleId: true } }
    }
  });

  // Calculate Woreda Summary
  const woredaSummaryMap: Record<string, number> = {};
  let woredaTotalAmount = 0;

  // Group by Kebele
  const kebeleSummaries: Record<string, { name: string, totalAmount: number, fertilizerBreakdown: any[] }> = {};
  
  // Initialize Kebele Summaries
  woreda.kebeles.forEach(k => {
    kebeleSummaries[k.id] = { name: k.name, totalAmount: 0, fertilizerBreakdown: [] };
  });

  const kebeleFertilizerMaps: Record<string, Record<string, number>> = {};

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const kid = d.farmer.kebeleId;

    // Woreda aggregation
    woredaSummaryMap[type] = (woredaSummaryMap[type] || 0) + d.originalQuantity;
    woredaTotalAmount += d.originalQuantity;

    // Kebele aggregation
    if (kebeleSummaries[kid]) {
      kebeleSummaries[kid].totalAmount += d.originalQuantity;
      if (!kebeleFertilizerMaps[kid]) kebeleFertilizerMaps[kid] = {};
      kebeleFertilizerMaps[kid][type] = (kebeleFertilizerMaps[kid][type] || 0) + d.originalQuantity;
    }
  });

  // Convert Kebele maps to breakdowns
  Object.keys(kebeleSummaries).forEach(kid => {
    const fertMap = kebeleFertilizerMaps[kid] || {};
    kebeleSummaries[kid].fertilizerBreakdown = Object.entries(fertMap).map(([type, amount]) => ({
      type,
      amount: `${amount} Qt`
    }));
  });

  return {
    woredaName: woreda.name,
    productionSeason: activeSeason.name,
    regionalFlagUrl: flag?.imageUrl,
    totalAmount: `${woredaTotalAmount} Qt`,
    fertilizerBreakdown: Object.entries(woredaSummaryMap).map(([type, amount]) => ({ 
      type, 
      amount: `${amount} Qt` 
    })),
    kebeles: Object.values(kebeleSummaries)
  };
};

export const getWoredaAdjustmentTable = async (user: any, seasonName?: string) => {
  const { woredaId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const demands = await prisma.farmerDemand.findMany({
    where: { seasonId: activeSeason.id, farmer: { kebele: { woredaId } } },
    include: { fertilizerType: true, farmer: { select: { farmAreaHectares: true } } }
  });

  const summaryMap: Record<string, any> = {};
  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const typeId = d.fertilizerTypeId;
    if (!summaryMap[typeId]) {
      summaryMap[typeId] = { 
        fertilizerType: type, 
        fertilizerTypeId: typeId,
        collectedQty: 0, 
        intelligenceQty: 0, 
        kebeleAdjustedQty: 0, 
        woredaAdjustedQty: 0 
      };
    }
    const item = summaryMap[typeId];
    item.collectedQty += d.originalQuantity;
    item.intelligenceQty += (d.farmer.farmAreaHectares || 0) * (type.toLowerCase().includes('urea') ? 2.5 : 2.0);
    item.kebeleAdjustedQty += d.kebeleAdjustedQuantity || 0;
    item.woredaAdjustedQty += d.woredaAdjustedQuantity || 0;
  });

  const lockStatus = await prisma.farmerDemand.findFirst({
    where: { seasonId: activeSeason.id, farmer: { kebele: { woredaId } }, lockedAtLevel: { not: LockingLevel.NONE } },
    select: { lockedAtLevel: true }
  });

  return {
    adjustmentTable: Object.values(summaryMap),
    lockingStatus: {
      isLocked: !!lockStatus,
      lockedAt: lockStatus?.lockedAtLevel || 'NONE'
    }
  };
};

export const woredaAdjust = async (data: any, user: any) => {
  const { fertilizerTypeId, adjustments } = data; // adjustments: [{ kebeleId, quantity }]
  const { woredaId } = user;

  return await prisma.$transaction(async (tx) => {
    for (const adj of adjustments) {
      const isLocked = await tx.farmerDemand.findFirst({
        where: { 
          farmer: { kebeleId: adj.kebeleId, kebele: { woredaId } }, 
          fertilizerTypeId, 
          lockedAtLevel: { in: [LockingLevel.WOREDA, LockingLevel.ZONE, LockingLevel.REGION, LockingLevel.MOA] } 
        }
      });
      if (isLocked) throw new Error(`Kebele ${adj.kebeleId} is locked at ${isLocked.lockedAtLevel} level`);

      await tx.farmerDemand.updateMany({
        where: { farmer: { kebeleId: adj.kebeleId, kebele: { woredaId } }, fertilizerTypeId },
        data: { woredaAdjustedQuantity: adj.quantity, status: DemandStatus.APPROVED, lockedAtLevel: LockingLevel.WOREDA }
      });
    }
    return { success: true };
  });
};

export const woredaLock = async (data: any, user: any) => {
  const { kebeleId, lock } = data;
  const { woredaId } = user;
  const level = lock ? LockingLevel.WOREDA : LockingLevel.NONE;

  await prisma.farmerDemand.updateMany({
    where: { 
      farmer: { 
        kebele: { woredaId },
        ...(kebeleId && { kebeleId })
      } 
    },
    data: { lockedAtLevel: level }
  });
  return { success: true, level };
};

/** --- ZONE MODULE --- **/

export const getZoneSummary = async (user: any, seasonName?: string) => {
  const { zoneId, regionId, role } = user;
  const [zone, activeSeason, flag] = await Promise.all([
    prisma.zone.findUnique({ 
      where: { id: zoneId },
      include: { 
        woredas: {
          include: { kebeles: true }
        }
      }
    }),
    getActiveSeason(seasonName),
    role === 'SUPER_ADMIN' ? Promise.resolve(null) : getRegionalFlag(regionId)
  ]);

  if (!activeSeason || !zone) return null;

  const demands = await prisma.farmerDemand.findMany({
    where: { 
      seasonId: activeSeason.id, 
      farmer: { kebele: { woreda: { zoneId } } } 
    },
    include: { 
      fertilizerType: true,
      farmer: { 
        include: { 
          kebele: { 
            include: { woreda: true } 
          } 
        } 
      }
    }
  });

  // Aggregators
  const zoneSummaryMap: Record<string, number> = {};
  let zoneTotalAmount = 0;

  // Hierarchical Structure: Woreda -> Kebele -> Fertilizer Summary
  const woredaData: Record<string, { 
    name: string, 
    totalAmount: number, 
    fertilizerBreakdown: any[], 
    kebeles: Record<string, { name: string, totalAmount: number, fertilizerBreakdown: any[] }> 
  }> = {};

  // Initialize Structure
  zone.woredas.forEach(w => {
    woredaData[w.id] = { name: w.name, totalAmount: 0, fertilizerBreakdown: [], kebeles: {} };
    w.kebeles.forEach(k => {
      woredaData[w.id].kebeles[k.id] = { name: k.name, totalAmount: 0, fertilizerBreakdown: [] };
    });
  });

  const woredaFertilizerMaps: Record<string, Record<string, number>> = {};
  const kebeleFertilizerMaps: Record<string, Record<string, number>> = {};

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const kid = d.farmer.kebeleId;
    const wid = d.farmer.kebele.woredaId;

    // Zone aggregation
    zoneSummaryMap[type] = (zoneSummaryMap[type] || 0) + d.originalQuantity;
    zoneTotalAmount += d.originalQuantity;

    // Woreda aggregation
    if (woredaData[wid]) {
      woredaData[wid].totalAmount += d.originalQuantity;
      if (!woredaFertilizerMaps[wid]) woredaFertilizerMaps[wid] = {};
      woredaFertilizerMaps[wid][type] = (woredaFertilizerMaps[wid][type] || 0) + d.originalQuantity;

      // Kebele aggregation
      if (woredaData[wid].kebeles[kid]) {
        woredaData[wid].kebeles[kid].totalAmount += d.originalQuantity;
        if (!kebeleFertilizerMaps[kid]) kebeleFertilizerMaps[kid] = {};
        kebeleFertilizerMaps[kid][type] = (kebeleFertilizerMaps[kid][type] || 0) + d.originalQuantity;
      }
    }
  });

  // Final Transformation
  const woredas = Object.entries(woredaData).map(([wid, w]) => {
    const woredaFertMap = woredaFertilizerMaps[wid] || {};
    return {
      woredaName: w.name,
      totalAmount: `${w.totalAmount} Qt`,
      fertilizerBreakdown: Object.entries(woredaFertMap).map(([type, amount]) => ({ type, amount: `${amount} Qt` })),
      kebeles: Object.entries(w.kebeles).map(([kid, k]) => {
        const kebeleFertMap = kebeleFertilizerMaps[kid] || {};
        return {
          kebeleName: k.name,
          totalAmount: `${k.totalAmount} Qt`,
          fertilizerBreakdown: Object.entries(kebeleFertMap).map(([type, amount]) => ({ type, amount: `${amount} Qt` }))
        };
      })
    };
  });

  return {
    zoneName: zone.name,
    productionSeason: activeSeason.name,
    regionalFlagUrl: flag?.imageUrl,
    totalAmount: `${zoneTotalAmount} Qt`,
    fertilizerBreakdown: Object.entries(zoneSummaryMap).map(([type, amount]) => ({ 
      type, 
      amount: `${amount} Qt` 
    })),
    woredas
  };
};

export const getZoneAdjustmentTable = async (user: any, seasonName?: string) => {
  const { zoneId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const woredas = await prisma.woreda.findMany({
    where: { zoneId },
    include: {
      kebeles: {
        include: {
          farmers: {
            include: {
              demands: {
                where: { seasonId: activeSeason.id },
                include: { fertilizerType: true }
              }
            }
          }
        }
      }
    }
  });

  const result = woredas.map(w => {
    const summaryMap: Record<string, any> = {};
    w.kebeles.forEach(k => {
      k.farmers.forEach(f => {
        f.demands.forEach(d => {
          const type = d.fertilizerType.name;
          const typeId = d.fertilizerTypeId;
          if (!summaryMap[typeId]) {
            summaryMap[typeId] = {
              fertilizerType: type,
              fertilizerTypeId: typeId,
              collectedQty: 0,
              woredaAdjustedQty: 0,
              zoneAdjustedQty: 0
            };
          }
          summaryMap[typeId].collectedQty += d.originalQuantity;
          summaryMap[typeId].woredaAdjustedQty += d.woredaAdjustedQuantity || 0;
          summaryMap[typeId].zoneAdjustedQty += d.zoneAdjustedQuantity || 0;
        });
      });
    });
    return {
      woredaName: w.name,
      woredaId: w.id,
      adjustments: Object.values(summaryMap)
    };
  });

  const lockStatus = await prisma.farmerDemand.findFirst({
    where: { seasonId: activeSeason.id, farmer: { kebele: { woreda: { zoneId } } }, lockedAtLevel: { in: [LockingLevel.ZONE, LockingLevel.REGION, LockingLevel.MOA] } },
    select: { lockedAtLevel: true }
  });

  return {
    adjustmentTable: result,
    lockingStatus: {
      isLocked: !!lockStatus,
      lockedAt: lockStatus?.lockedAtLevel || 'NONE'
    }
  };
};

export const zoneAdjust = async (data: any, user: any) => {
  const { fertilizerTypeId, adjustments } = data; // adjustments: [{ woredaId, quantity }]
  const { zoneId } = user;

  return await prisma.$transaction(async (tx) => {
    for (const adj of adjustments) {
      const isLocked = await tx.farmerDemand.findFirst({
        where: { 
          farmer: { kebele: { woreda: { id: adj.woredaId, zoneId } } },
          fertilizerTypeId, 
          lockedAtLevel: { in: [LockingLevel.ZONE, LockingLevel.REGION, LockingLevel.MOA] } 
        }
      });
      if (isLocked) throw new Error(`Woreda ${adj.woredaId} is locked at ${isLocked.lockedAtLevel} level`);

      await tx.farmerDemand.updateMany({
        where: { farmer: { kebele: { woreda: { id: adj.woredaId, zoneId } } }, fertilizerTypeId },
        data: { zoneAdjustedQuantity: adj.quantity, status: DemandStatus.APPROVED, lockedAtLevel: LockingLevel.ZONE }
      });
    }
    return { success: true };
  });
};

export const zoneLock = async (data: any, user: any) => {
  const { woredaId, lock } = data;
  const { zoneId } = user;
  const level = lock ? LockingLevel.ZONE : LockingLevel.NONE;

  await prisma.farmerDemand.updateMany({
    where: { 
      farmer: { 
        kebele: { woreda: { zoneId } },
        ...(woredaId && { kebele: { woredaId } })
      } 
    },
    data: { lockedAtLevel: level }
  });
  return { success: true, level };
};

/** --- GENERIC LISTS & CRUD --- **/

export const getDemandDetailList = async (params: any, scope: any) => {
  const { q, status, fertilizerType, page = 1, limit = 10, seasonName, kebeleId, woredaId: filterWoredaId } = params;
  const { regionId, zoneId, woredaId: scopeWoredaId, role } = scope;

  const where: any = {};
  // Scoping
  if (scopeWoredaId) where.farmer = { kebele: { woredaId: scopeWoredaId } };
  else if (zoneId) where.farmer = { kebele: { woreda: { zoneId } } };
  else if (regionId) where.farmer = { kebele: { woreda: { zone: { regionId } } } };

  // Filters
  if (seasonName) where.season = { name: seasonName };
  if (status) where.status = status as DemandStatus;
  if (fertilizerType) where.fertilizerType = { name: fertilizerType };
  if (kebeleId) where.farmer = { ...where.farmer, kebeleId };
  if (filterWoredaId) where.farmer = { ...where.farmer, kebele: { woredaId: filterWoredaId } };

  // Search
  if (q) {
    where.OR = [
      { id: { contains: q, mode: 'insensitive' } },
      { farmer: { fullName: { contains: q, mode: 'insensitive' } } },
      { farmer: { uniqueFarmerId: { contains: q, mode: 'insensitive' } } }
    ];
  }

  const [demands, totalCount] = await Promise.all([
    prisma.farmerDemand.findMany({
      where, skip: (page - 1) * limit, take: limit,
      include: { 
        farmer: { include: { kebele: { include: { woreda: { include: { zone: true } } } } } }, 
        fertilizerType: true, 
        season: true 
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.farmerDemand.count({ where })
  ]);

  const mappedDemands = demands.map((d) => ({
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
    permissions: { 
      canEdit: d.status === DemandStatus.PENDING, 
      canDelete: d.status === DemandStatus.PENDING 
    }
  }));

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

export const createBatchFarmerDemands = async (data: any) => {
  const { farmerId, seasonId, cropTypeIds, fertilizers, generateRequestId } = data;
  return await prisma.$transaction(async (tx) => {
    let count = 0;
    for (const cropId of cropTypeIds) {
      for (const fert of fertilizers) {
        await tx.farmerDemand.create({
          data: {
            id: generateRequestId(),
            farmerId,
            seasonId,
            cropTypeId: cropId,
            fertilizerTypeId: fert.fertilizerTypeId,
            originalQuantity: fert.quantity,
            status: DemandStatus.PENDING,
            lockedAtLevel: LockingLevel.NONE
          }
        });
        count++;
      }
    }
    return { count };
  });
};

export const deleteFarmerDemand = async (id: string, p0: { originalQuantity: number; fertilizerTypeId: any; }) => {
  const demand = await prisma.farmerDemand.findUnique({ where: { id } });
  if (!demand || demand.status !== DemandStatus.PENDING) throw new Error('Not found or cannot be deleted');
  return await prisma.farmerDemand.delete({ where: { id } });
};
export function getDemandDashboardSummary(arg0: { page: number; limit: number; status: string; seasonName: string; }, arg1: { regionId: any; zoneId: any; woredaId: any; kebeleId: any; }) {
  throw new Error('Function not implemented.');
}

export function adjustFarmerDemand(arg0: string, arg1: number, targetLevel: string, role: any) {
  throw new Error('Function not implemented.');
}

/**
 * Fetches a single demand record by ID.
 * Ensuring this returns the object (and not void) fixes the 'status' property error.
 */
export const getDemandById = async (id: string) => {
  const demand = await prisma.farmerDemand.findUnique({
    where: { id },
    include: { 
      fertilizerType: true,
      farmer: true // Useful for checking context/location
    }
  });
  
  return demand; 
};

// export function getDemandById(arg0: string) {
//   throw new Error('Function not implemented.');
// }

export function updateFarmerDemand(arg0: string, arg1: { originalQuantity: number; fertilizerTypeId: any; }) {
  throw new Error('Function not implemented.');
}

