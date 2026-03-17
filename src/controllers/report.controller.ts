import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as reportService from '../services/report.service.js';

// @desc    Regional fertilizer allocation report
// @route   GET /api/reports/regional-allocation
export const getRegionalAllocationReport = asyncHandler(async (req: Request, res: Response) => {
  const { seasonId } = req.query;
  const result = await reportService.getRegionalAllocationReport(seasonId as string);
  res.json(result);
});

// @desc    Union-level fertilizer stock report
// @route   GET /api/reports/union-stock
export const getUnionStockReport = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getUnionStockReport();
  res.json(result);
});

// @desc    Sold fertilizer tracking report
// @route   GET /api/reports/sold-fertilizer
export const getSoldFertilizerReport = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getSoldFertilizerReport();
  res.json(result);
});

// @desc    Revenue calculation report
// @route   GET /api/reports/revenue
export const getRevenueReport = asyncHandler(async (req: Request, res: Response) => {
  const result = await reportService.getSoldFertilizerReport();
  res.json({ revenue: result.summary.revenue, totalSales: result.summary.totalSales });
});

// @desc    Export sales report to Google Sheets
// @route   POST /api/reports/export/google-sheets
export const exportToGoogleSheets = asyncHandler(async (req: Request, res: Response) => {
  const { reportType } = req.body;
  const result = await reportService.exportToGoogleSheets(reportType);
  res.json(result);
});
