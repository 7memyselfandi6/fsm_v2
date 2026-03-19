import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as demandService from '../services/demand.service.js';

// @desc    Get Zone-level dashboard summary
// @route   GET /api/zone/dashboard-summary
export const getZoneSummary = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getZoneSummary(req.user, seasonName as string);

  res.json(result);
});

// @desc    Get Zone-level detailed list (Farmer level but scoped to Zone)
// @route   GET /api/zone/detail-list
export const getZoneDetailList = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, fertilizerType, woredaId, page, limit, seasonName } = req.query;
  const user = req.user;

  const result = await demandService.getDemandDetailList(
    {
      q: q as string,
      status: status as string,
      fertilizerType: fertilizerType as string,
      woredaId: woredaId as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      seasonName: seasonName as string
    },
    {
      zoneId: user.zoneId,
      regionId: user.regionId,
      role: user.role
    }
  );

  res.json(result);
});

// @desc    Get Zone adjustment table
// @route   GET /api/zone/adjustment-table
export const getZoneAdjustmentTable = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getZoneAdjustmentTable(req.user, seasonName as string);
  if (!result) {
    res.status(404);
    throw new Error('No active season found');
  }
  res.json(result);
});

// @desc    Lock/Unlock Zone or Woreda
// @route   POST /api/zone/lock
export const zoneLock = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.zoneLock(req.body, req.user);
  res.json(result);
});

// @desc    Submit Zone-level adjustment
// @route   POST /api/zone/adjust
export const zoneAdjust = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.zoneAdjust(req.body, req.user);
  res.json(result);
});
