import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';

// @desc    Retrieve system flags or indicators
// @route   GET /api/flags
// @access  Public
export const getFlags = asyncHandler(async (req: Request, res: Response) => {
  const flags = await prisma.regionalFlag.findMany({
    include: { region: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(flags);
});

// @desc    Get insertion dates for each table
// @route   GET /api/system/dates
// @access  Private (SUPER_ADMIN)
export const getSystemDates = asyncHandler(async (req: Request, res: Response) => {
  // Return the last created record timestamp for major entities
  const tables = [
    'user', 'region', 'zone', 'woreda', 'kebele', 
    'union', 'destination', 'pC', 'farmer', 
    'farmerDemand', 'shippingLot', 'fertilizerSale'
  ];

  const results = await Promise.all(
    tables.map(async (table) => {
      const lastRecord = await (prisma[table as keyof typeof prisma] as any).findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });
      return { table, lastUpdate: lastRecord?.createdAt || null };
    })
  );

  res.json(results);
});

// @desc    Initialize demand collection form data
// @route   GET /api/system/init-demand-form
// @access  Private
export const getInitDemandFormData = asyncHandler(async (req: Request, res: Response) => {
  const [seasons, cropCategories, fertilizerTypes] = await Promise.all([
    prisma.season.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    }),
    prisma.cropCategory.findMany({
      include: {
        cropTypes: {
          select: { id: true, name: true }
        }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.fertilizerType.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ]);

  // Transform crop categories into the requested nested format
  const categorizedCrops: Record<string, any[]> = {};
  cropCategories.forEach(category => {
    categorizedCrops[category.name] = category.cropTypes;
  });

  res.json({
    seasons,
    crops: categorizedCrops,
    fertilizerTypes: fertilizerTypes.map(f => ({ ...f, unit: 'Qt' }))
  });
});

