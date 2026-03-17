import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as warehouseService from '../services/warehouse.service.js';

// @desc    Get all warehouses
// @route   GET /api/warehouses
export const getWarehouses = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page, 
    limit, 
    q, 
    regionId, 
    zoneId, 
    woredaId, 
    year, 
    minCapacity, 
    maxCapacity 
  } = req.query;

  const result = await warehouseService.getWarehouses({
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 10,
    q: q as string,
    regionId: regionId as string,
    zoneId: zoneId as string,
    woredaId: woredaId as string,
    year: year as string,
    minCapacity: minCapacity as string,
    maxCapacity: maxCapacity as string
  });

  res.json(result);
});

// @desc    Get warehouse by ID
// @route   GET /api/warehouses/:id
export const getWarehouseById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const warehouse = await warehouseService.getWarehouseById(id);
  if (!warehouse) {
    res.status(404);
    throw new Error('Warehouse not found');
  }
  res.json(warehouse);
});

// @desc    Create warehouse
// @route   POST /api/warehouses
export const createWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const warehouse = await warehouseService.createWarehouse(req.body);
  res.status(201).json(warehouse);
});

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
export const updateWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const warehouse = await warehouseService.updateWarehouse(id, req.body);
  res.json(warehouse);
});

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
export const deleteWarehouse = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await warehouseService.deleteWarehouse(id);
  res.json({ message: 'Warehouse deleted successfully' });
});
