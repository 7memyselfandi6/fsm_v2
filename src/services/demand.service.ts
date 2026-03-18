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

// const getOrCreateFederalFlag = async () => {
//   let flag = await (prisma as any).federalFlag?.findFirst();
//   if (!flag) {
//     flag = await (prisma as any).federalFlag.create({
//       data: {
//         name: 'Federal Flag',
//         category: 'FEDERAL',
//         imageUrl: 'https://example.com/federal-flag.png' // Default URL
//       }
//     });
//   }
//   return flag;
// };

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

export const getKebeleSummary = async (user: any, seasonName?: string) => {
  const { kebeleId, regionId, role } = user;
  const [kebele, activeSeason, flag] = await Promise.all([
    prisma.kebele.findUnique({ 
      where: { id: kebeleId },
      include: { sections: true }
    }),
    getActiveSeason(seasonName),
    role === 'SUPER_ADMIN' ? Promise.resolve(null) : getRegionalFlag(regionId)
  ]);

  if (!activeSeason || !kebele) return null;

  const demands = await prisma.farmerDemand.findMany({
    where: { 
      seasonId: activeSeason.id, 
      farmer: { kebeleId } 
    },
    include: { 
      fertilizerType: true
    }
  });

  const summaryMap: Record<string, { original: number, adjusted: number }> = {};
  let totalAmount = 0;
  let totalAdjustedAmount = 0;

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const effective = getEffectiveQty(d);
    if (!summaryMap[type]) summaryMap[type] = { original: 0, adjusted: 0 };
    summaryMap[type].original += d.originalQuantity;
    summaryMap[type].adjusted += effective;
    totalAmount += d.originalQuantity;
    totalAdjustedAmount += effective;
  });

  return {
    kebeleId,
    kebeleName: kebele.name,
    productionSeason: activeSeason.name,
    regionalFlagUrl: flag?.imageUrl,
    totalAmount: `${totalAmount} Qt`,
    totalAdjustedAmount: `${totalAdjustedAmount} Qt`,
    fertilizerBreakdown: Object.entries(summaryMap).map(([type, counts]) => ({ 
      type, 
      originalAmount: `${counts.original} Qt`,
      adjustedAmount: `${counts.adjusted} Qt`
    }))
  };
};

export const getKebeleAdjustmentTable = async (user: any, seasonName?: string) => {
  const { kebeleId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const demands = await prisma.farmerDemand.findMany({
    where: { seasonId: activeSeason.id, farmer: { kebeleId } },
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

export const kebeleAdjust = async (data: any, user: any) => {
  const { fertilizerTypeId, quantity } = data;
  const { kebeleId } = user;

  const isLocked = await prisma.farmerDemand.findFirst({
    where: { 
      farmer: { kebeleId }, 
      fertilizerTypeId, 
      lockedAtLevel: { in: [LockingLevel.KEBELE, LockingLevel.WOREDA, LockingLevel.ZONE, LockingLevel.REGION, LockingLevel.MOA] } 
    }
  });

  if (isLocked) throw new Error(`Kebele is locked at ${isLocked.lockedAtLevel} level`);

  await prisma.farmerDemand.updateMany({
    where: { farmer: { kebeleId }, fertilizerTypeId },
    data: { 
      kebeleAdjustedQuantity: quantity, 
      status: DemandStatus.APPROVED, 
      lockedAtLevel: LockingLevel.KEBELE 
    }
  });

  return { success: true };
};

export const kebeleLock = async (data: any, user: any) => {
  const { lock } = data;
  const { kebeleId } = user;
  const level = lock ? LockingLevel.KEBELE : LockingLevel.NONE;

  await prisma.farmerDemand.updateMany({
    where: { farmer: { kebeleId } },
    data: { lockedAtLevel: level }
  });
  return { success: true, level };
};

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
  const woredaSummaryMap: Record<string, { original: number, adjusted: number }> = {};
  let woredaTotalAmount = 0;
  let woredaTotalAdjustedAmount = 0;

  // Group by Kebele
  const kebeleSummaries: Record<string, { name: string, totalAmount: number, totalAdjustedAmount: number, fertilizerBreakdown: any[] }> = {};
  
  // Initialize Kebele Summaries
  woreda.kebeles.forEach(k => {
    kebeleSummaries[k.id] = { name: k.name, totalAmount: 0, totalAdjustedAmount: 0, fertilizerBreakdown: [] };
  });

  const kebeleFertilizerMaps: Record<string, Record<string, { original: number, adjusted: number }>> = {};

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const kid = d.farmer.kebeleId;
    const effective = getEffectiveQty(d);

    // Woreda aggregation
    if (!woredaSummaryMap[type]) woredaSummaryMap[type] = { original: 0, adjusted: 0 };
    woredaSummaryMap[type].original += d.originalQuantity;
    woredaSummaryMap[type].adjusted += effective;
    woredaTotalAmount += d.originalQuantity;
    woredaTotalAdjustedAmount += effective;

    // Kebele aggregation
    if (kebeleSummaries[kid]) {
      kebeleSummaries[kid].totalAmount += d.originalQuantity;
      kebeleSummaries[kid].totalAdjustedAmount += effective;
      if (!kebeleFertilizerMaps[kid]) kebeleFertilizerMaps[kid] = {};
      if (!kebeleFertilizerMaps[kid][type]) kebeleFertilizerMaps[kid][type] = { original: 0, adjusted: 0 };
      kebeleFertilizerMaps[kid][type].original += d.originalQuantity;
      kebeleFertilizerMaps[kid][type].adjusted += effective;
    }
  });

  // Convert Kebele maps to breakdowns
  Object.keys(kebeleSummaries).forEach(kid => {
    const fertMap = kebeleFertilizerMaps[kid] || {};
    kebeleSummaries[kid].fertilizerBreakdown = Object.entries(fertMap).map(([type, counts]) => ({
      type,
      originalAmount: `${counts.original} Qt`,
      adjustedAmount: `${counts.adjusted} Qt`
    }));
  });

  return {
    woredaId,
    woredaName: woreda.name,
    productionSeason: activeSeason.name,
    regionalFlagUrl: flag?.imageUrl,
    totalAmount: `${woredaTotalAmount} Qt`,
    totalAdjustedAmount: `${woredaTotalAdjustedAmount} Qt`,
    fertilizerBreakdown: Object.entries(woredaSummaryMap).map(([type, counts]) => ({ 
      type, 
      originalAmount: `${counts.original} Qt`,
      adjustedAmount: `${counts.adjusted} Qt`
    })),
    kebeles: Object.entries(kebeleSummaries).map(([kid, k]) => ({
      kebeleId: kid,
      kebeleName: k.name,
      totalAmount: `${k.totalAmount} Qt`,
      totalAdjustedAmount: `${k.totalAdjustedAmount} Qt`,
      fertilizerBreakdown: k.fertilizerBreakdown
    }))
  };
};

export const getWoredaAdjustmentTable = async (user: any, seasonName?: string) => {
  const { woredaId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const demands = await prisma.farmerDemand.findMany({
    where: { seasonId: activeSeason.id, farmer: { kebele: { woredaId } } },
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
  const zoneSummaryMap: Record<string, { original: number, adjusted: number }> = {};
  let zoneTotalAmount = 0;
  let zoneTotalAdjustedAmount = 0;

  // Hierarchical Structure: Woreda -> Kebele -> Fertilizer Summary
  const woredaData: Record<string, { 
    name: string, 
    totalAmount: number, 
    totalAdjustedAmount: number,
    fertilizerBreakdown: any[], 
    kebeles: Record<string, { name: string, totalAmount: number, totalAdjustedAmount: number, fertilizerBreakdown: any[] }> 
  }> = {};

  // Initialize Structure
  zone.woredas.forEach(w => {
    woredaData[w.id] = { name: w.name, totalAmount: 0, totalAdjustedAmount: 0, fertilizerBreakdown: [], kebeles: {} };
    w.kebeles.forEach(k => {
      woredaData[w.id].kebeles[k.id] = { name: k.name, totalAmount: 0, totalAdjustedAmount: 0, fertilizerBreakdown: [] };
    });
  });

  const woredaFertilizerMaps: Record<string, Record<string, { original: number, adjusted: number }>> = {};
  const kebeleFertilizerMaps: Record<string, Record<string, { original: number, adjusted: number }>> = {};

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const kid = d.farmer.kebeleId;
    const wid = d.farmer.kebele.woredaId;
    const effective = getEffectiveQty(d);

    // Zone aggregation
    if (!zoneSummaryMap[type]) zoneSummaryMap[type] = { original: 0, adjusted: 0 };
    zoneSummaryMap[type].original += d.originalQuantity;
    zoneSummaryMap[type].adjusted += effective;
    zoneTotalAmount += d.originalQuantity;
    zoneTotalAdjustedAmount += effective;

    // Woreda aggregation
    if (woredaData[wid]) {
      woredaData[wid].totalAmount += d.originalQuantity;
      woredaData[wid].totalAdjustedAmount += effective;
      if (!woredaFertilizerMaps[wid]) woredaFertilizerMaps[wid] = {};
      if (!woredaFertilizerMaps[wid][type]) woredaFertilizerMaps[wid][type] = { original: 0, adjusted: 0 };
      woredaFertilizerMaps[wid][type].original += d.originalQuantity;
      woredaFertilizerMaps[wid][type].adjusted += effective;

      // Kebele aggregation
      if (woredaData[wid].kebeles[kid]) {
        woredaData[wid].kebeles[kid].totalAmount += d.originalQuantity;
        woredaData[wid].kebeles[kid].totalAdjustedAmount += effective;
        if (!kebeleFertilizerMaps[kid]) kebeleFertilizerMaps[kid] = {};
        if (!kebeleFertilizerMaps[kid][type]) kebeleFertilizerMaps[kid][type] = { original: 0, adjusted: 0 };
        kebeleFertilizerMaps[kid][type].original += d.originalQuantity;
        kebeleFertilizerMaps[kid][type].adjusted += effective;
      }
    }
  });

  // Final Transformation
  const woredas = Object.entries(woredaData).map(([wid, w]) => {
    const woredaFertMap = woredaFertilizerMaps[wid] || {};
    return {
      woredaName: w.name,
      totalAmount: `${w.totalAmount} Qt`,
      totalAdjustedAmount: `${w.totalAdjustedAmount} Qt`,
      fertilizerBreakdown: Object.entries(woredaFertMap).map(([type, counts]) => ({ 
        type, 
        originalAmount: `${counts.original} Qt`,
        adjustedAmount: `${counts.adjusted} Qt`
      })),
      kebeles: Object.entries(w.kebeles).map(([kid, k]) => {
        const kebeleFertMap = kebeleFertilizerMaps[kid] || {};
        return {
          kebeleName: k.name,
          totalAmount: `${k.totalAmount} Qt`,
          totalAdjustedAmount: `${k.totalAdjustedAmount} Qt`,
          fertilizerBreakdown: Object.entries(kebeleFertMap).map(([type, counts]) => ({ 
            type, 
            originalAmount: `${counts.original} Qt`,
            adjustedAmount: `${counts.adjusted} Qt`
          }))
        };
      })
    };
  });

  return {
    zoneId,
    zoneName: zone.name,
    productionSeason: activeSeason.name,
    regionalFlagUrl: flag?.imageUrl,
    totalAmount: `${zoneTotalAmount} Qt`,
    totalAdjustedAmount: `${zoneTotalAdjustedAmount} Qt`,
    fertilizerBreakdown: Object.entries(zoneSummaryMap).map(([type, counts]) => ({ 
      type, 
      originalAmount: `${counts.original} Qt`,
      adjustedAmount: `${counts.adjusted} Qt`
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

export const getRegionSummary = async (user: any, seasonName?: string) => {
  const { regionId, role } = user;
  const [region, activeSeason, flag, allLots] = await Promise.all([
    prisma.region.findUnique({
      where: { id: regionId },
      include: {
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
                pcs: {
                  include: {
                    kebele: true
                  }
                }
              }
            }
          }
        }
      }
    }),
    getActiveSeason(seasonName),
    role === 'SUPER_ADMIN' ? Promise.resolve(null) : getRegionalFlag(regionId),
    prisma.shippingLot.findMany({
      include: {
        fertilizerType: true
      }
    })
  ]);

  if (!activeSeason || !region) return null;

  // Validation: lots array should not be empty and each lot must have an ID
  if (!allLots || allLots.length === 0) {
    throw new Error('No fertilizer lots found in the system');
  }

  const lots = allLots.map(l => {
    if (!l.id) throw new Error(`Lot record missing unique identifier: ${l.lotNumber}`);
    return mapLotResponse(l);
  });

  const demands = await prisma.farmerDemand.findMany({
    where: { 
      seasonId: activeSeason.id, 
      farmer: { kebele: { woreda: { zone: { regionId } } } } 
    },
    include: { 
      fertilizerType: true,
      farmer: { 
        include: { 
          kebele: { 
            include: { woreda: { include: { zone: true } } } 
          } 
        } 
      }
    }
  });

  // Aggregators
  const regionSummaryMap: Record<string, number> = {};
  const regionAdjustedSummaryMap: Record<string, number> = {};
  let regionTotalAmount = 0;
  let regionTotalAdjustedAmount = 0;

  // Hierarchical Structure: Zone -> Woreda -> Kebele
  const zoneData: Record<string, any> = {};

  // Initialize Structure
  region.zones.forEach(z => {
    zoneData[z.id] = { name: z.name, totalAmount: 0, totalAdjustedAmount: 0, fertilizerBreakdown: [], woredas: {} };
    z.woredas.forEach(w => {
      zoneData[z.id].woredas[w.id] = { name: w.name, totalAmount: 0, totalAdjustedAmount: 0, fertilizerBreakdown: [], kebeles: {} };
      w.kebeles.forEach(k => {
        zoneData[z.id].woredas[w.id].kebeles[k.id] = { name: k.name, totalAmount: 0, totalAdjustedAmount: 0, fertilizerBreakdown: [] };
      });
    });
  });

  const zoneFertilizerMaps: Record<string, Record<string, { original: number, adjusted: number }>> = {};
  const woredaFertilizerMaps: Record<string, Record<string, { original: number, adjusted: number }>> = {};
  const kebeleFertilizerMaps: Record<string, Record<string, { original: number, adjusted: number }>> = {};

  demands.forEach(d => {
    const type = d.fertilizerType.name;
    const kid = d.farmer.kebeleId;
    const wid = d.farmer.kebele.woredaId;
    const zid = d.farmer.kebele.woreda.zoneId;
    const effectiveQty = getEffectiveQty(d);

    // Region aggregation
    regionSummaryMap[type] = (regionSummaryMap[type] || 0) + d.originalQuantity;
    regionAdjustedSummaryMap[type] = (regionAdjustedSummaryMap[type] || 0) + effectiveQty;
    regionTotalAmount += d.originalQuantity;
    regionTotalAdjustedAmount += effectiveQty;

    // Zone aggregation
    if (zoneData[zid]) {
      zoneData[zid].totalAmount += d.originalQuantity;
      zoneData[zid].totalAdjustedAmount += effectiveQty;
      if (!zoneFertilizerMaps[zid]) zoneFertilizerMaps[zid] = {};
      if (!zoneFertilizerMaps[zid][type]) zoneFertilizerMaps[zid][type] = { original: 0, adjusted: 0 };
      zoneFertilizerMaps[zid][type].original += d.originalQuantity;
      zoneFertilizerMaps[zid][type].adjusted += effectiveQty;

      // Woreda aggregation
      if (zoneData[zid].woredas[wid]) {
        zoneData[zid].woredas[wid].totalAmount += d.originalQuantity;
        zoneData[zid].woredas[wid].totalAdjustedAmount += effectiveQty;
        if (!woredaFertilizerMaps[wid]) woredaFertilizerMaps[wid] = {};
        if (!woredaFertilizerMaps[wid][type]) woredaFertilizerMaps[wid][type] = { original: 0, adjusted: 0 };
        woredaFertilizerMaps[wid][type].original += d.originalQuantity;
        woredaFertilizerMaps[wid][type].adjusted += effectiveQty;

        // Kebele aggregation
        if (zoneData[zid].woredas[wid].kebeles[kid]) {
          zoneData[zid].woredas[wid].kebeles[kid].totalAmount += d.originalQuantity;
          zoneData[zid].woredas[wid].kebeles[kid].totalAdjustedAmount += effectiveQty;
          if (!kebeleFertilizerMaps[kid]) kebeleFertilizerMaps[kid] = {};
          if (!kebeleFertilizerMaps[kid][type]) kebeleFertilizerMaps[kid][type] = { original: 0, adjusted: 0 };
          kebeleFertilizerMaps[kid][type].original += d.originalQuantity;
          kebeleFertilizerMaps[kid][type].adjusted += effectiveQty;
        }
      }
    }
  });

  // Final Transformation for Zones
  const zones = Object.entries(zoneData).map(([zid, z]) => {
    const zoneFertMap = zoneFertilizerMaps[zid] || {};
    return {
      zoneId: zid,
      zoneName: z.name,
      totalAmount: `${z.totalAmount} Qt`,
      totalAdjustedAmount: `${z.totalAdjustedAmount} Qt`,
      fertilizerBreakdown: Object.entries(zoneFertMap).map(([type, counts]) => ({ 
        type, 
        originalAmount: `${counts.original} Qt`,
        adjustedAmount: `${counts.adjusted} Qt`
      })),
      woredas: Object.entries(z.woredas).map(([wid, w]: [string, any]) => {
        const woredaFertMap = woredaFertilizerMaps[wid] || {};
        return {
          woredaId: wid,
          woredaName: w.name,
          totalAmount: `${w.totalAmount} Qt`,
          totalAdjustedAmount: `${w.totalAdjustedAmount} Qt`,
          fertilizerBreakdown: Object.entries(woredaFertMap).map(([type, counts]) => ({ 
            type, 
            originalAmount: `${counts.original} Qt`,
            adjustedAmount: `${counts.adjusted} Qt`
          })),
          kebeles: Object.entries(w.kebeles).map(([kid, k]: [string, any]) => {
            const kebeleFertMap = kebeleFertilizerMaps[kid] || {};
            return {
              kebeleId: kid,
              kebeleName: k.name,
              totalAmount: `${k.totalAmount} Qt`,
              totalAdjustedAmount: `${k.totalAdjustedAmount} Qt`,
              fertilizerBreakdown: Object.entries(kebeleFertMap).map(([type, counts]) => ({ 
                type, 
                originalAmount: `${counts.original} Qt`,
                adjustedAmount: `${counts.adjusted} Qt`
              }))
            };
          })
        };
      })
    };
  });

  // Union -> Destination -> PC Structure
  const unions = region.unions.map(u => {
    const unionDemands = demands.filter(d => {
      // Find if the demand's kebele is associated with any PC in any destination of this union
      return u.destinations.some(dest => 
        dest.pcs.some(pc => pc.kebeleId === d.farmer.kebeleId)
      );
    });

    const unionSummary: Record<string, { original: number, adjusted: number }> = {};
    unionDemands.forEach(d => {
      const type = d.fertilizerType.name;
      if (!unionSummary[type]) unionSummary[type] = { original: 0, adjusted: 0 };
      unionSummary[type].original += d.originalQuantity;
      unionSummary[type].adjusted += getEffectiveQty(d);
    });

    return {
      unionId: u.id,
      unionName: u.name,
      zoneId: u.zoneId,
      regionId: u.regionId,
      destinations: u.destinations.map(dest => ({
        destinationId: dest.id,
        destinationName: dest.name,
        pcs: dest.pcs.map(pc => {
          const pcDemands = demands.filter(d => d.farmer.kebeleId === pc.kebeleId);
          let pcTotalAmount = 0;
          let pcTotalAdjustedAmount = 0;
          const pcBreakdown: Record<string, { original: number, adjusted: number }> = {};
          
          pcDemands.forEach(d => {
            const type = d.fertilizerType.name;
            const effective = getEffectiveQty(d);
            pcTotalAmount += d.originalQuantity;
            pcTotalAdjustedAmount += effective;
            if (!pcBreakdown[type]) pcBreakdown[type] = { original: 0, adjusted: 0 };
            pcBreakdown[type].original += d.originalQuantity;
            pcBreakdown[type].adjusted += effective;
          });

          return {
            pcId: pc.id,
            pcName: pc.name,
            kebeleId: pc.kebeleId,
            woredaId: pc.kebele.woredaId,
            totalAmount: `${pcTotalAmount} Qt`,
            totalAdjustedAmount: `${pcTotalAdjustedAmount} Qt`,
            fertilizerBreakdown: Object.entries(pcBreakdown).map(([type, counts]) => ({
              type,
              originalAmount: `${counts.original} Qt`,
              adjustedAmount: `${counts.adjusted} Qt`
            }))
          };
        })
      })),
      fertilizerDemand: Object.entries(unionSummary).map(([type, counts]) => ({
        type,
        requestedAmount: `${counts.original} Qt`,
        adjustedAmount: `${counts.adjusted} Qt`
      }))
    };
  });

  return {
    regionId,
    regionName: region.name,
    productionSeason: activeSeason.name,
    regionalFlagUrl: flag?.imageUrl,
    totalAmount: `${regionTotalAmount} Qt`,
    totalAdjustedAmount: `${regionTotalAdjustedAmount} Qt`,
    fertilizerBreakdown: Object.entries(regionSummaryMap).map(([type, amount]) => ({ 
      type, 
      originalAmount: `${amount} Qt`,
      adjustedAmount: `${regionAdjustedSummaryMap[type]} Qt`
    })),
    zones,
    unions,
    lots
  };
};

export const getRegionAdjustmentTable = async (user: any, seasonName?: string) => {
  const { regionId } = user;
  const activeSeason = await getActiveSeason(seasonName);
  if (!activeSeason) return null;

  const zones = await prisma.zone.findMany({
    where: { regionId },
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
      farmer: { kebele: { woreda: { zone: { regionId } } } }, 
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

export const regionAdjust = async (data: any, user: any) => {
  const { fertilizerTypeId, adjustments } = data; // adjustments: [{ zoneId, quantity }]
  const { regionId } = user;

  return await prisma.$transaction(async (tx) => {
    for (const adj of adjustments) {
      const isLocked = await tx.farmerDemand.findFirst({
        where: { 
          farmer: { kebele: { woreda: { zone: { id: adj.zoneId, regionId } } } }, 
          fertilizerTypeId, 
          lockedAtLevel: { in: [LockingLevel.REGION, LockingLevel.MOA] } 
        }
      });
      if (isLocked) throw new Error(`Zone ${adj.zoneId} is locked at ${isLocked.lockedAtLevel} level`);

      await tx.farmerDemand.updateMany({
        where: { farmer: { kebele: { woreda: { zone: { id: adj.zoneId, regionId } } } }, fertilizerTypeId },
        data: { regionAdjustedQuantity: adj.quantity, status: DemandStatus.APPROVED, lockedAtLevel: LockingLevel.REGION }
      });
    }
    return { success: true };
  });
};

export const regionLock = async (data: any, user: any) => {
  const { zoneId, lock } = data;
  const { regionId } = user;
  const level = lock ? LockingLevel.REGION : LockingLevel.NONE;

  await prisma.farmerDemand.updateMany({
    where: { 
      farmer: {
        kebele: { woreda: { zone: { regionId } } },
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

export const federalAdjust = async (data: any, user: any) => {
   const { fertilizerTypeId, adjustments } = data; // adjustments: [{ regionId, quantity }]
   
   if (!['MOA_MANAGER', 'MOA_EXPERT', 'SUPER_ADMIN'].includes(user.role)) {
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

