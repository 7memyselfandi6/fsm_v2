import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';
import { z } from 'zod';

const fertilizerTypeSchema = z.object({
  name: z.string().min(1, 'Fertilizer name is required'),
});

// @desc    Fetch all fertilizer types with metadata
// @route   GET /api/fertilizer-types
// @access  Public
export const getFertilizerTypes = asyncHandler(async (req: Request, res: Response) => {
  const fertilizers = await prisma.fertilizerType.findMany({
    include: {
      _count: {
        select: {
          demands: true,
          sales: true,
          inventory: true,
          shippingLots: true,
        }
      }
    },
    orderBy: { name: 'asc' },
  });

  res.json(fertilizers);
});

// @desc    Add new fertilizer type definition
// @route   POST /api/fertilizer-types
// @access  Private (SUPER_ADMIN)
export const createFertilizerType = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = fertilizerTypeSchema.parse(req.body);

  const fertilizer = await prisma.fertilizerType.create({
    data: { name: validatedData.name },
  });

  res.status(201).json(fertilizer);
});
