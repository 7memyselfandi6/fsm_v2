import prisma from '../config/prisma.js';

export const getWarehouses = async (params: any) => {
  const { 
    page = 1, 
    limit = 10, 
    q, 
    regionId, 
    zoneId, 
    woredaId, 
    year, 
    minCapacity, 
    maxCapacity 
  } = params;

  const skip = (page - 1) * limit;

  const where: any = {};
  if (regionId) where.regionId = regionId;
  if (zoneId) where.zoneId = zoneId;
  if (woredaId) where.woredaId = woredaId;
  if (year) where.year = parseInt(year);
  if (minCapacity || maxCapacity) {
    where.capacity = {
      ...(minCapacity && { gte: parseFloat(minCapacity) }),
      ...(maxCapacity && { lte: parseFloat(maxCapacity) })
    };
  }

  if (q) {
    where.OR = [
      { center: { contains: q, mode: 'insensitive' } },
      { town: { contains: q, mode: 'insensitive' } },
      { storeman: { contains: q, mode: 'insensitive' } }
    ];
  }

  const [warehouses, totalCount] = await Promise.all([
    prisma.warehouse.findMany({
      where,
      skip,
      take: limit,
      include: {
        region: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.warehouse.count({ where })
  ]);

  return {
    warehouses,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount
    }
  };
};

export const getWarehouseById = async (id: string) => {
  return await prisma.warehouse.findUnique({
    where: { id },
    include: { region: true }
  });
};

export const createWarehouse = async (data: any) => {
  return await prisma.warehouse.create({ data });
};

export const updateWarehouse = async (id: string, data: any) => {
  return await prisma.warehouse.update({
    where: { id },
    data
  });
};

export const deleteWarehouse = async (id: string) => {
  return await prisma.warehouse.delete({
    where: { id }
  });
};
