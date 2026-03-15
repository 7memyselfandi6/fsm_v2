import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';
import {
  createRegionSchema,
  createZoneSchema,
  createWoredaSchema,
  createKebeleSchema,
  createUnionSchema,
  createDestinationSchema,
  createPCSchema,
} from '../utils/validators.js';

// --- Geographic Hierarchy ---

// @desc    Create a new region
// @route   POST /api/admin/regions
// @access  Private (SUPER_ADMIN)
export const createRegion = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createRegionSchema.parse(req.body);

  try {
    const region = await prisma.region.create({
      data: { name: validatedData.name },
    });
    res.status(201).json(region);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Failed to create region');
  }
});

// @desc    Create a new zone
// @route   POST /api/admin/zones
// @access  Private (SUPER_ADMIN)
export const createZone = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createZoneSchema.parse(req.body);

  try {
    const zone = await prisma.zone.create({
      data: {
        name: validatedData.name,
        regionId: validatedData.regionId,
      },
    });
    res.status(201).json(zone);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Failed to create zone. Ensure regionId exists.');
  }
});

// @desc    Create a new woreda
// @route   POST /api/admin/woredas
// @access  Private (SUPER_ADMIN)
export const createWoreda = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createWoredaSchema.parse(req.body);

  try {
    const woreda = await prisma.woreda.create({
      data: {
        name: validatedData.name,
        zoneId: validatedData.zoneId,
      },
    });
    res.status(201).json(woreda);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Failed to create woreda. Ensure zoneId exists.');
  }
});

// @desc    Create a new kebele
// @route   POST /api/admin/kebeles
// @access  Private (SUPER_ADMIN)
export const createKebele = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createKebeleSchema.parse(req.body);

  try {
    const kebele = await prisma.kebele.create({
      data: {
        name: validatedData.name,
        woredaId: validatedData.woredaId,
      },
    });
    res.status(201).json(kebele);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Failed to create kebele. Ensure woredaId exists.');
  }
});

// @desc    Update or create a region flag
// @route   PATCH /api/admin/regions/:id/flag
// @access  Private (SUPER_ADMIN)
export const updateRegionFlag = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category } = req.body;
  const imageUrl = req.file?.path;

  if (!imageUrl) {
    res.status(400);
    throw new Error('Please upload a flag image');
  }

  try {
    const regionalFlag = await prisma.regionalFlag.upsert({
      where: { regionId: String(id) },
      update: {
        imageUrl,
        name: name || 'Region Flag',
        category: category || 'Regional',
      },
      create: {
        regionId: String(id),
        imageUrl,
        name: name || 'Region Flag',
        category: category || 'Regional',
      },
    });
    res.json(regionalFlag);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Failed to update region flag');
  }
});

// --- Organizational Entities ---

// @desc    Create a new union
// @route   POST /api/admin/unions
// @access  Private (SUPER_ADMIN)
export const createUnion = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createUnionSchema.parse(req.body);

  try {
    const union = await prisma.union.create({
      data: {
        name: validatedData.name,
        regionId: validatedData.regionId,
        zoneId: validatedData.zoneId,
      },
    });
    res.status(201).json(union);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Failed to create union. Ensure regionId exists.');
  }
});

// @desc    Create a new destination
// @route   POST /api/admin/destinations
// @access  Private (SUPER_ADMIN)
export const createDestination = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createDestinationSchema.parse(req.body);

  try {
    const destination = await prisma.destination.create({
      data: {
        name: validatedData.name,
        unionId: validatedData.unionId,
      },
    });
    res.status(201).json(destination);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Failed to create destination. Ensure unionId exists.');
  }
});

// @desc    Create a new Primary Cooperative (PC)
// @route   POST /api/admin/pcs
// @access  Private (SUPER_ADMIN)
export const createPC = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = createPCSchema.parse(req.body);

  try {
    const pc = await prisma.pC.create({
      data: {
        name: validatedData.name,
        kebeleId: validatedData.kebeleId,
        destinationId: validatedData.destinationId,
      },
    });
    res.status(201).json(pc);
  } catch (error: any) {
    res.status(400);
    throw new Error(error.message || 'Failed to create PC. Ensure kebeleId and destinationId exist.');
  }
});
