import prisma from '../config/prisma.js';
import { AuthenticatedUser } from '../types/express.js';
import { Role } from '@prisma/client';

export const getKebelesByFertilizerTypeAndScope = async (
  fertilizerTypeId: string,
  user: AuthenticatedUser
) => {
  let whereClause: any = {
    fertilizerTypeId: fertilizerTypeId,
  };

  switch (user.role) {
    case Role.KEBELE_DA:
    case Role.KEBELE_MANAGER:
      whereClause = { ...whereClause, farmer: { kebeleId: user.kebeleId } };
      break;
    case Role.WOREDA_EXPERT:
    case Role.WOREDA_MANAGER:
      whereClause = { ...whereClause, farmer: { kebele: { woredaId: user.woredaId } } };
      break;
    case Role.ZONE_EXPERT:
    case Role.ZONE_MANAGER:
      whereClause = { ...whereClause, farmer: { kebele: { woreda: { zoneId: user.zoneId } } } };
      break;
    case Role.REGION_EXPERT:
    case Role.REGION_MANAGER:
      whereClause = { ...whereClause, farmer: { kebele: { woreda: { zone: { regionId: user.regionId } } } } };
      break;
    case Role.MOA_EXPERT:
    case Role.MOA_MANAGER:

    case Role.SUPER_ADMIN:
      // No additional scope filtering needed for Federal or Super Admin
      break;
    default:
      return []; // No access for other roles
  }

  const demands = await prisma.farmerDemand.findMany({
    where: whereClause,
    select: {
      farmer: {
        select: {
          kebele: {
            select: {
              id: true,
              name: true,
              woreda: {
                select: {
                  id: true,
                  name: true,
                  zone: {
                    select: {
                      id: true,
                      name: true,
                      region: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const uniqueKebeles = new Map();
  demands.forEach((demand) => {
    if (demand.farmer?.kebele) {
      uniqueKebeles.set(demand.farmer.kebele.id, {
        id: demand.farmer.kebele.id,
        name: demand.farmer.kebele.name,
        woredaId: demand.farmer.kebele.woreda.id,
        woredaName: demand.farmer.kebele.woreda.name,
        zoneId: demand.farmer.kebele.woreda.zone.id,
        zoneName: demand.farmer.kebele.woreda.zone.name,
        regionId: demand.farmer.kebele.woreda.zone.region.id,
        regionName: demand.farmer.kebele.woreda.zone.region.name,
      });
    }
  });

  return Array.from(uniqueKebeles.values());
};

export const getWoredasByFertilizerTypeAndScope = async (
  fertilizerTypeId: string,
  user: AuthenticatedUser
) => {
  const kebeles = await getKebelesByFertilizerTypeAndScope(fertilizerTypeId, user);

  const woredasMap = new Map();
  kebeles.forEach((kebele) => {
    if (!woredasMap.has(kebele.woredaId)) {
      woredasMap.set(kebele.woredaId, {
        id: kebele.woredaId,
        name: kebele.woredaName,
        zoneId: kebele.zoneId,
        zoneName: kebele.zoneName,
        regionId: kebele.regionId,
        regionName: kebele.regionName,
        kebeles: [],
      });
    }
    woredasMap.get(kebele.woredaId).kebeles.push({ id: kebele.id, name: kebele.name });
  });

  return Array.from(woredasMap.values());
};

export const getZonesByFertilizerTypeAndScope = async (
  fertilizerTypeId: string,
  user: AuthenticatedUser
) => {
  const kebeles = await getKebelesByFertilizerTypeAndScope(fertilizerTypeId, user);

  const zonesMap = new Map();
  const woredasMap = new Map(); // To aggregate woredas within zones

  kebeles.forEach((kebele) => {
    // Aggregate Woredas first
    if (!woredasMap.has(kebele.woredaId)) {
      woredasMap.set(kebele.woredaId, {
        id: kebele.woredaId,
        name: kebele.woredaName,
        kebeles: [],
      });
    }
    woredasMap.get(kebele.woredaId).kebeles.push({ id: kebele.id, name: kebele.name });

    // Aggregate Zones
    if (!zonesMap.has(kebele.zoneId)) {
      zonesMap.set(kebele.zoneId, {
        id: kebele.zoneId,
        name: kebele.zoneName,
        regionId: kebele.regionId,
        regionName: kebele.regionName,
        woredas: [],
      });
    }
  });

  // Now, attach aggregated woredas to their respective zones
  woredasMap.forEach((woreda) => {
    const kebeleSample = kebeles.find(k => k.woredaId === woreda.id);
    if (kebeleSample) {
      zonesMap.get(kebeleSample.zoneId).woredas.push(woreda);
    }
  });

  return Array.from(zonesMap.values());
};

export const getRegionsByFertilizerTypeAndScope = async (
  fertilizerTypeId: string,
  user: AuthenticatedUser
) => {
  const kebeles = await getKebelesByFertilizerTypeAndScope(fertilizerTypeId, user);

  const regionsMap = new Map();
  const zonesMap = new Map();
  const woredasMap = new Map();

  kebeles.forEach((kebele) => {
    // Aggregate Woredas
    if (!woredasMap.has(kebele.woredaId)) {
      woredasMap.set(kebele.woredaId, {
        id: kebele.woredaId,
        name: kebele.woredaName,
        kebeles: [],
      });
    }
    woredasMap.get(kebele.woredaId).kebeles.push({ id: kebele.id, name: kebele.name });

    // Aggregate Zones
    if (!zonesMap.has(kebele.zoneId)) {
      zonesMap.set(kebele.zoneId, {
        id: kebele.zoneId,
        name: kebele.zoneName,
        woredas: [],
      });
    }

    // Aggregate Regions
    if (!regionsMap.has(kebele.regionId)) {
      regionsMap.set(kebele.regionId, {
        id: kebele.regionId,
        name: kebele.regionName,
        zones: [],
      });
    }
  });

  // Attach aggregated woredas to their respective zones
  woredasMap.forEach((woreda) => {
    const kebeleSample = kebeles.find(k => k.woredaId === woreda.id);
    if (kebeleSample) {
      zonesMap.get(kebeleSample.zoneId).woredas.push(woreda);
    }
  });

  // Attach aggregated zones to their respective regions
  zonesMap.forEach((zone) => {
    const kebeleSample = kebeles.find(k => k.zoneId === zone.id);
    if (kebeleSample) {
      regionsMap.get(kebeleSample.regionId).zones.push(zone);
    }
  });

  return Array.from(regionsMap.values());
};

export const searchFertilizer = async (fertilizerTypeId: string) => {
  const validFertilizers = await prisma.fertilizerType.findMany({
    where: {
      name: { in: ['UREA', 'DAP'] }
    }
  });

  const validIds = validFertilizers.map(f => f.id);
  const urea = validFertilizers.find(f => f.name === 'UREA');
  const dap = validFertilizers.find(f => f.name === 'DAP');

  if (!validIds.includes(fertilizerTypeId)) {
    throw new Error('Invalid fertilizer type. Only UREA and DAP are supported for search.');
  }

  const fertilizer = await prisma.fertilizerType.findUnique({
    where: { id: fertilizerTypeId },
    include: {
      _count: {
        select: {
          demands: true,
          sales: true,
          inventory: true,
          shippingLots: true,
        }
      }
    }
  });

  return fertilizer;
};

export const getFederalByFertilizerTypeAndScope = async (
  fertilizerTypeId: string,
  user: AuthenticatedUser
) => {
  // For federal level, we essentially get all regions and wrap them
  const regions = await getRegionsByFertilizerTypeAndScope(fertilizerTypeId, user);

  // If there are no regions, return an empty federal structure or null
  if (regions.length === 0) {
    return {
      id: 'federal', // A static ID for the federal level
      name: 'Federal',
      regions: [],
    };
  }

  return {
    id: 'federal',
    name: 'Federal',
    regions: regions,
  };
};