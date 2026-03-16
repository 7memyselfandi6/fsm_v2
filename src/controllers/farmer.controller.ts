import 'multer';
import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as farmerService from '../services/farmer.service.js';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../config/prisma.js';

// Validation Schema
const farmerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  gender: z.enum(['Male', 'Female'], { message: 'Gender must be Male or Female' }),
  phoneNumber: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(1, 'Address is required'),
  farmAreaHectares: z.number().positive('Farm area must be a positive number'),
});

// Helper to generate a human-readable unique ID
const generateFarmerId = () => {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `FARM-${year}-${random}`;
};

// @desc    Register a new farmer
// @route   POST /api/farmers
// @access  Private (Kebele Staff)
export const registerFarmer = asyncHandler(async (req: Request, res: Response) => {
  // 1. Validation using Zod
  const validatedBody = farmerSchema.parse({
    ...req.body,
    farmAreaHectares: parseFloat(req.body.farmAreaHectares),
  });

  // 2. Extract kebeleId from authenticated user's session
  const kebeleId = req.user?.kebeleId;
  if (!kebeleId) {
    res.status(403);
    throw new Error('Not authorized to register farmers in this kebele');
  }

  // 3. Duplicate Prevention (Phone Number)
  const existingFarmer = await prisma.farmer.findUnique({
    where: { phoneNumber: validatedBody.phoneNumber },
  });

  if (existingFarmer) {
    res.status(400);
    throw new Error('A farmer with this phone number already exists');
  }

  // 4. Automatic Business ID Generation
  const uniqueFarmerId = generateFarmerId();

  // 5. File Handling
  const files = req.files as any;
  const photoUrl = files?.['photo']?.[0]?.path ?? null;
  const landCertificateUrl = files?.['landCertificate']?.[0]?.path ?? null;

  // 6. Create Farmer
  const farmer = await farmerService.registerFarmer({
    uniqueFarmerId,
    fullName: validatedBody.fullName,
    gender: validatedBody.gender,
    phoneNumber: validatedBody.phoneNumber,
    address: validatedBody.address,
    farmAreaHectares: validatedBody.farmAreaHectares,
    photoUrl,
    landCertificateUrl,
    kebeleId,
  });

  res.status(201).json(farmer);
});

// @desc    Get farmer ID by phone number (Endpoint to look up generated ID)
// @route   GET /api/farmers/lookup/:phoneNumber
// @access  Private (Staff)
export const getFarmerIdByPhone = asyncHandler(async (req: Request, res: Response) => {
  const { phoneNumber } = req.params;
  
  const farmer = await prisma.farmer.findUnique({
    where: { phoneNumber: phoneNumber as string },
    select: { uniqueFarmerId: true, fullName: true },
  });

  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found with this phone number');
  }

  res.json(farmer);
});

// @desc    Get farmer by unique ID
// @route   GET /api/farmers/:uniqueFarmerId
// @access  Private (Kebele Staff)
export const getFarmerById = asyncHandler(async (req: Request, res: Response) => {
  const { uniqueFarmerId } = req.params;

  // Input Validation
  if (!uniqueFarmerId || typeof uniqueFarmerId !== 'string') {
    res.status(400);
    throw new Error('Valid uniqueFarmerId is required');
  }

  const farmer = await farmerService.getFarmerById(uniqueFarmerId);

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
// @access  Private (SUPER_ADMIN)
export const updateFarmer = asyncHandler(async (req: Request, res: Response) => {
  const farmerId = req.params.id as string;
  if (!farmerId) {
    res.status(400);
    throw new Error('Farmer ID is required');
  }
  const farmer = await farmerService.updateFarmer(farmerId, req.body);
  res.json(farmer);
});

// @desc    Delete farmer record
// @route   DELETE /api/farmers/:id
// @access  Private (SUPER_ADMIN)
export const deleteFarmer = asyncHandler(async (req: Request, res: Response) => {
  const farmerId = req.params.id as string;
  if (!farmerId) {
    res.status(400);
    throw new Error('Farmer ID is required');
  }
  await farmerService.deleteFarmer(farmerId);
  res.status(200).json({ message: 'Farmer record deleted successfully' });
});
