import prisma from '../config/prisma.js';

export interface SummaryParams {
  productionSeason?: string;
  requestedAtFrom?: Date;
  requestedAtTo?: Date;
}

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

export interface FertilizerBreakdownItem {
  type: 'DAP' | 'UREA';
  originalAmount: number;
  adjustedAmount: number;
  fertilizerTypeId: string;
}

export interface LevelSummaryResponse {
  levelId: string;
  levelName: string;
  productionSeason: string;
  totalAmount: number;
  totalAdjustedAmount: number;
  fertilizerBreakdown: FertilizerBreakdownItem[];
}

export interface DrillDownItem {
  childId: string;
  childName: string;
  originalAmount: number;
  adjustedAmount: number;
}

export const getFederalSummary = async (params: SummaryParams): Promise<LevelSummaryResponse | null> => {
  const federal = await prisma.federal.findFirst();
  if (!federal) return null;

  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return null;

  const summary = await aggregateDemand({
    level: 'FEDERAL',
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });

  if (!summary && (await prisma.farmerDemand.count({ where: { seasonId: activeSeason.id } })) === 0) {
    return null;
  }

  return {
    levelId: federal.id,
    levelName: federal.name,
    productionSeason: activeSeason.name,
    totalAmount: summary?.totalOriginal || 0,
    totalAdjustedAmount: summary?.totalAdjusted || 0,
    fertilizerBreakdown: summary?.breakdown || []
  };
};

export const getFederalDrillDown = async (fertilizerType: string, params: SummaryParams): Promise<DrillDownItem[]> => {
  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return [];

  return aggregateDrillDown({
    parentLevel: 'FEDERAL',
    fertilizerType,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });
};

export const getRegionSummary = async (regionId: string, params: SummaryParams): Promise<LevelSummaryResponse | null> => {
  const region = await prisma.region.findUnique({ where: { id: regionId } });
  if (!region) return null;

  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return null;

  const summary = await aggregateDemand({
    level: 'REGION',
    levelId: regionId,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });

  return {
    levelId: region.id,
    levelName: region.name,
    productionSeason: activeSeason.name,
    totalAmount: summary?.totalOriginal || 0,
    totalAdjustedAmount: summary?.totalAdjusted || 0,
    fertilizerBreakdown: summary?.breakdown || []
  };
};

export const getRegionDrillDown = async (regionId: string, fertilizerType: string, params: SummaryParams): Promise<DrillDownItem[]> => {
  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return [];

  return aggregateDrillDown({
    parentLevel: 'REGION',
    parentId: regionId,
    fertilizerType,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });
};

export const getZoneSummary = async (zoneId: string, params: SummaryParams): Promise<LevelSummaryResponse | null> => {
  const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
  if (!zone) return null;

  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return null;

  const summary = await aggregateDemand({
    level: 'ZONE',
    levelId: zoneId,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });

  return {
    levelId: zone.id,
    levelName: zone.name,
    productionSeason: activeSeason.name,
    totalAmount: summary?.totalOriginal || 0,
    totalAdjustedAmount: summary?.totalAdjusted || 0,
    fertilizerBreakdown: summary?.breakdown || []
  };
};

export const getZoneDrillDown = async (zoneId: string, fertilizerType: string, params: SummaryParams): Promise<DrillDownItem[]> => {
  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return [];

  return aggregateDrillDown({
    parentLevel: 'ZONE',
    parentId: zoneId,
    fertilizerType,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });
};

export const getWoredaSummary = async (woredaId: string, params: SummaryParams): Promise<LevelSummaryResponse | null> => {
  const woreda = await prisma.woreda.findUnique({ where: { id: woredaId } });
  if (!woreda) return null;

  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return null;

  const summary = await aggregateDemand({
    level: 'WOREDA',
    levelId: woredaId,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });

  return {
    levelId: woreda.id,
    levelName: woreda.name,
    productionSeason: activeSeason.name,
    totalAmount: summary?.totalOriginal || 0,
    totalAdjustedAmount: summary?.totalAdjusted || 0,
    fertilizerBreakdown: summary?.breakdown || []
  };
};

export const getWoredaDrillDown = async (woredaId: string, fertilizerType: string, params: SummaryParams): Promise<DrillDownItem[]> => {
  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return [];

  return aggregateDrillDown({
    parentLevel: 'WOREDA',
    parentId: woredaId,
    fertilizerType,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });
};

export const getKebeleSummary = async (kebeleId: string, params: SummaryParams): Promise<LevelSummaryResponse | null> => {
  const kebele = await prisma.kebele.findUnique({ where: { id: kebeleId } });
  if (!kebele) return null;

  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return null;

  const summary = await aggregateDemand({
    level: 'KEBELE',
    levelId: kebeleId,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });

  return {
    levelId: kebele.id,
    levelName: kebele.name,
    productionSeason: activeSeason.name,
    totalAmount: summary?.totalOriginal || 0,
    totalAdjustedAmount: summary?.totalAdjusted || 0,
    fertilizerBreakdown: summary?.breakdown || []
  };
};

export const getKebeleDrillDown = async (kebeleId: string, fertilizerType: string, params: SummaryParams): Promise<DrillDownItem[]> => {
  const activeSeason = await getActiveSeason(params.productionSeason);
  if (!activeSeason) return [];

  return aggregateDrillDown({
    parentLevel: 'KEBELE',
    parentId: kebeleId,
    fertilizerType,
    seasonName: activeSeason.name,
    from: params.requestedAtFrom,
    to: params.requestedAtTo
  });
};

/** --- PRIVATE AGGREGATION HELPERS --- **/

async function aggregateDemand(args: {
  level: 'FEDERAL' | 'REGION' | 'ZONE' | 'WOREDA' | 'KEBELE';
  levelId?: string;
  seasonName: string;
  from?: Date;
  to?: Date;
}) {
  const { level, levelId, seasonName, from, to } = args;

  const dateFilter = from || to ? {
    createdAt: {
      ...(from && { gte: from }),
      ...(to && { lte: to })
    }
  } : {};

  const locationFilter: any = {};
  if (level === 'REGION') locationFilter.farmer = { kebele: { woreda: { zone: { regionId: levelId } } } };
  if (level === 'ZONE') locationFilter.farmer = { kebele: { woreda: { zoneId: levelId } } };
  if (level === 'WOREDA') locationFilter.farmer = { kebele: { woredaId: levelId } };
  if (level === 'KEBELE') locationFilter.farmer = { kebeleId: levelId };

  const demands = await prisma.farmerDemand.findMany({
    where: {
      season: { name: seasonName },
      fertilizerType: { name: { in: ['DAP', 'UREA'] } },
      ...locationFilter,
      ...dateFilter
    },
    include: { fertilizerType: true }
  });

  if (demands.length === 0) return null;

  const breakdownMap: Record<string, FertilizerBreakdownItem> = {};
  let totalOriginal = 0;
  let totalAdjusted = 0;

  for (const d of demands) {
    const type = d.fertilizerType.name as 'DAP' | 'UREA';
    if (!breakdownMap[type]) {
      breakdownMap[type] = { type, originalAmount: 0, adjustedAmount: 0, fertilizerTypeId: d.fertilizerTypeId };
    }
    
    const adj = d.moaAdjustedQuantity ?? d.regionAdjustedQuantity ?? d.zoneAdjustedQuantity ?? d.woredaAdjustedQuantity ?? d.kebeleAdjustedQuantity ?? d.originalQuantity;
    
    breakdownMap[type].originalAmount += d.originalQuantity;
    breakdownMap[type].adjustedAmount += adj;
    totalOriginal += d.originalQuantity;
    totalAdjusted += adj;
  }

  return {
    totalOriginal: Number(totalOriginal.toFixed(2)),
    totalAdjusted: Number(totalAdjusted.toFixed(2)),
    breakdown: Object.values(breakdownMap).map(b => ({
      ...b,
      originalAmount: Number(b.originalAmount.toFixed(2)),
      adjustedAmount: Number(b.adjustedAmount.toFixed(2))
    }))
  };
}

async function aggregateDrillDown(args: {
  parentLevel: 'FEDERAL' | 'REGION' | 'ZONE' | 'WOREDA' | 'KEBELE';
  parentId?: string;
  fertilizerType: string;
  seasonName: string;
  from?: Date;
  to?: Date;
}): Promise<DrillDownItem[]> {
  const { parentLevel, parentId, fertilizerType, seasonName, from, to } = args;

  const dateFilter = from || to ? {
    createdAt: {
      ...(from && { gte: from }),
      ...(to && { lte: to })
    }
  } : {};

  const demands = await prisma.farmerDemand.findMany({
    where: {
      season: { name: seasonName },
      fertilizerType: { name: fertilizerType },
      ...(parentLevel === 'REGION' && { farmer: { kebele: { woreda: { zone: { regionId: parentId } } } } }),
      ...(parentLevel === 'ZONE' && { farmer: { kebele: { woreda: { zoneId: parentId } } } }),
      ...(parentLevel === 'WOREDA' && { farmer: { kebele: { woredaId: parentId } } }),
      ...(parentLevel === 'KEBELE' && { farmer: { kebeleId: parentId } }),
      ...dateFilter
    },
    include: {
      farmer: {
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
          }
        }
      }
    }
  });

  const drillDownMap = new Map<string, DrillDownItem>();

  for (const d of demands) {
    let childId = '';
    let childName = '';

    if (parentLevel === 'FEDERAL') {
      childId = d.farmer.kebele.woreda.zone.region.id;
      childName = d.farmer.kebele.woreda.zone.region.name;
    } else if (parentLevel === 'REGION') {
      childId = d.farmer.kebele.woreda.zone.id;
      childName = d.farmer.kebele.woreda.zone.name;
    } else if (parentLevel === 'ZONE') {
      childId = d.farmer.kebele.woreda.id;
      childName = d.farmer.kebele.woreda.name;
    } else if (parentLevel === 'WOREDA') {
      childId = d.farmer.kebele.id;
      childName = d.farmer.kebele.name;
    } else if (parentLevel === 'KEBELE') {
      // Since Section is not directly on Farmer, we use kebele grouping for now
      // Or we could group by farmer if needed. The request asked for "child administrative unit".
      // For Kebele, children are not defined in hierarchy, but sections exist in schema.
      // However, Farmer does not have sectionId.
      childId = d.farmer.id;
      childName = d.farmer.fullName;
    }

    if (!drillDownMap.has(childId)) {
      drillDownMap.set(childId, { childId, childName, originalAmount: 0, adjustedAmount: 0 });
    }

    const item = drillDownMap.get(childId)!;
    const adj = d.moaAdjustedQuantity ?? d.regionAdjustedQuantity ?? d.zoneAdjustedQuantity ?? d.woredaAdjustedQuantity ?? d.kebeleAdjustedQuantity ?? d.originalQuantity;
    
    item.originalAmount += d.originalQuantity;
    item.adjustedAmount += adj;
  }

  return Array.from(drillDownMap.values()).map(item => ({
    ...item,
    originalAmount: Number(item.originalAmount.toFixed(2)),
    adjustedAmount: Number(item.adjustedAmount.toFixed(2))
  }));
}
