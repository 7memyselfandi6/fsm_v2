
import prisma from '../config/prisma.js';
import { getEffectiveQty } from './demand.service.js';

const getPaginatedResults = async (model: any, page: number, limit: number, where: any = {}, include: any = {}) => {
  const [records, totalCount] = await Promise.all([
    model.findMany({ where, include, skip: (page - 1) * limit, take: limit }),
    model.count({ where })
  ]);
  return { records, totalCount };
};

const calculateAmounts = (demands: any[]) => {
  let totalAmount = 0;
  let totalAdjustedAmount = 0;
  demands.forEach(d => {
    totalAmount += d.originalQuantity;
    totalAdjustedAmount += getEffectiveQty(d);
  });
  return { totalAmount, totalAdjustedAmount };
};

export const getKebeleFinancials = async (page: number, limit: number) => {
  const { records, totalCount } = await getPaginatedResults(prisma.kebele, page, limit, {}, { farmers: { include: { demands: true } } });
  const financials = records.map((k: any) => {
    const demands = k.farmers.flatMap((f: any) => f.demands);
    const { totalAmount, totalAdjustedAmount } = calculateAmounts(demands);
    return {
      kebeleId: k.id,
      kebeleName: k.name,
      totalAmount: totalAmount.toFixed(2),
      totalAdjustedAmount: totalAdjustedAmount.toFixed(2),
      isEnabled: k.status
    };
  });
  return { financials, totalCount };
};

export const getWoredaFinancials = async (page: number, limit: number) => {
  const { records, totalCount } = await getPaginatedResults(prisma.woreda, page, limit, {}, { kebeles: { include: { farmers: { include: { demands: true } } } } });
  const financials = records.map((w: any) => {
    const demands = w.kebeles.flatMap((k: any) => k.farmers.flatMap((f: any) => f.demands));
    const { totalAmount, totalAdjustedAmount } = calculateAmounts(demands);
    return {
      woredaId: w.id,
      woredaName: w.name,
      totalAmount: totalAmount.toFixed(2),
      totalAdjustedAmount: totalAdjustedAmount.toFixed(2),
      isEnabled: w.status
    };
  });
  return { financials, totalCount };
};

export const getZoneFinancials = async (page: number, limit: number) => {
  const { records, totalCount } = await getPaginatedResults(prisma.zone, page, limit, {}, { woredas: { include: { kebeles: { include: { farmers: { include: { demands: true } } } } } } });
  const financials = records.map((z: any) => {
    const demands = z.woredas.flatMap((w: any) => w.kebeles.flatMap((k: any) => k.farmers.flatMap((f: any) => f.demands)));
    const { totalAmount, totalAdjustedAmount } = calculateAmounts(demands);
    return {
      zoneId: z.id,
      zoneName: z.name,
      totalAmount: totalAmount.toFixed(2),
      totalAdjustedAmount: totalAdjustedAmount.toFixed(2),
      isEnabled: z.status
    };
  });
  return { financials, totalCount };
};

export const getRegionFinancials = async (page: number, limit: number) => {
  const { records, totalCount } = await getPaginatedResults(prisma.region, page, limit, {}, { zones: { include: { woredas: { include: { kebeles: { include: { farmers: { include: { demands: true } } } } } } } } });
  const financials = records.map((r: any) => {
    const demands = r.zones.flatMap((z: any) => z.woredas.flatMap((w: any) => w.kebeles.flatMap((k: any) => k.farmers.flatMap((f: any) => f.demands))));
    const { totalAmount, totalAdjustedAmount } = calculateAmounts(demands);
    return {
      regionId: r.id,
      regionName: r.name,
      totalAmount: totalAmount.toFixed(2),
      totalAdjustedAmount: totalAdjustedAmount.toFixed(2),
      isEnabled: r.status
    };
  });
  return { financials, totalCount };
};

export const getFederalFinancials = async (page: number, limit: number) => {
  // Since federal is not a model in Prisma, we create a single mock record for the federal level
  const records = [{ id: 1, name: 'Federal', status: true }];
  const totalCount = 1;
  // Assuming federal level aggregates all demands
  const allDemands = await prisma.farmerDemand.findMany();
  const { totalAmount, totalAdjustedAmount } = calculateAmounts(allDemands);
  const financials = records.map((f: any) => ({
    federalId: f.id,
    federalName: f.name,
    totalAmount: totalAmount.toFixed(2),
    totalAdjustedAmount: totalAdjustedAmount.toFixed(2),
    isEnabled: f.status
  }));
  return { financials, totalCount };
};
