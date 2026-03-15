import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';
import { Role } from '@prisma/client';

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
