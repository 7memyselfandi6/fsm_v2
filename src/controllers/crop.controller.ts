import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';
import { z } from 'zod';

const cropSchema = z.object({
  name: z.string().min(1, 'Crop name is required'),
  categoryId: z.string().uuid('Invalid category ID'),
});

// @desc    Get all crops with pagination and filtering
// @route   GET /api/crops
// @access  Public
export const getCrops = asyncHandler(async (req: Request, res: Response) => {
  const { categoryId, search, page = '1', limit = '20' } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const where: any = {};
  if (categoryId) where.categoryId = categoryId as string;
  if (search) {
    where.name = { contains: search as string, mode: 'insensitive' };
  }

  const [crops, total] = await Promise.all([
    prisma.cropType.findMany({
      where,
      skip,
      take,
      include: { category: true },
      orderBy: { name: 'asc' },
    }),
    prisma.cropType.count({ where }),
  ]);

  res.json({
    crops,
    meta: {
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
});

// @desc    Create a new crop entry
// @route   POST /api/crops
// @access  Private (SUPER_ADMIN)
export const createCrop = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = cropSchema.parse(req.body);

  const crop = await prisma.cropType.create({
    data: {
      name: validatedData.name,
      categoryId: validatedData.categoryId,
    },
  });

  res.status(201).json(crop);
});

// @desc    Update crop information
// @route   PUT /api/crops/:id
// @access  Private (SUPER_ADMIN)
export const updateCrop = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = cropSchema.partial().parse(req.body);

  const crop = await prisma.cropType.update({
    where: { id: id as string },
    data: validatedData,
  });

  res.json(crop);
});
