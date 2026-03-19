import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as demandService from '../services/demand.service.js';

// @desc    Get Woreda-level dashboard summary
// @route   GET /api/woreda/dashboard-summary
export const getWoredaSummary = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getWoredaSummary(req.user, seasonName as string);

  res.json(result);
});

// @desc    Get Woreda-level detailed list (Farmer requests)
// @route   GET /api/woreda/detail-list
export const getWoredaDetailList = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, fertilizerType, kebeleId, page, limit, seasonName } = req.query;
  const user = req.user;

  const result = await demandService.getDemandDetailList(
    {
      q: q as string,
      status: status as string,
      fertilizerType: fertilizerType as string,
      kebeleId: kebeleId as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      seasonName: seasonName as string
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
// @route   GET /api/woreda/adjustment-table
export const getWoredaAdjustmentTable = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getWoredaAdjustmentTable(req.user, seasonName as string);
  if (!result) {
    res.status(404);
    throw new Error('No active season found');
  }
  res.json(result);
});

// @desc    Lock/Unlock Woreda or Kebele
// @route   POST /api/woreda/lock
export const woredaLock = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.woredaLock(req.body, req.user);
  res.json(result);
});

// @desc    Submit Woreda-level adjustment
// @route   POST /api/woreda/adjust
export const woredaAdjust = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.woredaAdjust(req.body, req.user);
  res.json(result);
});
