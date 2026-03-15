import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';
import { z } from 'zod';

const seasonSchema = z.object({
  name: z.string().min(1, 'Season name is required'),
  // Geographic filtering parameters (optional, based on your schema's hierarchical nature)
  regionId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  woredaId: z.string().uuid().optional(),
  kebeleId: z.string().uuid().optional(),
});

// @desc    Retrieve all seasons with hierarchical location filtering
// @route   GET /api/seasons
// @access  Public
export const getSeasons = asyncHandler(async (req: Request, res: Response) => {
  const { regionId, zoneId, woredaId, kebeleId } = req.query;

  // Currently, the Season model is not directly linked to geographic entities in your schema.
  // It's a global entity. If you want to filter seasons by location, you'd usually filter 
  // other entities (like FarmerDemand) that link to both location and season.
  // Returning all seasons as requested.

  const seasons = await prisma.season.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { demands: true }
      }
    }
  });

  res.json(seasons);
});

// @desc    Create new season record
// @route   POST /api/seasons
// @access  Private (SUPER_ADMIN)
export const createSeason = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = seasonSchema.parse(req.body);

  const season = await prisma.season.create({
    data: { name: validatedData.name },
  });

  res.status(201).json(season);
});

// @desc    Modify season data
// @route   PUT /api/seasons/:id
// @access  Private (SUPER_ADMIN)
export const updateSeason = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = seasonSchema.partial().parse(req.body);

  const season = await prisma.season.update({
    where: { id: String(id) },
    data: { name: validatedData.name },
  });

  res.json(season);
});
