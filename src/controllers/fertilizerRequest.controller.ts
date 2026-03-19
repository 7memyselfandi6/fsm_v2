import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getKebeleRequests,
  getWoredaRequests,
  getZoneRequests,
  getRegionRequests,
  getFederalRequests,
} from '../services/fertilizerRequest.service.js';

// @desc    Get kebele level fertilizer requests
// @route   GET /api/fertilizer-requests/kebele/:fertilizer_type_id
// @access  Private (add authentication middleware)
export const getKebeleRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const { fertilizer_type_id } = req.params;

  try {
    const kebeles = await getKebeleRequests(fertilizer_type_id);
    res.status(200).json(kebeles);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get woreda level fertilizer requests
// @route   GET /api/fertilizer-requests/woreda/:fertilizer_type_id
// @access  Private (add authentication middleware)
export const getWoredaRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const { fertilizer_type_id } = req.params;

  try {
    const woredas = await getWoredaRequests(fertilizer_type_id);
    res.status(200).json(woredas);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get zone level fertilizer requests
// @route   GET /api/fertilizer-requests/zone/:fertilizer_type_id
// @access  Private (add authentication middleware)
export const getZoneRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const { fertilizer_type_id } = req.params;

  try {
    const zones = await getZoneRequests(fertilizer_type_id);
    res.status(200).json(zones);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get region level fertilizer requests
// @route   GET /api/fertilizer-requests/region/:fertilizer_type_id
// @access  Private (add authentication middleware)
export const getRegionRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const { fertilizer_type_id } = req.params;

  try {
    const regions = await getRegionRequests(fertilizer_type_id);
    res.status(200).json(regions);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get federal level fertilizer requests
// @route   GET /api/fertilizer-requests/federal/:fertilizer_type_id
// @access  Private (add authentication middleware)
export const getFederalRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const { fertilizer_type_id } = req.params;

  try {
    const federal = await getFederalRequests(fertilizer_type_id);
    res.status(200).json(federal);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});