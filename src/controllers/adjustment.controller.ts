import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as adjustmentService from '../services/adjustment.service.js';
import { LockingLevel } from '@prisma/client';

const handleAdjustment = (level: LockingLevel) => asyncHandler(async (req: Request, res: Response) => {
  const { parentId, totalAmount, distributions, reason } = req.body;
  if (!parentId || typeof totalAmount !== 'number' || !Array.isArray(distributions)) {
    throw new Error('parentId, totalAmount, and distributions are required.');
  }

  const result = await adjustmentService.adjustDemand(
    level,
    parentId,
    totalAmount,
    distributions,
    req.user.id,
    reason
  );
  res.json({ success: true, data: result });
});

export const adjustFederal = handleAdjustment(LockingLevel.MOA);
export const adjustRegion = handleAdjustment(LockingLevel.REGION);
export const adjustZone = handleAdjustment(LockingLevel.ZONE);
export const adjustWoreda = handleAdjustment(LockingLevel.WOREDA);

export const toggleGlobalLock = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') throw new Error('isActive boolean is required.');

  const result = await adjustmentService.setGlobalLock(isActive, req.user.id);
  res.json({ success: true, data: result });
});

const handleGetStatus = (level: LockingLevel) => asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.query;
  const result = await adjustmentService.getAdjustmentStatus(level, id as string);
  res.json({ success: true, data: result });
});

export const getFederalAdjustment = handleGetStatus(LockingLevel.MOA);
export const getRegionAdjustment = handleGetStatus(LockingLevel.REGION);
export const getZoneAdjustment = handleGetStatus(LockingLevel.ZONE);
export const getWoredaAdjustment = handleGetStatus(LockingLevel.WOREDA);
export const getKebeleAdjustment = handleGetStatus(LockingLevel.KEBELE);
