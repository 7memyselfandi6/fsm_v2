import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as requirementService from '../services/requirement.service.js';
import { z } from 'zod';

// Zod schema for validation
const requirementSchema = z.object({
  uniqueFarmerId: z.string().min(1, 'uniqueFarmerId is required'),
  cropTypeIds: z.array(z.string().uuid('Invalid cropTypeId format')),
  seasons: z.array(z.object({
    seasonName: z.string().min(1),
    month: z.string().min(1)
  })).min(1, 'At least one season is required'),
  fertilizers: z.array(z.object({
    fertilizerTypeId: z.string().uuid('Invalid fertilizerTypeId format'),
    quantity: z.number().int().positive('Quantity must be greater than 0')
  })).min(1, 'At least one fertilizer is required')
});

// @desc    Create farmer requirement
// @route   POST /api/requirements
// @access  Private (Farmer Write)
export const createRequirement = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validation
  const validation = requirementSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400);
    throw new Error(validation.error.issues.map(e => e.message).join(', '));
  }

  // 2. Service Call
  try {
    const result = await requirementService.createRequirement(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.status === 409) {
      res.status(409);
    } else if (error.status === 400) {
      res.status(400);
    } else {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Get all farmer requirements
// @route   GET /api/requirements
// @access  Private (Farmer Write)
export const getRequirements = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 50;

  const { items, totalCount } = await requirementService.getRequirements(page, size);

  res.setHeader('X-Total-Count', totalCount.toString());
  res.json(items);
});

// @desc    Get farmer requirement by ID
// @route   GET /api/requirements/:uniqueFarmerId
// @access  Private (Farmer Write)
export const getRequirementById = asyncHandler(async (req: Request, res: Response) => {
  const { uniqueFarmerId } = req.params;
  const result = await requirementService.getRequirementById(uniqueFarmerId as string);

  if (!result) {
    res.status(404);
    throw new Error('Farmer requirement not found');
  }

  res.json(result);
});

// @desc    Update farmer requirement
// @route   PUT /api/requirements/:uniqueFarmerId
// @access  Private (Farmer Write)
export const updateRequirement = asyncHandler(async (req: Request, res: Response) => {
  const { uniqueFarmerId } = req.params;

  // 1. Validation
  const validation = requirementSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400);
    throw new Error(validation.error.issues.map(e => e.message).join(', '));
  }

  if (req.body.uniqueFarmerId !== uniqueFarmerId) {
    res.status(400);
    throw new Error('uniqueFarmerId in body does not match path parameter');
  }

  // 2. Service Call
  try {
    const result = await requirementService.updateRequirement(uniqueFarmerId as string, req.body);
    res.json(result);
  } catch (error: any) {
    if (error.status === 404) {
      res.status(404);
    } else if (error.status === 409 || error.status === 400) {
      res.status(error.status);
    } else {
      res.status(500);
    }
    throw error;
  }
});

// @desc    Delete farmer requirement
// @route   DELETE /api/requirements/:uniqueFarmerId
// @access  Private (Farmer Write)
export const deleteRequirement = asyncHandler(async (req: Request, res: Response) => {
  const { uniqueFarmerId } = req.params;
  const success = await requirementService.deleteRequirement(uniqueFarmerId as string);

  if (!success) {
    res.status(404);
    throw new Error('Farmer requirement not found');
  }

  res.status(204).send();
});
