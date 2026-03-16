import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as demandService from '../services/demand.service.js';
import { DemandStatus, LockingLevel } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';

// Validation Schema
const demandSchema = z.object({
  seasonName: z.string().min(1, 'Season name is required'),
  cropTypeId: z.string().uuid('Invalid Crop Type ID'),
  fertilizerTypeId: z.string().uuid('Invalid Fertilizer Type ID'),
  originalQuantity: z.number().positive('Quantity must be a positive number'),
});

// Helper to generate a human-readable unique request ID
const generateRequestId = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `REQ-${year}-${random}`;
};

// @desc    Get seasons
// @route   GET /api/demands/seasons
export const getSeasons = asyncHandler(async (req: Request, res: Response) => {
  const seasons = await demandService.getSeasons();
  res.json(seasons);
});

// @desc    Get crop categories
// @route   GET /api/demands/crops
export const getCropCategories = asyncHandler(async (req: Request, res: Response) => {
  const crops = await demandService.getCropCategories();
  res.json(crops);
});

// @desc    Get fertilizer types
// @route   GET /api/demands/fertilizers
export const getFertilizerTypes = asyncHandler(async (req: Request, res: Response) => {
  const fertilizers = await demandService.getFertilizerTypes();
  res.json(fertilizers);
});

// @desc    Submit farmer demand (Automatically populates farmerId and seasonId)
// @route   POST /api/demands
export const submitFarmerDemand = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validation using Zod
  const validatedBody = demandSchema.parse({
    ...req.body,
    originalQuantity: parseFloat(req.body.originalQuantity),
  });

  // 2. Automatic Farmer ID population from session
  const farmerId = req.user?.farmerId;
  if (!farmerId) {
    res.status(401);
    throw new Error('Authenticated user is not linked to a farmer profile');
  }

  // 3. Automatic Season ID determination based on name and context
  const season = await demandService.getSeasonByName(validatedBody.seasonName);
  if (!season) {
    res.status(404);
    throw new Error(`Season '${validatedBody.seasonName}' not found in the system`);
  }

  // 4. Business ID Generation
  const requestId = generateRequestId();

  // 5. Submit Demand
  const demand = await demandService.createFarmerDemand({
    requestId,
    farmerId,
    seasonId: season.id,
    cropTypeId: validatedBody.cropTypeId,
    fertilizerTypeId: validatedBody.fertilizerTypeId,
    originalQuantity: validatedBody.originalQuantity,
    status: DemandStatus.PENDING,
  });

  res.status(201).json(demand);
});

// @desc    Get aggregated demands for dashboard summary
// @route   GET /api/demands/dashboard-summary
export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user;
  const dashboardData = await demandService.getDemandDashboardSummary({
    regionId: user.regionId,
    zoneId: user.zoneId,
    woredaId: user.woredaId,
    kebeleId: user.kebeleId,
  });

  if (!dashboardData) {
    res.status(404);
    throw new Error('No active season found');
  }

  res.json(dashboardData);
});

// @desc    Get detailed demand list with search and scoping
// @route   GET /api/demands/detail-list
export const getDetailList = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, fertilizerType, page, limit } = req.query;
  const user = req.user;

  const result = await demandService.getDemandDetailList(
    { 
      q: q as string, 
      status: status as string, 
      fertilizerType: fertilizerType as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20
    },
    {
      regionId: user.regionId,
      zoneId: user.zoneId,
      woredaId: user.woredaId,
      kebeleId: user.kebeleId,
      role: user.role
    }
  );

  res.json(result);
});

// @desc    Adjust farmer demand (Approved quantity)
// @route   PUT /api/demands/:id/adjust
export const adjustFarmerDemand = asyncHandler(async (req: Request, res: Response) => {
  const { adjustedQuantity, level } = req.body;
  const { id } = req.params;
  const user = req.user;

  // Determine adjustment level if not provided
  let targetLevel = level as LockingLevel;
  if (!targetLevel) {
    if (user.role.includes('MOA')) targetLevel = LockingLevel.MOA;
    else if (user.role.includes('REGION')) targetLevel = LockingLevel.REGION;
    else if (user.role.includes('ZONE')) targetLevel = LockingLevel.ZONE;
    else if (user.role.includes('WOREDA')) targetLevel = LockingLevel.WOREDA;
    else if (user.role.includes('KEBELE')) targetLevel = LockingLevel.KEBELE;
  }

  const demand = await demandService.adjustFarmerDemand(
    id as string,
    parseFloat(adjustedQuantity),
    targetLevel,
    user.role
  );

  res.json(demand);
});

// @desc    Edit a demand (Kebele level edit while PENDING)
// @route   PUT /api/demands/:id
export const updateDemand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { originalQuantity, fertilizerTypeId } = req.body;

  const demand = await demandService.getDemandById(id);
  if (!demand) {
    res.status(404);
    throw new Error('Demand not found');
  }

  if (demand.status !== DemandStatus.PENDING) {
    res.status(403);
    throw new Error('Cannot edit a demand that is not PENDING');
  }

  const updatedDemand = await demandService.updateFarmerDemand(id, {
    originalQuantity: originalQuantity ? parseFloat(originalQuantity) : undefined,
    fertilizerTypeId: fertilizerTypeId,
  });

  res.json(updatedDemand);
});

// @desc    Delete a demand (Only if PENDING)
// @route   DELETE /api/demands/:id
export const deleteDemand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await demandService.deleteFarmerDemand(id);
  res.json({ message: 'Demand deleted successfully' });
});
