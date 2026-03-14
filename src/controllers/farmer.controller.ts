import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as farmerService from '../services/farmer.service.js';

// @desc    Register a new farmer
// @route   POST /api/farmers
// @access  Private (Kebele Staff)
export const registerFarmer = asyncHandler(async (req: Request, res: Response) => {
  const {
    uniqueFarmerId,
    fullName,
    gender,
    phoneNumber,
    address,
    farmAreaHectares,
    kebeleId,
  } = req.body;

  // Cast req.files to any because of multer's complex type with fields
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  
  const photoUrl = files?.['photo']?.[0]?.path ?? null;
  const landCertificateUrl = files?.['landCertificate']?.[0]?.path ?? null;

  if (!uniqueFarmerId || !fullName || !gender || !phoneNumber || !address || !farmAreaHectares || !kebeleId) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const farmer = await farmerService.registerFarmer({
    uniqueFarmerId,
    fullName,
    gender,
    phoneNumber,
    address,
    farmAreaHectares: parseFloat(farmAreaHectares),
    photoUrl,
    landCertificateUrl,
    kebeleId,
  });

  res.status(201).json(farmer);
});

// @desc    Get farmer by unique ID
// @route   GET /api/farmers/:uniqueFarmerId
// @access  Private (Kebele Staff)
export const getFarmerById = asyncHandler(async (req: Request, res: Response) => {
  const farmer = await farmerService.getFarmerById(req.params.uniqueFarmerId as string);

  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }

  res.json(farmer);
});

// @desc    Get all farmers in a kebele
// @route   GET /api/farmers/kebele/:kebeleId
// @access  Private (Kebele Staff)
export const getFarmersByKebele = asyncHandler(async (req: Request, res: Response) => {
  const farmers = await farmerService.getAllFarmersByKebele(req.params.kebeleId as string);
  res.json(farmers);
});

// @desc    Update farmer details
// @route   PUT /api/farmers/:id
// @access  Private (Kebele Staff)
export const updateFarmer = asyncHandler(async (req: Request, res: Response) => {
  const farmerId = req.params.id as string;
  if (!farmerId) {
    res.status(400);
    throw new Error('Farmer ID is required');
  }
  const farmer = await farmerService.updateFarmer(farmerId, req.body);
  res.json(farmer);
});
