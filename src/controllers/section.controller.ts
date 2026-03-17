import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as locationService from '../services/location.service.js';

// @desc    Get all sections
// @route   GET /api/section
export const getSections = asyncHandler(async (req: Request, res: Response) => {
  const { kebeleId } = req.query;
  if (!kebeleId) {
    res.status(400);
    throw new Error('kebeleId is required');
  }
  const sections = await locationService.getSections(kebeleId as string);
  res.json(sections);
});

// @desc    Get single section
// @route   GET /api/section/:id
export const getSectionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const section = await locationService.getSectionById(id as string);
  if (!section) {
    res.status(404);
    throw new Error('Section not found');
  }
  res.json(section);
});

// @desc    Create section
// @route   POST /api/section
export const createSection = asyncHandler(async (req: Request, res: Response) => {
  const section = await locationService.createSection(req.body);
  res.status(201).json(section);
});

// @desc    Update section
// @route   PUT /api/section/:id
export const updateSection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const section = await locationService.updateSection(id as string, req.body);
  res.json(section);
});

// @desc    Delete section
// @route   DELETE /api/section/:id
export const deleteSection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await locationService.deleteSection(id as string);
  res.json({ message: 'Section deleted successfully' });
});
