import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as subsidyService from '../services/subsidy.service.js';

// @desc    Get all subsidy reports
// @route   GET /api/subsidy/reports
export const getSubsidyReports = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, year, regionId, fertilizerTypeId } = req.query;

  const result = await subsidyService.getSubsidyReports({
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10,
    year: year as string,
    regionId: regionId as string,
    fertilizerTypeId: fertilizerTypeId as string
  });

  res.json(result);
});

// @desc    Create subsidy record
// @route   POST /api/subsidy/records
export const createSubsidyRecord = asyncHandler(async (req: Request, res: Response) => {
  const subsidy = await subsidyService.createSubsidyRecord(req.body);
  res.status(201).json(subsidy);
});

// @desc    Get crop fertilizer rates
// @route   GET /api/subsidy/crop-rates
export const getCropFertilizerRates = asyncHandler(async (req: Request, res: Response) => {
  const rates = await subsidyService.getCropFertilizerRates();
  res.json(rates);
});

// @desc    Update crop fertilizer rate
// @route   PUT /api/subsidy/crop-rates/:id
export const updateCropFertilizerRate = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const rate = await subsidyService.updateCropFertilizerRate(id, req.body);
  res.json(rate);
});

// @desc    Toggle rate lock
// @route   PATCH /api/subsidy/crop-rates/:id/lock
export const toggleRateLock = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);
  const { isLocked } = req.body;
  const rate = await subsidyService.toggleRateLock(id, isLocked);
  res.json(rate);
});
