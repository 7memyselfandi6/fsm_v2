import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';
import { Role } from '@prisma/client';
import { z } from 'zod';

const updateUserSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  regionId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  woredaId: z.string().uuid().optional(),
  kebeleId: z.string().uuid().optional(),
  unionId: z.string().uuid().optional(),
  pcId: z.string().uuid().optional(),
});

// @desc    Get users with role-based scoping and search
// @route   GET /api/users
// @access  Private
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, unionId, pcId, search, page = '1', limit = '20' } = req.query;
  const user = req.user;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const take = parseInt(limit as string);

  const where: any = {};

  // 1. Role-based Automatic Scoping
  if (user.role !== Role.SUPER_ADMIN) {
    if (user.role === Role.REGION_MANAGER || user.role === Role.REGION_EXPERT) {
      where.regionId = user.regionId;
    } else if (user.role === Role.WOREDA_MANAGER || user.role === Role.WOREDA_EXPERT) {
      where.woredaId = user.woredaId;
    } else if (user.role === Role.KEBELE_MANAGER || user.role === Role.KEBELE_DA) {
      where.kebeleId = user.kebeleId;
    } else if (user.role === Role.ZONE_MANAGER || user.role === Role.ZONE_EXPERT) {
      where.zoneId = user.zoneId;
    }
  }

  // 2. Global Search
  if (search) {
    where.OR = [
      { fullName: { contains: search as string, mode: 'insensitive' } },
      { username: { contains: search as string, mode: 'insensitive' } },
      { phoneNumber: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  // 3. Advanced Filtering
  if (role) where.role = role as Role;
  if (unionId) where.unionId = unionId as string;
  if (pcId) where.pcId = pcId as string;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        phoneNumber: true,
        role: true,
        profilePictureUrl: true,
        regionId: true,
        zoneId: true,
        woredaId: true,
        kebeleId: true,
        unionId: true,
        pcId: true,
        createdAt: true,
      }
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users,
    meta: {
      total,
      page: parseInt(page as string),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  });
});

// @desc    Update user information
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUser = req.user;
  const validatedData = updateUserSchema.parse(req.body);

  // Authorization checks
  const isSuperAdmin = currentUser.role === Role.SUPER_ADMIN;
  const isSelf = currentUser.id === id;

  if (!isSuperAdmin && !isSelf) {
    res.status(403);
    throw new Error('Not authorized to update this user');
  }

  // Users cannot modify their own role
  if (isSelf && !isSuperAdmin && validatedData.role) {
    res.status(400);
    throw new Error('Users cannot modify their own role');
  }

  const user = await prisma.user.update({
    where: { id: id as string },
    data: validatedData,
    select: {
      id: true,
      fullName: true,
      username: true,
      email: true,
      phoneNumber: true,
      role: true,
      regionId: true,
      zoneId: true,
      woredaId: true,
      kebeleId: true,
      unionId: true,
      pcId: true,
    },
  });

  res.json(user);
});
