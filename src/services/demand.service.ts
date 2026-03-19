import prisma from '../config/prisma.js';
import type { DemandsResponse, DemandSummary, Kebele, FertilizerBreakdown, Pagination, DashboardSummaryOutput, HierarchicalSummary } from '../types/demand.js';
import { Prisma, DemandStatus, LockingLevel, Role, DemandPriority } from '@prisma/client';
import { AuthenticatedUser } from '../types/express.js';

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

export const getEffectiveQty = (d: any) => 
  d.moaAdjustedQuantity ?? 
  d.regionAdjustedQuantity ?? 
  d.zoneAdjustedQuantity ?? 
  d.woredaAdjustedQuantity ?? 
  d.kebeleAdjustedQuantity ?? 
  d.originalQuantity;

/** --- BASIC FETCHERS --- **/
export const getSeasons = async () => await prisma.season.findMany();
export const getSeasonByName = async (name: string) => await prisma.season.findUnique({ where: { name } });
export const getCropCategories = async () => await prisma.cropCategory.findMany({ include: { cropTypes: true } });
export const getFertilizerTypes = async () => await prisma.fertilizerType.findMany();

/** --- KEBELE MODULE --- **/

export const getKebeleSummary = async (user: AuthenticatedUser, seasonName?: string): Promise<DashboardSummaryOutput | null> => {
  const { kebeleId, regionId, role } = user;
  const [kebele, activeSeason, flag] = await Promise.all([
    prisma.kebele.findUnique({ 
      where: { id: kebeleId || '' },
      include: { sections: true }
    }),
    getActiveSeason(seasonName),
    role === Role.SUPER_ADMIN ? Promise.resolve(null) : getRegionalFlag(regionId)
  ]);

  if (!activeSeason) {
    throw new Error('Active season not found.');
  }
  if (!kebele) {
    throw new Error(`Kebele with ID ${kebeleId} not found.`);
  }

  const demands = await prisma.farmerDemand.findMany({
    where: { 
      seasonId: activeSeason.id, 
      farmer: { kebeleId } 
    },
    include: { 
      fertilizerType: { select: { id: true, name: true } }
    }
  });

  const summaryMap: Record<string, { original: number, adjusted: number, fertilizerTypeId: string }> = {};
  let totalAmount = 0;
  let totalAdjustedAmount = 0;

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const fertilizerTypeId = d.fertilizerType.id;
    const effective = getEffectiveQty(d);
    if (!summaryMap[type]) summaryMap[type] = { original: 0, adjusted: 0, fertilizerTypeId };
    summaryMap[type].original += d.originalQuantity;
    summaryMap[type].adjusted += effective;
    totalAmount += d.originalQuantity;
    totalAdjustedAmount += effective;
  });

  return {
    woredaId: kebeleId,
    woredaName: kebele.name,
    productionSeason: activeSeason.name,
    totalAmount: totalAmount,
    totalAdjustedAmount: totalAdjustedAmount,
    fertilizerBreakdown: Object.entries(summaryMap).map(([type, counts]) => ({ 
      type, 
      originalAmount: counts.original,
      adjustedAmount: counts.adjusted,
      fertilizerTypeId: counts.fertilizerTypeId
    })),
  };
};

export const getKebeleAdjustmentTable = async (user: AuthenticatedUser, seasonName?: string) => {
  const { kebeleId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const demands = await prisma.farmerDemand.findMany({
    where: { seasonId: activeSeason.id, farmer: { kebeleId: kebeleId || '' } },
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
        kebeleAdjustedQty: 0 
      };
    }
    const item = summaryMap[typeId];
    item.collectedQty += d.originalQuantity;
    item.intelligenceQty += (d.farmer.farmAreaHectares || 0) * (type.toLowerCase().includes('urea') ? 2.5 : 2.0);
    item.kebeleAdjustedQty += d.kebeleAdjustedQuantity || 0;
  });

  const lockStatus = await prisma.farmerDemand.findFirst({
    where: { seasonId: activeSeason.id, farmer: { kebeleId }, lockedAtLevel: { not: LockingLevel.NONE } },
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

export const kebeleAdjust = async (data: any, user: AuthenticatedUser) => {
  const { fertilizerTypeId, quantity } = data;
  const { kebeleId } = user;

  const isLocked = await prisma.farmerDemand.findFirst({
    where: { 
      farmer: { kebeleId: kebeleId || '' }, 
      fertilizerTypeId, 
      lockedAtLevel: { in: [LockingLevel.KEBELE, LockingLevel.WOREDA, LockingLevel.ZONE, LockingLevel.REGION, LockingLevel.MOA] } 
    }
  });

  if (isLocked) throw new Error(`Kebele is locked at ${isLocked.lockedAtLevel} level`);

  await prisma.farmerDemand.updateMany({
    where: { farmer: { kebeleId: kebeleId || '' }, fertilizerTypeId },
    data: { 
      kebeleAdjustedQuantity: quantity, 
      status: DemandStatus.APPROVED, 
      lockedAtLevel: LockingLevel.KEBELE 
    }
  });

  return { success: true };
};

export const kebeleLock = async (data: any, user: AuthenticatedUser) => {
  const { lock } = data;
  const { kebeleId } = user;
  const level = lock ? LockingLevel.KEBELE : LockingLevel.NONE;

  await prisma.farmerDemand.updateMany({
    where: { farmer: { kebeleId: kebeleId || '' } },
    data: { lockedAtLevel: level }
  });
  return { success: true, level };
};

/** --- WOREDA MODULE --- **/

export const getWoredaSummary = async (user: AuthenticatedUser, seasonName?: string): Promise<DashboardSummaryOutput | null> => {
  const { woredaId, regionId, role } = user;
  const [woreda, activeSeason, flag] = await Promise.all([
    prisma.woreda.findUnique({ 
      where: { id: woredaId || '' },
      include: { 
        kebeles: true,
        zone: { include: { region: true } }
      }
    }),
    getActiveSeason(seasonName),
    role === Role.SUPER_ADMIN ? Promise.resolve(null) : getRegionalFlag(regionId)
  ]);

  if (!activeSeason) {
    throw new Error('Active season not found.');
  }
  if (!woreda) {
    throw new Error(`Woreda with ID ${woredaId} not found.`);
  }

  const demands = await prisma.farmerDemand.findMany({
    where: { 
      seasonId: activeSeason.id, 
      farmer: { kebele: { woredaId } } 
    },
    include: { 
      fertilizerType: { select: { id: true, name: true } },
      farmer: { select: { kebeleId: true } }
    }
  });

  // Calculate Woreda Summary
  const woredaSummaryMap: Record<string, { original: number, adjusted: number, fertilizerTypeId: string }> = {};
  let woredaTotalAmount = 0;
  let woredaTotalAdjustedAmount = 0;

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const fertilizerTypeId = d.fertilizerType.id;
    const effective = getEffectiveQty(d);

    // Woreda aggregation
    if (!woredaSummaryMap[type]) woredaSummaryMap[type] = { original: 0, adjusted: 0, fertilizerTypeId };
    woredaSummaryMap[type].original += d.originalQuantity;
    woredaSummaryMap[type].adjusted += effective;
    woredaTotalAmount += d.originalQuantity;
    woredaTotalAdjustedAmount += effective;
  });

  return {
    woredaId: woreda.id,
    woredaName: woreda.name,
    productionSeason: activeSeason.name,
    totalAmount: woredaTotalAmount,
    totalAdjustedAmount: woredaTotalAdjustedAmount,
    fertilizerBreakdown: Object.entries(woredaSummaryMap).map(([type, counts]) => ({
      type,
      originalAmount: counts.original,
      adjustedAmount: counts.adjusted,
      fertilizerTypeId: counts.fertilizerTypeId
    })),
  };
};

export const getWoredaAdjustmentTable = async (user: AuthenticatedUser, seasonName?: string) => {
  const { woredaId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const demands = await prisma.farmerDemand.findMany({
    where: { seasonId: activeSeason.id, farmer: { kebele: { woredaId: woredaId || '' } } },
    include: { 
      fertilizerType: true, 
      farmer: { 
        include: { 
          kebele: true 
        } 
      } 
    }
  });

  const summaryMap: Record<string, any> = {};
  
  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const typeId = d.fertilizerTypeId;
    const k = d.farmer.kebele;

    if (!summaryMap[typeId]) {
      summaryMap[typeId] = { 
        fertilizerType: type, 
        fertilizerTypeId: typeId,
        collectedQty: 0, 
        intelligenceQty: 0, 
        kebeleAdjustedQty: 0, 
        woredaAdjustedQty: 0,
        kebeles: {} // Nested kebele breakdown
      };
    }
    
    const item = summaryMap[typeId];
    item.collectedQty += d.originalQuantity;
    item.intelligenceQty += (d.farmer.farmAreaHectares || 0) * (type.toLowerCase().includes('urea') ? 2.5 : 2.0);
    item.kebeleAdjustedQty += d.kebeleAdjustedQuantity || 0;
    item.woredaAdjustedQty += d.woredaAdjustedQuantity || 0;

    if (k) {
      if (!item.kebeles[k.id]) {
        item.kebeles[k.id] = {
          kebeleId: k.id,
          kebeleName: k.name,
          collectedQty: 0,
          kebeleAdjustedQty: 0,
          woredaAdjustedQty: 0
        };
      }
      const kItem = item.kebeles[k.id];
      kItem.collectedQty += d.originalQuantity;
      kItem.kebeleAdjustedQty += d.kebeleAdjustedQuantity || 0;
      kItem.woredaAdjustedQty += d.woredaAdjustedQuantity || 0;
    }
  });

  // Convert nested kebeles from object to array
  const adjustmentTable = Object.values(summaryMap).map((item: any) => ({
    ...item,
    kebeles: Object.values(item.kebeles)
  }));

  const lockStatus = await prisma.farmerDemand.findFirst({
    where: { seasonId: activeSeason.id, farmer: { kebele: { woredaId } }, lockedAtLevel: { not: LockingLevel.NONE } },
    select: { lockedAtLevel: true }
  });

  return {
    adjustmentTable,
    lockingStatus: {
      isLocked: !!lockStatus,
      lockedAt: lockStatus?.lockedAtLevel || 'NONE'
    }
  };
};

export const woredaAdjust = async (data: any, user: AuthenticatedUser) => {
  const { fertilizerTypeId, adjustments } = data; // adjustments: [{ kebeleId, quantity }]
  const { woredaId } = user;

  return await prisma.$transaction(async (tx) => {
    for (const adj of adjustments) {
      const isLocked = await tx.farmerDemand.findFirst({
        where: { 
          farmer: { kebeleId: adj.kebeleId, kebele: { woredaId: woredaId || '' } }, 
          fertilizerTypeId, 
          lockedAtLevel: { in: [LockingLevel.WOREDA, LockingLevel.ZONE, LockingLevel.REGION, LockingLevel.MOA] } 
        }
      });
      if (isLocked) throw new Error(`Kebele ${adj.kebeleId} is locked at ${isLocked.lockedAtLevel} level`);

      await tx.farmerDemand.updateMany({
        where: { farmer: { kebeleId: adj.kebeleId, kebele: { woredaId: woredaId || '' } }, fertilizerTypeId },
        data: { woredaAdjustedQuantity: adj.quantity, status: DemandStatus.APPROVED, lockedAtLevel: LockingLevel.WOREDA }
      });
    }
    return { success: true };
  });
};

export const woredaLock = async (data: any, user: AuthenticatedUser) => {
  const { kebeleId, lock } = data;
  const { woredaId } = user;
  const level = lock ? LockingLevel.WOREDA : LockingLevel.NONE;

  await prisma.farmerDemand.updateMany({
    where: { 
      farmer: { 
        kebele: { woredaId: woredaId || '' },
        ...(kebeleId && { kebeleId })
      } 
    },
    data: { lockedAtLevel: level }
  });
  return { success: true, level };
};

/** --- ZONE MODULE --- **/

export const getZoneSummary = async (user: AuthenticatedUser, seasonName?: string): Promise<DashboardSummaryOutput | null> => {
  const { zoneId, regionId, role } = user;
  const [zone, activeSeason, flag] = await Promise.all([
    prisma.zone.findUnique({ 
      where: { id: zoneId || '' },
      include: { 
        woredas: {
          include: {
            kebeles: true,
            zone: { include: { region: true } } // Include zone and region at woreda level
          }
        }
      }
    }),
    getActiveSeason(seasonName),
    role === Role.SUPER_ADMIN ? Promise.resolve(null) : getRegionalFlag(regionId)
  ]);

  if (!activeSeason) {
    throw new Error('Active season not found.');
  }
  if (!zone) {
    throw new Error(`Zone with ID ${zoneId} not found.`);
  }

  const demands = await prisma.farmerDemand.findMany({
    where: { 
      seasonId: activeSeason.id, 
      farmer: { kebele: { woreda: { zoneId } } } 
    },
    include: { 
      fertilizerType: { select: { id: true, name: true } },
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
      }
    }
  });

  // Aggregators
  const zoneSummaryMap: Record<string, { original: number, adjusted: number, fertilizerTypeId: string }> = {};
  let zoneTotalAmount = 0;
  let zoneTotalAdjustedAmount = 0;

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const fertilizerTypeId = d.fertilizerType.id;
    const effective = getEffectiveQty(d);

    // Zone aggregation
    if (!zoneSummaryMap[type]) zoneSummaryMap[type] = { original: 0, adjusted: 0, fertilizerTypeId };
    zoneSummaryMap[type].original += d.originalQuantity;
    zoneSummaryMap[type].adjusted += effective;
    zoneTotalAmount += d.originalQuantity;
    zoneTotalAdjustedAmount += effective;
  });

  return {
    woredaId: zone.id,
    woredaName: zone.name,
    productionSeason: activeSeason.name,
    totalAmount: zoneTotalAmount,
    totalAdjustedAmount: zoneTotalAdjustedAmount,
    fertilizerBreakdown: Object.entries(zoneSummaryMap).map(([type, counts]) => ({
      type,
      originalAmount: counts.original,
      adjustedAmount: counts.adjusted,
      fertilizerTypeId: counts.fertilizerTypeId
    })),
  };
};

export const getRegionSummary = async (user: AuthenticatedUser, seasonName?: string): Promise<DashboardSummaryOutput | null> => {
  const { regionId, role } = user;
  const [region, activeSeason, flag] = await Promise.all([
    prisma.region.findUnique({
      where: { id: regionId || '' },
      include: {
        zones: {
          include: {
            woredas: {
              include: {
                kebeles: true,
              },
            },
          },
        },
      },
    }),
    getActiveSeason(seasonName),
    role === Role.SUPER_ADMIN ? Promise.resolve(null) : getRegionalFlag(regionId),
  ]);

  if (!activeSeason) {
    throw new Error('Active season not found.');
  }
  if (!region) {
    throw new Error(`Region with ID ${regionId} not found.`);
  }

  const demands = await prisma.farmerDemand.findMany({
    where: {
      seasonId: activeSeason.id,
      farmer: { kebele: { woreda: { zone: { regionId: regionId || '' } } } },
    },
    include: {
      fertilizerType: { select: { id: true, name: true } }, // Include fertilizerType ID
      farmer: {
        include: {
          kebele: {
            include: {
              woreda: {
                include: { zone: true },
              },
            },
          },
        },
      },
    },
  });

  const regionSummaryMap: Record<string, { original: number, adjusted: number, fertilizerTypeId: string }> = {};
  let regionTotalAmount = 0;
  let regionTotalAdjustedAmount = 0;

  demands.forEach((d) => {
    const type = d.fertilizerType.name;
    const fertilizerTypeId = d.fertilizerType.id;
    const effective = getEffectiveQty(d);

    if (!regionSummaryMap[type]) regionSummaryMap[type] = { original: 0, adjusted: 0, fertilizerTypeId };
    regionSummaryMap[type].original += d.originalQuantity;
    regionSummaryMap[type].adjusted += effective;
    regionTotalAmount += d.originalQuantity;
    regionTotalAdjustedAmount += effective;
  });

  return {
    woredaId: region.id,
    woredaName: region.name,
    productionSeason: activeSeason.name,
    totalAmount: regionTotalAmount,
    totalAdjustedAmount: regionTotalAdjustedAmount,
    fertilizerBreakdown: Object.entries(regionSummaryMap).map(([type, counts]) => ({
      type,
      originalAmount: counts.original,
      adjustedAmount: counts.adjusted,
      fertilizerTypeId: counts.fertilizerTypeId
    })),
  };
};

export const getZoneAdjustmentTable = async (user: AuthenticatedUser, seasonName?: string) => {
  const { zoneId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const woredas = await prisma.woreda.findMany({
    where: { zoneId: zoneId || '' },
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
    where: { seasonId: activeSeason.id, farmer: { kebele: { woreda: { zoneId: zoneId || '' } } }, lockedAtLevel: { in: [LockingLevel.ZONE, LockingLevel.REGION, LockingLevel.MOA] } },
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

export const zoneAdjust = async (data: any, user: AuthenticatedUser) => {
  const { fertilizerTypeId, adjustments } = data; // adjustments: [{ woredaId, quantity }]
  const { zoneId } = user;

  return await prisma.$transaction(async (tx) => {
    for (const adj of adjustments) {
      const isLocked = await tx.farmerDemand.findFirst({
        where: { 
          farmer: { kebele: { woreda: { id: adj.woredaId, zoneId: zoneId || '' } } },
          fertilizerTypeId, 
          lockedAtLevel: { in: [LockingLevel.ZONE, LockingLevel.REGION, LockingLevel.MOA] } 
        }
      });
      if (isLocked) throw new Error(`Woreda ${adj.woredaId} is locked at ${isLocked.lockedAtLevel} level`);

      await tx.farmerDemand.updateMany({
        where: { farmer: { kebele: { woreda: { id: adj.woredaId, zoneId: zoneId || '' } } }, fertilizerTypeId },
        data: { zoneAdjustedQuantity: adj.quantity, status: DemandStatus.APPROVED, lockedAtLevel: LockingLevel.ZONE }
      });
    }
    return { success: true };
  });
};

export const zoneLock = async (data: any, user: AuthenticatedUser) => {
  const { woredaId, lock } = data;
  const { zoneId } = user;
  const level = lock ? LockingLevel.ZONE : LockingLevel.NONE;

  await prisma.farmerDemand.updateMany({
    where: { 
      farmer: { 
        kebele: { woreda: { zoneId: zoneId || '' } },
        ...(woredaId && { kebele: { woredaId } })
      } 
    },
    data: { lockedAtLevel: level }
  });
  return { success: true, level };
};

/** --- GENERIC LISTS & CRUD --- **/

export const getDemandDetailList = async (params: any, scope: AuthenticatedUser) => {
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
    kebeleId: d.farmer.kebeleId,
    kebele: d.farmer.kebele.name, 
    woredaId: d.farmer.kebele.woredaId,
    woreda: d.farmer.kebele.woreda.name,
    zoneId: d.farmer.kebele.woreda.zoneId,
    zone: d.farmer.kebele.woreda.zone.name, 
    regionId: d.farmer.kebele.woreda.zone.regionId,
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

/** --- REGION MODULE --- **/

/**
 * Validates lot data consistency.
 * Rules:
 * - ureaAmount and dapAmount must be non-negative.
 * - totalQuantity must be equal to the sum of ureaAmount and dapAmount.
 */
export const validateLotData = (data: { ureaAmount?: number, dapAmount?: number, totalQuantity: number }) => {
  const urea = data.ureaAmount || 0;
  const dap = data.dapAmount || 0;
  if (urea < 0 || dap < 0) {
    throw new Error('Fertilizer amounts cannot be negative');
  }
  if (Math.abs(urea + dap - data.totalQuantity) > 0.01) {
    throw new Error('Total quantity must be the sum of urea and dap amounts');
  }
};

/**
 * Helper to calculate lot composition and total amount.
 * 
 * Business Rules:
 * - totalFertilizerAmount = ureaAmount + dapAmount
 * - fertilizerType is derived from the amounts:
 *   - Both > 0: "Urea & DAP"
 *   - Urea > 0: "Urea"
 *   - DAP > 0: "DAP"
 *   - Both <= 0: "None"
 */
export const mapLotResponse = (l: any) => {
  const urea = l.ureaAmount || 0;
  const dap = l.dapAmount || 0;
  const total = urea + dap;

  let type = 'None';
  if (urea > 0 && dap > 0) type = 'Urea & DAP';
  else if (urea > 0) type = 'Urea';
  else if (dap > 0) type = 'DAP';

  return {
    id: l.id,
    lotNumber: l.lotNumber,
    totalFertilizerAmount: `${total} Qt`,
    ureaAmount: `${urea} Qt`,
    dapAmount: `${dap} Qt`,
    fertilizerType: type
  };
};



export const getRegionAdjustmentTable = async (user: AuthenticatedUser, seasonName?: string) => {
  const { regionId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const zones = await prisma.zone.findMany({
    where: { regionId: regionId || '' },
    include: {
      woredas: {
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
      }
    }
  });

  const result = zones.map(z => {
    const summaryMap: Record<string, any> = {};
    z.woredas.forEach(w => {
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
                zoneAdjustedQty: 0,
                regionAdjustedQty: 0
              };
            }
            summaryMap[typeId].collectedQty += d.originalQuantity;
            summaryMap[typeId].zoneAdjustedQty += d.zoneAdjustedQuantity || 0;
            summaryMap[typeId].regionAdjustedQty += d.regionAdjustedQuantity || 0;
          });
        });
      });
    });
    return {
      zoneName: z.name,
      zoneId: z.id,
      adjustments: Object.values(summaryMap)
    };
  });

  const lockStatus = await prisma.farmerDemand.findFirst({
    where: { 
      seasonId: activeSeason.id, 
      farmer: { kebele: { woreda: { zone: { regionId: regionId || '' } } } }, 
      lockedAtLevel: { in: [LockingLevel.REGION, LockingLevel.MOA] } 
    },
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

export const regionAdjust = async (data: any, user: AuthenticatedUser) => {
  const { fertilizerTypeId, adjustments } = data; // adjustments: [{ zoneId, quantity }]
  const { regionId } = user;

  return await prisma.$transaction(async (tx) => {
    for (const adj of adjustments) {
      const isLocked = await tx.farmerDemand.findFirst({
        where: { 
          farmer: { kebele: { woreda: { zone: { id: adj.zoneId, regionId: regionId || '' } } } }, 
          fertilizerTypeId, 
          lockedAtLevel: { in: [LockingLevel.REGION, LockingLevel.MOA] } 
        }
      });
      if (isLocked) throw new Error(`Zone ${adj.zoneId} is locked at ${isLocked.lockedAtLevel} level`);

      await tx.farmerDemand.updateMany({
        where: { farmer: { kebele: { woreda: { zone: { id: adj.zoneId, regionId: regionId || '' } } } }, fertilizerTypeId },
        data: { regionAdjustedQuantity: adj.quantity, status: DemandStatus.APPROVED, lockedAtLevel: LockingLevel.REGION }
      });
    }
    return { success: true };
  });
};

export const regionLock = async (data: any, user: AuthenticatedUser) => {
  const { zoneId, lock } = data;
  const { regionId } = user;
  const level = lock ? LockingLevel.REGION : LockingLevel.NONE;

  await prisma.farmerDemand.updateMany({
    where: { 
      farmer: {
        kebele: { woreda: { zone: { regionId: regionId || '' } } },
        ...(zoneId && { kebele: { woreda: { zoneId } } })
      } 
    },
    data: { lockedAtLevel: level }
  });
  return { success: true, level };
};

/** --- FEDERAL (MOA) MODULE --- **/

export const getFederalDashboard = async (seasonName?: string) => {
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const [unionsCount, destinationsCount, pcsCount, regions] = await Promise.all([
    prisma.union.count(),
    prisma.destination.count(),
    prisma.pC.count(),
    prisma.region.findMany({
      include: {
        regionalFlag: true,
        zones: {
          include: {
            woredas: {
              include: {
                kebeles: true
              }
            }
          }
        },
        unions: {
          include: {
            destinations: {
              include: {
                pcs: true
              }
            }
          }
        }
      }
    }),
    // getOrCreateFederalFlag()
  ]);

  const demands = await prisma.farmerDemand.findMany({
    where: { seasonId: activeSeason.id },
    include: { fertilizerType: true }
  });

  const totalSummary: Record<string, { original: number, adjusted: number }> = {};
  let grandTotal = 0;
  let grandTotalAdjusted = 0;

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const effective = getEffectiveQty(d);
    if (!totalSummary[type]) totalSummary[type] = { original: 0, adjusted: 0 };
    totalSummary[type].original += d.originalQuantity;
    totalSummary[type].adjusted += effective;
    grandTotal += d.originalQuantity;
    grandTotalAdjusted += effective;
  });

  return {
    productionSeason: activeSeason.name,
    // federalFlagUrl: federalFlag.imageUrl,
    counts: {
      totalUnions: unionsCount,
      totalDestinations: destinationsCount,
      totalPCs: pcsCount
    },
    grandTotal: `${grandTotal} Qt`,
    grandTotalAdjusted: `${grandTotalAdjusted} Qt`,
    fertilizerBreakdown: Object.entries(totalSummary).map(([type, counts]) => ({ 
      type, 
      originalAmount: `${counts.original} Qt`,
      adjustedAmount: `${counts.adjusted} Qt`
    })),
    regions: regions.map(r => {
      const regionDemands = demands.filter(d => {
        // Find if the demand's kebele belongs to a woreda in a zone of this region
        // This is expensive in JS, but let's assume regions are not too many
        // Actually, we can pre-calculate this or fetch it differently.
        return true; // Placeholder, need a better way if region filter is needed here
      });
      // Actually, the previous implementation didn't filter regions.
      return {
        regionId: r.id,
        regionName: r.name,
        flagUrl: r.regionalFlag?.imageUrl,
        unions: r.unions.map(u => ({
          unionId: u.id,
          unionName: u.name,
          destinations: u.destinations.map(d => ({
            destinationId: d.id,
            destinationName: d.name,
            pcs: d.pcs.map(p => ({
              pcId: p.id,
              pcName: p.name,
              kebeleId: p.kebeleId
            }))
          }))
        })),
        zones: r.zones.map(z => ({
          zoneId: z.id,
          zoneName: z.name,
          woredas: z.woredas.map(w => ({
            woredaId: w.id,
            woredaName: w.name,
            kebeles: w.kebeles.map(k => ({
              kebeleId: k.id,
              kebeleName: k.name
            }))
          }))
        }))
      };
    })
  };
};

export const federalAdjust = async (data: any, user: AuthenticatedUser) => {
   const { fertilizerTypeId, adjustments } = data; // adjustments: [{ regionId, quantity }]
   
   if (!(user.role === Role.MOA_MANAGER || user.role === Role.MOA_EXPERT || user.role === Role.SUPER_ADMIN)) {
     throw new Error('Unauthorized for federal adjustments');
   }

   if (!fertilizerTypeId) throw new Error('Fertilizer Type ID is required');
   if (!adjustments || !Array.isArray(adjustments)) throw new Error('Adjustments must be an array');

  //  await getOrCreateFederalFlag(); // Ensure federal flag exists during federal operation

   return await prisma.$transaction(async (tx) => {
     for (const adj of adjustments) {
       if (!adj.regionId) throw new Error('Region ID is required for each adjustment');
       if (adj.quantity === undefined || adj.quantity < 0) throw new Error('Valid quantity is required');

       const region = await tx.region.findUnique({ where: { id: adj.regionId } });
       if (!region) throw new Error(`Region ${adj.regionId} not found`);

       const fertType = await tx.fertilizerType.findUnique({ where: { id: fertilizerTypeId } });
       if (!fertType) throw new Error(`Fertilizer type ${fertilizerTypeId} not found`);

       const isLocked = await tx.farmerDemand.findFirst({
         where: { 
           farmer: { kebele: { woreda: { zone: { regionId: adj.regionId } } } }, 
           fertilizerTypeId, 
           lockedAtLevel: LockingLevel.MOA
         }
       });
       if (isLocked) throw new Error(`Region ${adj.regionId} is locked at MOA level`);

       const updateResult = await tx.farmerDemand.updateMany({
         where: { farmer: { kebele: { woreda: { zone: { regionId: adj.regionId } } } }, fertilizerTypeId },
         data: { moaAdjustedQuantity: adj.quantity, status: DemandStatus.APPROVED, lockedAtLevel: LockingLevel.MOA }
       });

       if (updateResult.count === 0) {
         throw new Error(`No demands found for Region ${adj.regionId} and Fertilizer Type ${fertilizerTypeId}`);
       }
     }
     return { success: true };
   });
 };

export const getMasterData = async () => {
  const [unions, destinations, pcs, lots] = await Promise.all([
    prisma.union.findMany({
      include: {
        region: true,
        zone: true,
        destinations: {
          include: {
            pcs: true
          }
        }
      }
    }),
    prisma.destination.findMany({
      include: {
        union: {
          include: {
            region: true,
            zone: true
          }
        },
        pcs: true
      }
    }),
    prisma.pC.findMany({
      include: {
        kebele: {
          include: {
            woreda: {
              include: {
                zone: {
                  include: {
                    region: true
                  }
                }
              }
            }
          }
        },
        destination: {
          include: {
            union: true
          }
        }
      }
    }),
    prisma.shippingLot.findMany({
      include: {
        fertilizerType: true
      }
    })
  ]);

  // Build hierarchical structure for Unions -> Destinations -> PCs
  const hierarchicalUnions = unions.map(u => ({
    id: u.id,
    name: u.name,
    regionId: u.regionId,
    zoneId: u.zoneId,
    hierarchy: {
      region: u.region.name,
      zone: u.zone?.name
    },
    destinations: u.destinations.map(d => ({
      id: d.id,
      name: d.name,
      unionId: d.unionId,
      pcs: d.pcs.map(p => ({
        id: p.id,
        name: p.name,
        kebeleId: p.kebeleId,
        destinationId: p.destinationId,
        unionId: u.id
      }))
    }))
  }));

  return {
    unions: hierarchicalUnions,
    destinations: destinations.map(d => ({
      id: d.id,
      name: d.name,
      unionId: d.unionId,
      hierarchy: {
        region: d.union.region.name,
        zone: d.union.zone?.name,
        union: d.union.name
      }
    })),
    pcs: pcs.map(p => ({
      id: p.id,
      name: p.name,
      kebeleId: p.kebeleId,
      destinationId: p.destinationId,
      unionId: p.destination.unionId,
      hierarchy: {
        region: p.kebele.woreda.zone.region.name,
        zone: p.kebele.woreda.zone.name,
        woreda: p.kebele.woreda.name,
        kebele: p.kebele.name,
        destination: p.destination.name,
        union: p.destination.union.name
      }
    })),
    lots: lots.map(l => mapLotResponse(l))
  };
};

export const updateFarmerDemand = async (id: string, data: any) => {
  return await prisma.farmerDemand.update({
    where: { id },
    data
  });
};

/** --- HIERARCHICAL SUMMARY MODULE --- **/

export const getHierarchicalDemandSummary = async (
  fertilizerTypeId: string,
  adminId: string,
  userLevel: 'FEDERAL' | 'REGION' | 'ZONE' | 'WOREDA' | 'KEBELE'
): Promise<HierarchicalSummary | null> => {
  const includeDemands = {
    where: { fertilizerTypeId },
    select: { originalQuantity: true }
  };

  const recursiveInclude = (level: string): any => {
    switch (level) {
      case 'FEDERAL':
        return {
          regions: {
            include: recursiveInclude('REGION')
          }
        };
      case 'REGION':
        return {
          zones: {
            include: recursiveInclude('ZONE')
          }
        };
      case 'ZONE':
        return {
          woredas: {
            include: recursiveInclude('WOREDA')
          }
        };
      case 'WOREDA':
        return {
          kebeles: {
            include: recursiveInclude('KEBELE')
          }
        };
      case 'KEBELE':
        return {
          farmers: {
            include: {
              demands: includeDemands
            }
          }
        };
      default:
        return {};
    }
  };

  let rootNode: any = null;

  switch (userLevel) {
    case 'FEDERAL':
      rootNode = await prisma.federal.findUnique({
        where: { id: adminId },
        include: recursiveInclude('FEDERAL')
      });
      break;
    case 'REGION':
      rootNode = await prisma.region.findUnique({
        where: { id: adminId },
        include: recursiveInclude('REGION')
      });
      break;
    case 'ZONE':
      rootNode = await prisma.zone.findUnique({
        where: { id: adminId },
        include: recursiveInclude('ZONE')
      });
      break;
    case 'WOREDA':
      rootNode = await prisma.woreda.findUnique({
        where: { id: adminId },
        include: recursiveInclude('WOREDA')
      });
      break;
    case 'KEBELE':
      rootNode = await prisma.kebele.findUnique({
        where: { id: adminId },
        include: recursiveInclude('KEBELE')
      });
      break;
  }

  if (!rootNode) return null;

  const formatNode = (node: any, level: string): HierarchicalSummary | null => {
    let totalDemand = 0;
    const result: any = {};

    const nameMappings: Record<string, string> = {
      FEDERAL: 'federalName',
      REGION: 'regionName',
      ZONE: 'zoneName',
      WOREDA: 'woredaName',
      KEBELE: 'kebeleName'
    };

    const childMappings: Record<string, { key: string, nextLevel: string }> = {
      FEDERAL: { key: 'regions', nextLevel: 'REGION' },
      REGION: { key: 'zones', nextLevel: 'ZONE' },
      ZONE: { key: 'woredas', nextLevel: 'WOREDA' },
      WOREDA: { key: 'kebeles', nextLevel: 'KEBELE' }
    };

    result[nameMappings[level]] = node.name;

    if (level === 'KEBELE') {
      totalDemand = node.farmers.reduce((sum: number, farmer: any) => {
        return sum + farmer.demands.reduce((dSum: number, d: any) => dSum + d.originalQuantity, 0);
      }, 0);
    } else {
      const mapping = childMappings[level];
      const children = node[mapping.key] || [];
      const formattedChildren = children
        .map((child: any) => formatNode(child, mapping.nextLevel))
        .filter((child: any) => child !== null && child.totalDemand > 0);

      if (formattedChildren.length > 0) {
        result[mapping.key] = formattedChildren;
        totalDemand = formattedChildren.reduce((sum: number, child: any) => sum + child.totalDemand, 0);
      }
    }

    if (totalDemand === 0) return null;

  result.totalDemand = Number(totalDemand.toFixed(2));
  return result;
};

  return formatNode(rootNode, userLevel);
};

/** --- DEMAND GENERATION MODULE --- **/

export const generateDemands = async (fertilizerTypeId: string) => {
  // 1. Validation
  const fertilizerType = await prisma.fertilizerType.findUnique({
    where: { id: fertilizerTypeId }
  });
  if (!fertilizerType) throw new Error(`Invalid fertilizerTypeId: ${fertilizerTypeId}`);

  const farmers = await prisma.farmer.findMany({ take: 50 }); // Take a sample for generation
  const cropTypes = await prisma.cropType.findMany({ take: 10 });
  const seasons = await prisma.season.findMany({ orderBy: { createdAt: 'desc' }, take: 4 });

  if (farmers.length === 0 || cropTypes.length === 0 || seasons.length === 0) {
    throw new Error('Insufficient master data (farmers, crop types, or seasons) to generate demands.');
  }

  const priorities = Object.values(DemandPriority);
  const recurrences = ['WEEKLY', 'MONTHLY', 'QUARTERLY'];
  const statuses = [DemandStatus.PENDING, DemandStatus.APPROVED];

  let createdCount = 0;
  let skippedCount = 0;
  const characteristics: Record<string, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
    WEEKLY: 0,
    MONTHLY: 0,
    QUARTERLY: 0
  };

  const now = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  const demandsToCreate: Prisma.FarmerDemandCreateManyInput[] = [];

  for (const farmer of farmers) {
    // Generate 3-7 demands per farmer for variety
    const demandCount = Math.floor(Math.random() * 5) + 3;

    for (let i = 0; i < demandCount; i++) {
      const season = seasons[Math.floor(Math.random() * seasons.length)];
      const cropType = cropTypes[Math.floor(Math.random() * cropTypes.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const recurrence = recurrences[Math.floor(Math.random() * recurrences.length)];
      
      // Determine quantity based on priority
      let originalQuantity = 0;
      switch (priority) {
        case 'LOW': originalQuantity = Math.random() * 5 + 1; break;
        case 'MEDIUM': originalQuantity = Math.random() * 10 + 5; break;
        case 'HIGH': originalQuantity = Math.random() * 20 + 15; break;
        case 'CRITICAL': originalQuantity = Math.random() * 50 + 35; break;
      }

      // Random target date within last 12 months
      const targetDate = new Date(twelveMonthsAgo.getTime() + Math.random() * (now.getTime() - twelveMonthsAgo.getTime()));

      // Simplified duplicate check for bulk generation: 
      // In a real scenario, we might use a unique constraint in DB, 
      // but here we check against our current list and DB.
      const isDuplicate = demandsToCreate.some(d => 
        d.farmerId === farmer.id && 
        d.seasonId === season.id && 
        d.fertilizerTypeId === fertilizerTypeId &&
        d.cropTypeId === cropType.id
      );

      if (isDuplicate) {
        skippedCount++;
        continue;
      }

      demandsToCreate.push({
        farmerId: farmer.id,
        seasonId: season.id,
        cropTypeId: cropType.id,
        fertilizerTypeId,
        originalQuantity: Number(originalQuantity.toFixed(2)),
        priority,
        recurrence,
        targetDate,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lockedAtLevel: LockingLevel.NONE
      });

      characteristics[priority]++;
      characteristics[recurrence]++;
    }
  }

  // Final check against DB for duplicates before bulk create
  // To avoid performance issues with large datasets, we do this carefully.
  const finalDemands: Prisma.FarmerDemandCreateManyInput[] = [];
  for (const d of demandsToCreate) {
    const existing = await prisma.farmerDemand.findFirst({
      where: {
        farmerId: d.farmerId,
        seasonId: d.seasonId,
        fertilizerTypeId: d.fertilizerTypeId,
        cropTypeId: d.cropTypeId
      }
    });

    if (existing) {
      skippedCount++;
    } else {
      finalDemands.push(d);
      createdCount++;
    }
  }

  if (finalDemands.length > 0) {
    await prisma.farmerDemand.createMany({
      data: finalDemands,
      skipDuplicates: true
    });
  }

  return {
    message: 'Demand generation completed successfully',
    summary: {
      totalCreated: createdCount,
      totalSkipped: skippedCount,
      fertilizerType: fertilizerType.name,
      characteristics
    }
  };
};

