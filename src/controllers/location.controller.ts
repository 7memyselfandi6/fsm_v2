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

// @desc    Get sections by kebeleId
// @route   GET /api/locations/sections/:kebeleId
// @access  Public
export const getSections = asyncHandler(async (req: Request, res: Response) => {
  const kebeleId = req.params.kebeleId as string;
  if (!kebeleId) {
    res.status(400).json({ message: 'kebeleId is required' });
    return;
  }
  const sections = await locationService.getSections(kebeleId);
  res.json(sections);
});

// @desc    Create a new kebele
// @route   POST /api/locations/kebeles
// @access  Private (SUPER_ADMIN)
export const createKebele = asyncHandler(async (req: Request, res: Response) => {
  const { name, woredaId } = req.body;
  const kebele = await locationService.createKebele({ name, woredaId });
  res.status(201).json(kebele);
});

// @desc    Update a kebele
// @route   PUT /api/locations/kebeles/:id
// @access  Private (SUPER_ADMIN)
export const updateKebele = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const kebele = await locationService.updateKebele(id, req.body);
  res.json(kebele);
});

// @desc    Delete a kebele
// @route   DELETE /api/locations/kebeles/:id
// @access  Private (SUPER_ADMIN)
export const deleteKebele = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await locationService.deleteKebele(id);
  res.json({ message: 'Kebele deleted successfully' });
});

// @desc    Create a new section
// @route   POST /api/locations/sections
// @access  Private (SUPER_ADMIN)
export const createSection = asyncHandler(async (req: Request, res: Response) => {
  const { name, kebeleId } = req.body;
  const section = await locationService.createSection({ name, kebeleId });
  res.status(201).json(section);
});

// @desc    Update a section
// @route   PUT /api/locations/sections/:id
// @access  Private (SUPER_ADMIN)
export const updateSection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const section = await locationService.updateSection(id, req.body);
  res.json(section);
});

// @desc    Delete a section
// @route   DELETE /api/locations/sections/:id
// @access  Private (SUPER_ADMIN)
export const deleteSection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await locationService.deleteSection(id);
  res.json({ message: 'Section deleted successfully' });
});
