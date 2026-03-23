import prisma from '../config/prisma.js';
import { Role } from '@prisma/client';

export interface HierarchyValidationResult {
  regionId: string | null;
  zoneId: string | null;
  woredaId: string | null;
  kebeleId: string | null;
  pcId: string | null;
  unionId: string | null;
}

/**
 * Validates that the given location IDs form a consistent chain and that the role matches the deepest level.
 * Automatically fills in missing parent IDs from the child record.
 * Throws an error if anything is inconsistent.
 */
export async function validateHierarchyAndRole(data: {
  role: Role;
  regionId?: string;
  zoneId?: string;
  woredaId?: string;
  kebeleId?: string;
  pcId?: string;
  unionId?: string;
}): Promise<HierarchyValidationResult> {
  const { role, regionId, zoneId, woredaId, kebeleId, pcId, unionId } = data;

  // 1. MOA‑level users (Federal)
  if (role === Role.SUPER_ADMIN || role === Role.MOA_MANAGER || role === Role.MOA_EXPERT) {
    if (regionId || zoneId || woredaId || kebeleId || pcId || unionId) {
      throw new Error('Federal-level users cannot have any location assignment');
    }
    return { regionId: null, zoneId: null, woredaId: null, kebeleId: null, pcId: null, unionId: null };
  }

  // 2. Region‑level users
  if (role === Role.REGION_MANAGER || role === Role.REGION_EXPERT) {
    if (!regionId) throw new Error('Region ID is required for region‑level users');
    if (zoneId || woredaId || kebeleId || pcId || unionId) {
      throw new Error('Region‑level users cannot have lower‑level assignments');
    }
    const region = await prisma.region.findUnique({ where: { id: regionId } });
    if (!region) throw new Error('Region not found');
    return { regionId, zoneId: null, woredaId: null, kebeleId: null, pcId: null, unionId: null };
  }

  // 3. Zone‑level users
  if (role === Role.ZONE_MANAGER || role === Role.ZONE_EXPERT) {
    if (!zoneId) throw new Error('Zone ID is required for zone‑level users');
    if (woredaId || kebeleId || pcId || unionId) {
      throw new Error('Zone‑level users cannot have lower‑level assignments');
    }
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: { region: true },
    });
    if (!zone) throw new Error('Zone not found');
    if (regionId && zone.regionId !== regionId) {
      throw new Error('Zone does not belong to the selected region');
    }
    return {
      regionId: zone.regionId,
      zoneId,
      woredaId: null,
      kebeleId: null,
      pcId: null,
      unionId: null,
    };
  }

  // 4. Woreda‑level users
  if (role === Role.WOREDA_MANAGER || role === Role.WOREDA_EXPERT) {
    if (!woredaId) throw new Error('Woreda ID is required for woreda‑level users');
    if (kebeleId || pcId || unionId) {
      throw new Error('Woreda‑level users cannot have lower‑level assignments');
    }
    const woreda = await prisma.woreda.findUnique({
      where: { id: woredaId },
      include: { zone: { include: { region: true } } },
    });
    if (!woreda) throw new Error('Woreda not found');
    if (zoneId && woreda.zoneId !== zoneId) {
      throw new Error('Woreda does not belong to the selected zone');
    }
    if (regionId && woreda.zone.regionId !== regionId) {
      throw new Error('Woreda does not belong to the selected region');
    }
    return {
      regionId: woreda.zone.regionId,
      zoneId: woreda.zoneId,
      woredaId,
      kebeleId: null,
      pcId: null,
      unionId: null,
    };
  }

  // 5. Kebele‑level users
  if (role === Role.KEBELE_MANAGER || role === Role.KEBELE_DA) {
    if (!kebeleId) throw new Error('Kebele ID is required for kebele‑level users');
    if (pcId || unionId) {
      throw new Error('Kebele‑level users cannot have lower‑level assignments');
    }
    const kebele = await prisma.kebele.findUnique({
      where: { id: kebeleId },
      include: { woreda: { include: { zone: { include: { region: true } } } } },
    });
    if (!kebele) throw new Error('Kebele not found');
    if (woredaId && kebele.woredaId !== woredaId) {
      throw new Error('Kebele does not belong to the selected woreda');
    }
    if (zoneId && kebele.woreda.zoneId !== zoneId) {
      throw new Error('Kebele does not belong to the selected zone');
    }
    if (regionId && kebele.woreda.zone.regionId !== regionId) {
      throw new Error('Kebele does not belong to the selected region');
    }
    return {
      regionId: kebele.woreda.zone.regionId,
      zoneId: kebele.woreda.zoneId,
      woredaId: kebele.woredaId,
      kebeleId,
      pcId: null,
      unionId: null,
    };
  }

  // 6. PC‑level users
  if (role === Role.PC_ACCOUNTANT || role === Role.PC_STOREMAN) {
    if (!pcId) throw new Error('PC ID is required for PC‑level users');
    if (unionId) {
      throw new Error('PC‑level users cannot have union assignments');
    }
    const pc = await prisma.pC.findUnique({
      where: { id: pcId },
      include: {
        kebele: {
          include: {
            woreda: {
              include: {
                zone: {
                  include: { region: true },
                },
              },
            },
          },
        },
        destination: {
          include: { union: true }
        }
      },
    });
    if (!pc) throw new Error('PC not found');
    if (kebeleId && pc.kebeleId !== kebeleId) {
      throw new Error('PC does not belong to the selected kebele');
    }
    if (woredaId && pc.kebele.woredaId !== woredaId) {
      throw new Error('PC does not belong to the selected woreda');
    }
    if (zoneId && pc.kebele.woreda.zoneId !== zoneId) {
      throw new Error('PC does not belong to the selected zone');
    }
    if (regionId && pc.kebele.woreda.zone.regionId !== regionId) {
      throw new Error('PC does not belong to the selected region');
    }
    return {
      regionId: pc.kebele.woreda.zone.regionId,
      zoneId: pc.kebele.woreda.zoneId,
      woredaId: pc.kebele.woredaId,
      kebeleId: pc.kebeleId,
      pcId,
      unionId: pc.destination.unionId,
    };
  }

  // 7. Union‑level users
  if (role === Role.UNION_MEMBER) {
    if (!unionId) throw new Error('Union ID is required for union‑level users');
    const union = await prisma.union.findUnique({
      where: { id: unionId },
    });
    if (!union) throw new Error('Union not found');
    if (regionId && union.regionId !== regionId) {
      throw new Error('Union does not belong to the selected region');
    }
    if (zoneId && union.zoneId && union.zoneId !== zoneId) {
      throw new Error('Union does not belong to the selected zone');
    }
    return {
      regionId: union.regionId,
      zoneId: union.zoneId,
      woredaId: null,
      kebeleId: null,
      pcId: null,
      unionId,
    };
  }

  // 8. Farmer / Guest
  if (role === Role.FARMER || role === Role.GUEST) {
    // For now, allow these but they don't have mandatory hierarchy checks here
    // unless the system evolves.
    return { 
      regionId: regionId || null, 
      zoneId: zoneId || null, 
      woredaId: woredaId || null, 
      kebeleId: kebeleId || null, 
      pcId: pcId || null, 
      unionId: unionId || null 
    };
  }

  throw new Error('Invalid role for location assignment');
}