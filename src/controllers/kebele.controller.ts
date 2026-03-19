import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as demandService from '../services/demand.service.js';
import * as locationService from '../services/location.service.js';

// @desc    Get Kebele-level dashboard summary
// @route   GET /api/kebele/dashboard-summary
export const getKebeleSummary = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getKebeleSummary(req.user, seasonName as string);

  res.json(result);
});

// @desc    Get Kebele-level detailed list (Farmer requests)
// @route   GET /api/kebele/detail-list
export const getKebeleDetailList = asyncHandler(async (req: Request, res: Response) => {
  const { q, status, fertilizerType, page, limit, seasonName } = req.query;
  const user = req.user;

  const result = await demandService.getDemandDetailList(
    {
      q: q as string,
      status: status as string,
      fertilizerType: fertilizerType as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      seasonName: seasonName as string
    },
    {
      kebeleId: user.kebeleId,
      regionId: user.regionId,
      role: user.role
    }
  );

  res.json(result);
});

// @desc    Get Kebele adjustment table
// @route   GET /api/kebele/adjustment-table
export const getKebeleAdjustmentTable = asyncHandler(async (req: Request, res: Response) => {
  const { seasonName } = req.query;
  const result = await demandService.getKebeleAdjustmentTable(req.user, seasonName as string);
  if (!result) {
    res.status(404);
    throw new Error('No active season found');
  }
  res.json(result);
});

// @desc    Lock/Unlock Kebele
// @route   POST /api/kebele/lock
export const kebeleLock = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.kebeleLock(req.body, req.user);
  res.json(result);
});

// @desc    Submit Kebele-level adjustment
// @route   POST /api/kebele/adjust
export const kebeleAdjust = asyncHandler(async (req: Request, res: Response) => {
  const result = await demandService.kebeleAdjust(req.body, req.user);
  res.json(result);
});

/** --- CRUD FOR KEBELE ENTITY --- **/

// @desc    Get all kebeles (Admin only or scoped)
// @route   GET /api/kebele
export const getKebeles = asyncHandler(async (req: Request, res: Response) => {
  const { woredaId } = req.query;
  const kebeles = await locationService.getKebeles(woredaId as string);
  res.json(kebeles);
});

// @desc    Get single kebele
// @route   GET /api/kebele/:id
export const getKebeleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const kebele = await locationService.getKebeleById(Array.isArray(id) ? id[0] : id);
  if (!kebele) {
    res.status(404);
    throw new Error('Kebele not found');
  }
  res.json(kebele);
});

// @desc    Create kebele
// @route   POST /api/kebele
export const createKebele = asyncHandler(async (req: Request, res: Response) => {
  const kebele = await locationService.createKebele(req.body);
  res.status(201).json(kebele);
});

// @desc    Update kebele
// @route   PUT /api/kebele/:id
export const updateKebele = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const kebele = await locationService.updateKebele(Array.isArray(id) ? id[0] : id, req.body);
  res.json(kebele);
});

// @desc    Delete kebele
// @route   DELETE /api/kebele/:id
export const deleteKebele = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await locationService.deleteKebele(Array.isArray(id) ? id[0] : id);
  res.json({ message: 'Kebele deleted successfully' });
});
