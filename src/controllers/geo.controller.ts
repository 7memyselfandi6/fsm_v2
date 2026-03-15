import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import prisma from '../config/prisma.js';
import { Role } from '@prisma/client';

// @desc    Get all regions (Super Admin only)
// @route   GET /api/geo/regions
// @access  Private (SUPER_ADMIN)
export const getRegions = asyncHandler(async (req: Request, res: Response) => {
  const regions = await prisma.region.findMany({
    select: {
      id: true,
      name: true,
      regionalFlag: {
        select: {
          imageUrl: true,
        }
      },
      _count: {
        select: { zones: true }
      }
    }
  });
  res.json(regions);
});

// @desc    Get zones based on role and regionId
// @route   GET /api/geo/zones
// @access  Private
export const getZones = asyncHandler(async (req: Request, res: Response) => {
  const { regionId, search } = req.query;
  const user = req.user;

  const where: any = {};

  if (user.role === Role.REGION_MANAGER || user.role === Role.REGION_EXPERT) {
    where.regionId = user.regionId;
  } else if (regionId) {
    where.regionId = regionId as string;
  }

  if (search) {
    where.name = { contains: search as string, mode: 'insensitive' };
  }

  const zones = await prisma.zone.findMany({
    where,
    select: {
      id: true,
      name: true,
      regionId: true,
      _count: {
        select: { woredas: true }
      }
    }
  });
  res.json(zones);
});

// @desc    Get woredas based on role and zoneId
// @route   GET /api/geo/woredas
// @access  Private
export const getWoredas = asyncHandler(async (req: Request, res: Response) => {
  const { zoneId, search } = req.query;
  const user = req.user;

  const where: any = {};

  if (user.role === Role.ZONE_MANAGER || user.role === Role.ZONE_EXPERT) {
    where.zoneId = user.zoneId;
  } else if (zoneId) {
    where.zoneId = zoneId as string;
  }

  if (search) {
    where.name = { contains: search as string, mode: 'insensitive' };
  }

  const woredas = await prisma.woreda.findMany({
    where,
    select: {
      id: true,
      name: true,
      zoneId: true,
      _count: {
        select: { kebeles: true }
      }
    }
  });
  res.json(woredas);
});

// @desc    Get kebeles based on role and woredaId
// @route   GET /api/geo/kebeles
// @access  Private
export const getKebeles = asyncHandler(async (req: Request, res: Response) => {
  const { woredaId, search } = req.query;
  const user = req.user;

  const where: any = {};

  if (user.role === Role.WOREDA_MANAGER || user.role === Role.WOREDA_EXPERT) {
    where.woredaId = user.woredaId;
  } else if (woredaId) {
    where.woredaId = woredaId as string;
  }

  if (search) {
    where.name = { contains: search as string, mode: 'insensitive' };
  }

  const kebeles = await prisma.kebele.findMany({
    where,
    select: {
      id: true,
      name: true,
      woredaId: true,
      _count: {
        select: { pcs: true, farmers: true }
      }
    }
  });
  res.json(kebeles);
});
