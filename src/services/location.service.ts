import prisma from '../config/prisma.js';

export const getRegions = async () => {
  return await prisma.region.findMany({
    include: { regionalFlag: true },
  });
};

export const getZones = async (regionId: string) => {
  return await prisma.zone.findMany({
    where: { regionId },
  });
};

export const getWoredas = async (zoneId: string) => {
  return await prisma.woreda.findMany({
    where: { zoneId },
  });
};

export const getKebeles = async (woredaId: string) => {
  return await prisma.kebele.findMany({
    where: { woredaId },
  });
};
