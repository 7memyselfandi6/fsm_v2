import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as locationService from '../services/location.service.js';

// @desc    Get all regions
// @route   GET /api/locations/regions
// @access  Public
export const getRegions = asyncHandler(async (req: Request, res: Response) => {
  const regions = await locationService.getRegions();
  res.json(regions);
});

// @desc    Get zones by regionId
// @route   GET /api/locations/zones/:regionId
// @access  Public
export const getZones = asyncHandler(async (req: Request, res: Response) => {
  const regionId = req.params.regionId as string;
  if (!regionId) {
    res.status(400).json({ message: 'regionId is required' });
    return;
  }
  const zones = await locationService.getZones(regionId);
  res.json(zones);
});

// @desc    Get woredas by zoneId
// @route   GET /api/locations/woredas/:zoneId
// @access  Public
export const getWoredas = asyncHandler(async (req: Request, res: Response) => {
  const zoneId = req.params.zoneId as string;
  if (!zoneId) {
    res.status(400).json({ message: 'zoneId is required' });
    return;
  }
  const woredas = await locationService.getWoredas(zoneId);
  res.json(woredas);
});

// @desc    Get kebeles by woredaId
// @route   GET /api/locations/kebeles/:woredaId
// @access  Public
export const getKebeles = asyncHandler(async (req: Request, res: Response) => {
  const woredaId = req.params.woredaId as string;
  if (!woredaId) {
    res.status(400).json({ message: 'woredaId is required' });
    return;
  }
  const kebeles = await locationService.getKebeles(woredaId);
  res.json(kebeles);
});
