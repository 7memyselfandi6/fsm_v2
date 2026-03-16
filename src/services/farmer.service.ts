import prisma from '../config/prisma.js';

export const registerFarmer = async (farmerData: any) => {
  return await prisma.farmer.create({
    data: farmerData,
  });
};

export const getFarmerById = async (uniqueFarmerId: string) => {
  return await prisma.farmer.findUnique({
    where: { uniqueFarmerId },
    include: {
      kebele: {
        include: {
          woreda: {
            include: {
              zone: {
                include: {
                  region: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

export const getAllFarmersByKebele = async (kebeleId: string) => {
  return await prisma.farmer.findMany({
    where: { kebeleId },
  });
};

export const updateFarmer = async (id: string, updateData: any) => {
  return await prisma.farmer.update({
    where: { id },
    data: updateData,
  });
};

export const deleteFarmer = async (id: string) => {
  return await prisma.farmer.delete({
    where: { id },
  });
};
