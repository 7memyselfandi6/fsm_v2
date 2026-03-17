import prisma from '../config/prisma.js';

export const getRegions = async () => {
  return await prisma.region.findMany({
    include: { regionalFlag: true },
  });
};

export const getZones = async (regionId: string) => {
  return await prisma.zone.findMany({
    where: { regionId },
    include: { region: { select: { id: true, name: true } } }
  });
};

export const getWoredas = async (zoneId: string) => {
  return await prisma.woreda.findMany({
    where: { zoneId },
    include: { zone: { include: { region: { select: { id: true, name: true } } } } }
  });
};

export const getKebeles = async (woredaId: string) => {
  return await prisma.kebele.findMany({
    where: { woredaId },
    include: { woreda: { include: { zone: { include: { region: { select: { id: true, name: true } } } } } } }
  });
};

export const getSections = async (kebeleId: string) => {
  return await prisma.section.findMany({
    where: { kebeleId },
    include: { kebele: { include: { woreda: { include: { zone: { include: { region: { select: { id: true, name: true } } } } } } } } }
  });
};

export const getKebeleById = async (id: string) => {
  return await prisma.kebele.findUnique({
    where: { id },
    include: { woreda: { include: { zone: { include: { region: true } } } }, sections: true }
  });
};

export const getSectionById = async (id: string) => {
  return await prisma.section.findUnique({
    where: { id },
    include: { kebele: { include: { woreda: { include: { zone: { include: { region: true } } } } } } }
  });
};

export const createKebele = async (data: any) => {
  return await prisma.kebele.create({ data });
};

export const updateKebele = async (id: string, data: any) => {
  return await prisma.kebele.update({ where: { id }, data });
};

export const deleteKebele = async (id: string) => {
  return await prisma.kebele.delete({ where: { id } });
};

export const createSection = async (data: any) => {
  return await prisma.section.create({ data });
};

export const updateSection = async (id: string, data: any) => {
  return await prisma.section.update({ where: { id }, data });
};

export const deleteSection = async (id: string) => {
  return await prisma.section.delete({ where: { id } });
};
