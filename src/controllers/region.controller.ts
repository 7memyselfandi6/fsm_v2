import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as demandService from '../services/demand.service.js';

// @desc    Get Region-level dashboard summary
// @route   GET /api/region/dashboard-summary
export const getRegionSummary = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getRegionSummary(req.user, seasonName as string);

  res.json(result);
});

// @desc    Get Region-level detailed list
// @route   GET /api/region/detail-list
export const getRegionDetailList = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, fertilizerType, zoneId, page, limit, seasonName } = req.query;
  const user = req.user;

  const result = await demandService.getDemandDetailList(
    {
      q: q as string,
      status: status as string,
      fertilizerType: fertilizerType as string,
      zoneId: zoneId as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      seasonName: seasonName as string
    },
    {
      regionId: user.regionId,
      role: user.role
    }
  );

  res.json(result);
});

// @desc    Get Region adjustment table
// @route   GET /api/region/adjustment-table
export const getRegionAdjustmentTable = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getRegionAdjustmentTable(req.user, seasonName as string);
  if (!result) {
    res.status(404);
    throw new Error('No active season found');
  }
  res.json(result);
});

// @desc    Lock/Unlock Region or Zone
// @route   POST /api/region/lock
export const regionLock = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.regionLock(req.body, req.user);
  res.json(result);
});

// @desc    Submit Region-level adjustment
// @route   POST /api/region/adjust
export const regionAdjust = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.regionAdjust(req.body, req.user);
  res.json(result);
});
