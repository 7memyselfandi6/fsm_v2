import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as demandService from '../services/demand.service.js';

// @desc    Get Federal (MoA) dashboard summary
// @route   GET /api/federal/dashboard
export const getFederalDashboard = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getFederalDashboard(seasonName as string);
  if (!result) {
    res.status(404);
    throw new Error('No active season found');
  }
  res.json(result);
});

// @desc    Get Master Data (Unions, Destinations, PCs, LOTs)
// @route   GET /api/federal/master-data
export const getMasterData = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.getMasterData();
  res.json(result);
});

// @desc    Submit federal-level adjustments
// @route   POST /api/federal/adjust
export const postFederalAdjust = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.federalAdjust(req.body, req.user);
  res.json(result);
});

// @desc    Get all farmer request details (MoA level)
// @route   GET /api/federal/farmer-requests
export const getFederalFarmerRequests = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, fertilizerType, regionId, zoneId, woredaId, kebeleId, page, limit, seasonName } = req.query;

  const result = await demandService.getDemandDetailList(
    {
      q: q as string,
      status: status as string,
      fertilizerType: fertilizerType as string,
      regionId: regionId as string,
      zoneId: zoneId as string,
      woredaId: woredaId as string,
      kebeleId: kebeleId as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      seasonName: seasonName as string
    },
    { role: 'MOA_MANAGER' } // Federal level scoping
  );

  res.json(result);
});
