import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as demandService from '../services/demand.service.js';
import { DemandStatus, LockingLevel } from '@prisma/client';

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

// @desc    Submit farmer demand
// @route   POST /api/demands
export const submitFarmerDemand = asyncHandler(async (req: Request, res: Response) => {
  const {
    farmerId,
    seasonId,
    cropTypeId,
    fertilizerTypeId,
    originalQuantity,
  } = req.body;

  if (!farmerId || !seasonId || !cropTypeId || !fertilizerTypeId || !originalQuantity) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const demand = await demandService.createFarmerDemand({
    farmerId,
    seasonId,
    cropTypeId,
    fertilizerTypeId,
    originalQuantity: parseFloat(originalQuantity),
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
