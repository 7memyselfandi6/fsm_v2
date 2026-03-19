import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as demandService from '../services/demand.service.js';
import { DemandStatus, LockingLevel } from '@prisma/client';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../config/prisma.js';

// Validation Schema for Public Bulk Submission
const publicBulkDemandSchema = z.object({
  uniqueFarmerId: z.string().min(1, 'Farmer ID is required'),
  seasonName: z.string().min(1, 'Season name is required'),
  cropTypeIds: z.array(z.string().uuid('Invalid Crop Type ID')).min(1, 'At least one crop must be selected'),
  fertilizers: z.array(z.object({
    fertilizerTypeId: z.string().uuid('Invalid Fertilizer Type ID'),
    quantity: z.number().positive('Quantity must be a positive number'),
  })).min(1, 'At least one fertilizer type must be specified'),
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

// @desc    Submit farmer demands in bulk (Public - identified by uniqueFarmerId)
// @route   POST /api/demands
export const submitFarmerDemand = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validation using Zod
  const validatedBody = publicBulkDemandSchema.parse(req.body);

  // 2. Farmer Validation (Lookup by uniqueFarmerId)
  const farmer = await prisma.farmer.findUnique({
    where: { uniqueFarmerId: validatedBody.uniqueFarmerId },
    select: { id: true, kebeleId: true }
  });

  if (!farmer) {
    res.status(404);
    throw new Error('Invalid Farmer ID. Please check your ID and try again.');
  }

  // 3. Season Resolution
  const season = await demandService.getSeasonByName(validatedBody.seasonName);
  if (!season) {
    res.status(404);
    throw new Error(`Season '${validatedBody.seasonName}' not found`);
  }

  // 4. Data Mapping & Service Call
  const result = await demandService.createBatchFarmerDemands({
    farmerId: farmer.id,
    seasonId: season.id,
    cropTypeIds: validatedBody.cropTypeIds,
    fertilizers: validatedBody.fertilizers,
    generateRequestId
  });

  res.status(201).json({
    success: true,
    count: result.count
  });
});

// @desc    Get aggregated demands for dashboard summary
// @route   GET /api/demands/dashboard-summary
export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, pageSize, status, year, seasonName } = req.query;
  const user = req.user;

  const dashboardData = await demandService.getDemandDashboardSummary(
    {
      page: page ? parseInt(page as string) : 1,
      limit: (limit || pageSize) ? parseInt((limit || pageSize) as string) : 5,
      status: status as string,
      seasonName: (seasonName || year) as string,
    },
    {
      regionId: user.regionId,
      zoneId: user.zoneId,
      woredaId: user.woredaId,
      kebeleId: user.kebeleId,
    }
  );

  if (dashboardData === null || dashboardData === undefined) {
    res.status(404);
    throw new Error('No active season found');
  }

  res.json(dashboardData);
});

// @desc    Get detailed demand list with search and scoping
// @route   GET /api/demands/detail-list
export const getDetailList = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, fertilizerType, page, limit, pageSize, year, seasonName } = req.query;
  const user = req.user;

  const result = await demandService.getDemandDetailList(
    { 
      q: q as string, 
      status: status as string, 
      fertilizerType: fertilizerType as string,
      page: page ? parseInt(page as string) : 1,
      limit: (limit || pageSize) ? parseInt((limit || pageSize) as string) : 10,
      seasonName: (seasonName || year) as string
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

// @desc    Get Woreda-level summary
// @route   GET /api/demands/woreda-summary
export const getWoredaSummary = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.getWoredaSummary(req.user);
  res.json(result);
});

// @desc    Get Woreda-level detailed list (Farmer requests)
// @route   GET /api/demands/woreda-detail-list
export const getWoredaDetailList = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, fertilizerType, kebeleId, page, limit } = req.query;
  const user = req.user;

  const result = await demandService.getDemandDetailList(
    {
      q: q as string,
      status: status as string,
      fertilizerType: fertilizerType as string,
      kebeleId: kebeleId as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    },
    {
      woredaId: user.woredaId,
      regionId: user.regionId,
      role: user.role
    }
  );

  res.json(result);
});

// @desc    Get Woreda adjustment table
// @route   GET /api/demands/woreda-adjustment-table
export const getWoredaAdjustmentTable = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.getWoredaAdjustmentTable(req.user);
  res.json(result);
});

// @desc    Adjust Woreda-level demand (Distribute across Kebeles)
// @route   PATCH /api/demands/woreda-adjust
export const woredaAdjust = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.woredaAdjust(req.body, req.user);
  res.json(result);
});

// @desc    Get Zone-level summary
// @route   GET /api/demands/zone-summary
export const getZoneSummary = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.getZoneSummary(req.user);
  res.json(result);
});

// @desc    Get Zone-level adjustment table (Shows Woredas)
// @route   GET /api/demands/zone-adjustment-table
export const getZoneAdjustmentTable = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.getZoneAdjustmentTable(req.user);
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

  const demand = await demandService.getDemandById(id as string);
  if (demand === null) {
    res.status(404);
    throw new Error('Demand not found');
  }

  if (demand.status !== DemandStatus.PENDING) {
    res.status(403);
    throw new Error('Cannot edit a demand that is not PENDING');
  }

  const updatedDemand = await demandService.deleteFarmerDemand(id as string, {
    originalQuantity: originalQuantity ? parseFloat(originalQuantity) : undefined,
    fertilizerTypeId: fertilizerTypeId,
  });

  res.json(updatedDemand);
});

// @desc    Get hierarchical demand summary
// @route   GET /api/demands/summary
export const getHierarchicalSummary = asyncHandler(async (req: Request, res: Response) => {
  const { fertilizerTypeId, adminId, userLevel } = req.query;

  console.log(`[DEBUG] Summary Request | URL: ${req.originalUrl} | Query:`, req.query);

  const missingParams = [];
  if (!fertilizerTypeId) missingParams.push('fertilizerTypeId');
  if (!adminId) missingParams.push('adminId');
  if (!userLevel) missingParams.push('userLevel');

  if (missingParams.length > 0) {
    res.status(400);
    throw new Error(`Missing required query parameters: ${missingParams.join(', ')}`);
  }

  // UUID Validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(fertilizerTypeId as string)) {
    res.status(400);
    throw new Error('Invalid fertilizerTypeId format. Must be a valid UUID.');
  }

  if (userLevel !== 'FEDERAL' && !uuidRegex.test(adminId as string)) {
    res.status(400);
    throw new Error('Invalid adminId format. Must be a valid UUID for the selected userLevel.');
  }

  const validLevels = ['FEDERAL', 'REGION', 'ZONE', 'WOREDA', 'KEBELE'];
  if (!validLevels.includes(userLevel as string)) {
    res.status(400);
    throw new Error(`Invalid userLevel '${userLevel}'. Must be one of: ${validLevels.join(', ')}`);
  }

  const result = await demandService.getHierarchicalDemandSummary(
    fertilizerTypeId as string,
    adminId as string,
    userLevel as 'FEDERAL' | 'REGION' | 'ZONE' | 'WOREDA' | 'KEBELE'
  );

  if (!result) {
    // Check if the ID even exists to provide a better error
    const modelMap: Record<string, any> = {
      FEDERAL: prisma.federal,
      REGION: prisma.region,
      ZONE: prisma.zone,
      WOREDA: prisma.woreda,
      KEBELE: prisma.kebele
    };

    const exists = await modelMap[userLevel as string].findUnique({ where: { id: adminId as string } });
    
    if (!exists) {
      res.status(404);
      throw new Error(`Admin unit with ID '${adminId}' for level '${userLevel}' not found in database.`);
    }

    res.status(404);
    throw new Error(`No demand found for fertilizer type '${fertilizerTypeId}' at the specified ${userLevel} hierarchy.`);
  }

  res.json(result);
});

// @desc    Generate comprehensive demand data
// @route   POST /api/demands/generate
export const generateDemands = asyncHandler(async (req: Request, res: Response) => {
  const { fertilizerTypeId } = req.body;

  if (!fertilizerTypeId) {
    res.status(400);
    throw new Error('Missing required field: fertilizerTypeId');
  }

  const result = await demandService.generateDemands(fertilizerTypeId);
  res.status(201).json(result);
});

// @desc    Delete a demand (Only if PENDING)
// @route   DELETE /api/demands/:id
export const deleteDemand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await demandService.deleteFarmerDemand(id as string, {
    originalQuantity: 0,
    fertilizerTypeId: undefined
  });
  res.json({ message: 'Demand deleted successfully' });
});
