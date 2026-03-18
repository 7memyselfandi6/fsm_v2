import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as lockService from '../services/lock.service.js';
import { LockingLevel } from '@prisma/client';

const handleLock = (level: LockingLevel) => asyncHandler(async (req: Request, res: Response) => {
  const { id, lockStatus } = req.body;
  if (!id) throw new Error('ID is required');
  if (typeof lockStatus !== 'boolean') throw new Error('lockStatus boolean is required');

  const result = await lockService.lockEntity(level, id, lockStatus, req.user.id);
  res.json({ success: true, data: result });
});

const handleBulkLock = (level: LockingLevel) => asyncHandler(async (req: Request, res: Response) => {
  const { lockStatus } = req.body;
  if (typeof lockStatus !== 'boolean') throw new Error('lockStatus boolean is required');

  const result = await lockService.bulkLockEntities(level, lockStatus, req.user.id);
  res.json({ success: true, data: result });
});

const handleGetStatus = (level: LockingLevel) => asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.query;
  const result = await lockService.getLockStatus(level, id as string);
  res.json({ success: true, data: result });
});

export const lockKebele = handleLock(LockingLevel.KEBELE);
export const bulkLockKebele = handleBulkLock(LockingLevel.KEBELE);
export const getKebeleLockStatus = handleGetStatus(LockingLevel.KEBELE);

export const lockWoreda = handleLock(LockingLevel.WOREDA);
export const bulkLockWoreda = handleBulkLock(LockingLevel.WOREDA);
export const getWoredaLockStatus = handleGetStatus(LockingLevel.WOREDA);

export const lockZone = handleLock(LockingLevel.ZONE);
export const bulkLockZone = handleBulkLock(LockingLevel.ZONE);
export const getZoneLockStatus = handleGetStatus(LockingLevel.ZONE);

export const lockRegion = handleLock(LockingLevel.REGION);
export const bulkLockRegion = handleBulkLock(LockingLevel.REGION);
export const getRegionLockStatus = handleGetStatus(LockingLevel.REGION);

export const lockMoa = handleLock(LockingLevel.MOA);
export const bulkLockMoa = handleBulkLock(LockingLevel.MOA);
export const getMoaLockStatus = handleGetStatus(LockingLevel.MOA);
