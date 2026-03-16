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

// @desc    Adjust farmer demand (Multi-level)
// @route   PUT /api/demands/:id/adjust
export const adjustFarmerDemand = asyncHandler(async (req: Request, res: Response) => {
  const { adjustedQuantity, level } = req.body;
  const userRole = req.user.role;

  const demand = await demandService.adjustFarmerDemand(
    req.params.id as string,
    parseFloat(adjustedQuantity),
    level as LockingLevel,
    userRole
  );

  res.json(demand);
});

// @desc    Lock demand at a specific level
// @route   PUT /api/demands/lock
export const lockDemands = asyncHandler(async (req: Request, res: Response) => {
  const { level, regionId, zoneId, woredaId, kebeleId } = req.body;
  
  const result = await demandService.lockDemands(
    level as LockingLevel,
    { regionId, zoneId, woredaId, kebeleId }
  );

  res.json(result);
});

// @desc    Get aggregated demands for dashboard
// @route   GET /api/demands/dashboard
export const getDemandDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { regionId, zoneId, woredaId, kebeleId } = req.query;
  
  const dashboardData = await demandService.getDemandDashboard({
    regionId: regionId as string,
    zoneId: zoneId as string,
    woredaId: woredaId as string,
    kebeleId: kebeleId as string,
  });

  res.json(dashboardData);
});
