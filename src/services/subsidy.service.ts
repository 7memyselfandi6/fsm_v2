import prisma from '../config/prisma.js';

/** --- SUBSIDY MODULE --- **/

export const getSubsidyReports = async (params: any) => {
  const { 
    page = 1, 
    limit = 10, 
    year, 
    regionId, 
    fertilizerTypeId 
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (year) where.year = parseInt(year);
  if (regionId) where.regionId = regionId;
  if (fertilizerTypeId) where.fertilizerTypeId = fertilizerTypeId;

  const [subsidies, totalCount] = await Promise.all([
    prisma.fertilizerSubsidy.findMany({
      where,
      skip,
      take: limit,
      include: {
        region: true,
        fertilizerType: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.fertilizerSubsidy.count({ where })
  ]);

  // Regional Subtotals
  const regionalSubtotals = await prisma.fertilizerSubsidy.groupBy({
    by: ['regionId'],
    where,
    _sum: {
      amountMT: true,
      subsidyAmount: true
    }
  });

  // Grand Totals
  const grandTotals = await prisma.fertilizerSubsidy.aggregate({
    where,
    _sum: {
      amountMT: true,
      subsidyAmount: true
    }
  });

  return {
    subsidies,
    regionalSubtotals,
    grandTotals: grandTotals._sum,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount
    }
  };
};

export const createSubsidyRecord = async (data: any) => {
  return await prisma.fertilizerSubsidy.create({ data });
};

/** --- CROP FERTILIZER RATE MODULE --- **/

export const getCropFertilizerRates = async () => {
  return await prisma.cropFertilizerRate.findMany({
    include: { crop: true }
  });
};

export const updateCropFertilizerRate = async (id: number, data: any) => {
  const current = await prisma.cropFertilizerRate.findUnique({ where: { id } });
  if (current?.isLocked && data.isLocked !== false) {
    throw new Error('Record is locked and cannot be edited');
  }
  return await prisma.cropFertilizerRate.update({
    where: { id },
    data
  });
};

export const toggleRateLock = async (id: number, isLocked: boolean) => {
  return await prisma.cropFertilizerRate.update({
    where: { id },
    data: { isLocked }
  });
};
