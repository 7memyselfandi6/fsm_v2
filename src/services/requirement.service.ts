import prisma from '../config/prisma.js';
import { FarmerRequirementInput } from '../types/requirement.js';
import { Prisma } from '@prisma/client';

export const createRequirement = async (data: FarmerRequirementInput) => {
  const { uniqueFarmerId, seasons, fertilizers, cropTypeIds } = data;

  // 1. Validate uniqueFarmerId uniqueness
  const existing = await prisma.farmerRequirement.findUnique({ where: { uniqueFarmerId } });
  if (existing) {
    const error = new Error('Farmer requirement already exists');
    (error as any).status = 409;
    throw error;
  }

  // 2. Verify master data
  await validateMasterData(fertilizers, cropTypeIds);

  // 3. Transactional insert
  return await prisma.$transaction(async (tx) => {
    const requirement = await tx.farmerRequirement.create({
      data: {
        uniqueFarmerId,
        cropTypeIds,
        seasons: {
          create: seasons.map(s => ({
            seasonName: s.seasonName,
            month: s.month
          }))
        },
        fertilizers: {
          create: fertilizers.map(f => ({
            fertilizerTypeId: f.fertilizerTypeId,
            quantity: f.quantity
          }))
        }
      },
      include: {
        seasons: { select: { seasonName: true, month: true } },
        fertilizers: { select: { fertilizerTypeId: true, quantity: true } }
      }
    });

    return formatResponse(requirement);
  });
};

export const getRequirements = async (page: number = 0, size: number = 50) => {
  const skip = page * size;
  const take = size;

  const [items, count] = await Promise.all([
    prisma.farmerRequirement.findMany({
      skip,
      take,
      include: {
        seasons: { select: { seasonName: true, month: true } },
        fertilizers: { select: { fertilizerTypeId: true, quantity: true } }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.farmerRequirement.count()
  ]);

  return {
    items: items.map(formatResponse),
    totalCount: count
  };
};

export const getRequirementById = async (uniqueFarmerId: string) => {
  const requirement = await prisma.farmerRequirement.findUnique({
    where: { uniqueFarmerId },
    include: {
      seasons: { select: { seasonName: true, month: true } },
      fertilizers: { select: { fertilizerTypeId: true, quantity: true } }
    }
  });

  if (!requirement) return null;
  return formatResponse(requirement);
};

export const updateRequirement = async (uniqueFarmerId: string, data: FarmerRequirementInput) => {
  const { seasons, fertilizers, cropTypeIds } = data;

  // 1. Verify master data
  await validateMasterData(fertilizers, cropTypeIds);

  // 2. SERIALIZABLE transaction with row lock
  return await prisma.$transaction(async (tx) => {
    // a. Row lock using SELECT ... FOR UPDATE
    // Note: Raw query is needed for FOR UPDATE
    const lockedRows = await tx.$queryRaw<any[]>`
      SELECT "uniqueFarmerId" FROM "farmer_requirement" 
      WHERE "uniqueFarmerId" = ${uniqueFarmerId} 
      FOR UPDATE
    `;

    if (lockedRows.length === 0) {
      const error = new Error('Farmer requirement not found');
      (error as any).status = 404;
      throw error;
    }

    // b. DELETE existing children
    await tx.requirementSeason.deleteMany({ where: { uniqueFarmerId } });
    await tx.requirementFertilizer.deleteMany({ where: { uniqueFarmerId } });

    // c. INSERT new children and d. UPDATE top-level
    const updated = await tx.farmerRequirement.update({
      where: { uniqueFarmerId },
      data: {
        cropTypeIds,
        seasons: {
          create: seasons.map(s => ({
            seasonName: s.seasonName,
            month: s.month
          }))
        },
        fertilizers: {
          create: fertilizers.map(f => ({
            fertilizerTypeId: f.fertilizerTypeId,
            quantity: f.quantity
          }))
        }
      },
      include: {
        seasons: { select: { seasonName: true, month: true } },
        fertilizers: { select: { fertilizerTypeId: true, quantity: true } }
      }
    });

    return formatResponse(updated);
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable
  });
};

export const deleteRequirement = async (uniqueFarmerId: string) => {
  const existing = await prisma.farmerRequirement.findUnique({ where: { uniqueFarmerId } });
  if (!existing) return false;

  await prisma.farmerRequirement.delete({ where: { uniqueFarmerId } });
  return true;
};

/** --- HELPERS --- **/

const validateMasterData = async (fertilizers: any[], cropTypeIds: string[]) => {
  // Check fertilizerTypeIds
  const fertTypeIds = fertilizers.map(f => f.fertilizerTypeId);
  const foundFertTypes = await prisma.fertilizerType.findMany({
    where: { id: { in: fertTypeIds } }
  });

  if (foundFertTypes.length !== fertTypeIds.length) {
    const error = new Error('One or more fertilizerTypeIds are invalid');
    (error as any).status = 400;
    throw error;
  }

  // Check cropTypeIds
  const foundCropTypes = await prisma.cropType.findMany({
    where: { id: { in: cropTypeIds } }
  });

  if (foundCropTypes.length !== cropTypeIds.length) {
    const error = new Error('One or more cropTypeIds are invalid');
    (error as any).status = 400;
    throw error;
  }
};

const formatResponse = (req: any) => ({
  seasons: req.seasons,
  fertilizers: req.fertilizers,
  cropTypeIds: req.cropTypeIds,
  uniqueFarmerId: req.uniqueFarmerId
});
