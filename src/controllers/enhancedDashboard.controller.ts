import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as adjustmentService from '../services/adjustment.service.js';
import { parseQueryParams, buildPrismaQuery, getPaginationMetadata } from '../utils/queryHelper.js';
import prisma from '../config/prisma.js';
import { LockingLevel } from '@prisma/client';

/**
 * @desc    Submit total adjusted fertilizers for a level
 * @route   POST /api/:level/total-adjusted-fertilizers
 */
export const postTotalAdjusted = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.params;
  const { parentId, totalAmount, distributions, reason } = req.body;

  if (!parentId || totalAmount === undefined || !distributions) {
    res.status(422);
    throw new Error('parentId, totalAmount, and distributions are required');
  }

  // Map string level to LockingLevel enum
  const levelMap: Record<string, LockingLevel> = {
    federal: LockingLevel.MOA,
    region: LockingLevel.REGION,
    zone: LockingLevel.ZONE,
    woreda: LockingLevel.WOREDA,
    kebele: LockingLevel.KEBELE
  };

  const lockingLevel = levelMap[level.toLowerCase()];
  if (!lockingLevel) {
    res.status(400);
    throw new Error('Invalid administrative level');
  }

  const result = await adjustmentService.adjustDemand(
    lockingLevel,
    parentId,
    totalAmount,
    distributions,
    req.user.id,
    reason
  );

  res.status(201).json({ success: true, data: result });
});

/**
 * @desc    Edit existing adjustment
 * @route   PUT /api/:level/adjust/:id
 */
export const editAdjustment = asyncHandler(async (req: Request, res: Response) => {
  const { level, id } = req.params;
  const { totalAmount, distributions, reason } = req.body;

  // Hierarchical locking check is performed inside the service
  const levelMap: Record<string, LockingLevel> = {
    federal: LockingLevel.MOA,
    region: LockingLevel.REGION,
    zone: LockingLevel.ZONE,
    woreda: LockingLevel.WOREDA,
    kebele: LockingLevel.KEBELE
  };

  const lockingLevel = levelMap[level.toLowerCase()];
  
  const result = await adjustmentService.adjustDemand(
    lockingLevel,
    id, // parentId is the entity being adjusted
    totalAmount,
    distributions,
    req.user.id,
    reason
  );

  res.json({ success: true, data: result });
});

/**
 * @desc    Enhanced dashboard summary with pagination, filter, search
 * @route   GET /api/:level/dashboard-enhanced
 */
export const getEnhancedDashboard = (modelName: string, searchFields: string[] = []) => 
  asyncHandler(async (req: Request, res: Response) => {
    const params = parseQueryParams(req.query);
    const prismaQuery = buildPrismaQuery(params, searchFields);
    
    const model = (prisma as any)[modelName];
    if (!model) throw new Error(`Model ${modelName} not found`);

    const [records, totalCount] = await Promise.all([
      model.findMany({
        ...prismaQuery,
        // Include common relations for dashboards
        include: {
          _count: true
        }
      }),
      model.count({ where: prismaQuery.where })
    ]);

    res.json({
      success: true,
      data: records,
      metadata: getPaginationMetadata(totalCount, params.page, params.limit)
    });
});
