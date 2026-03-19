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
git
  const levelMap: Record<string, LockingLevel> = {
    federal: LockingLevel.MOA,
    region: LockingLevel.REGION,
    zone: LockingLevel.ZONE,
    woreda: LockingLevel.WOREDA,
    kebele: LockingLevel.KEBELE
  };

  const levelStr = level as string;
  const lockingLevel = levelMap[levelStr.toLowerCase()];
  if (!lockingLevel) {
    res.status(400);
    throw new Error('Invalid administrative level');
  }

  const result = await adjustmentService.adjustDemand(
    lockingLevel,
    parentId as string,
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

  const levelMap: Record<string, LockingLevel> = {
    federal: LockingLevel.MOA,
    region: LockingLevel.REGION,
    zone: LockingLevel.ZONE,
    woreda: LockingLevel.WOREDA,
    kebele: LockingLevel.KEBELE
  };

  const levelStr = level as string;
  const lockingLevel = levelMap[levelStr.toLowerCase()];
  
  const result = await adjustmentService.adjustDemand(
    lockingLevel,
    id as string, 
    totalAmount,
    distributions,
    req.user.id,
    reason
  );

  res.json({ success: true, data: result });
});

/**
 * @desc    Enhanced dashboard summary with pagination, filter, search
 * @route   GET /api/:level/dashboard-summary
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

/**
 * @desc    Get adjustment history with pagination/filtering
 * @route   GET /api/:level/adjust
 */
export const getAdjustmentHistory = asyncHandler(async (req: Request, res: Response) => {
  const { level } = req.params;
  const params = parseQueryParams(req.query);
  
  // Add level filter automatically
  const levelMap: Record<string, LockingLevel> = {
    federal: LockingLevel.MOA,
    region: LockingLevel.REGION,
    zone: LockingLevel.ZONE,
    woreda: LockingLevel.WOREDA,
    kebele: LockingLevel.KEBELE
  };
  
  const levelStr = level as string;
  if (levelStr && levelMap[levelStr.toLowerCase()]) {
    params.filters.level = levelMap[levelStr.toLowerCase()];
  }

  const prismaQuery = buildPrismaQuery(params, ['reason', 'entityType']);
  
  const [records, totalCount] = await Promise.all([
    prisma.adjustmentHistory.findMany({
      ...prismaQuery,
      include: {
        user: {
          select: { fullName: true, username: true }
        }
      }
    }),
    prisma.adjustmentHistory.count({ where: prismaQuery.where })
  ]);

  res.json({
    success: true,
    data: records,
    metadata: getPaginationMetadata(totalCount, params.page, params.limit)
  });
});
