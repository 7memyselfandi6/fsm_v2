import { type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as supplyService from '../services/supply.service.js';
import { SaleStatus, PaymentMethod } from '@prisma/client';

// @desc    Get all shipping lots
// @route   GET /api/supply/lots
export const getShippingLots = asyncHandler(async (req: Request, res: Response) => {
  const lots = await supplyService.getShippingLots();
  res.json(lots);
});

// @desc    Get unions
// @route   GET /api/supply/unions
export const getUnions = asyncHandler(async (req: Request, res: Response) => {
  const unions = await supplyService.getUnions();
  res.json(unions);
});

// @desc    Get destinations
// @route   GET /api/supply/destinations
export const getDestinations = asyncHandler(async (req: Request, res: Response) => {
  const destinations = await supplyService.getDestinations();
  res.json(destinations);
});

// @desc    Get PCs
// @route   GET /api/supply/pcs
export const getPCs = asyncHandler(async (req: Request, res: Response) => {
  const pcs = await supplyService.getPCs();
  res.json(pcs);
});

// @desc    Get PC inventory
// @route   GET /api/supply/inventory/:pcId
export const getPCInventory = asyncHandler(async (req: Request, res: Response) => {
  const inventory = await supplyService.getPCInventory(req.params.pcId as string);
  res.json(inventory);
});

// @desc    Initiate farmer sale (Accountant)
// @route   POST /api/supply/sales/initiate
export const initiateSale = asyncHandler(async (req: Request, res: Response) => {
  const { farmerId, pcId, fertilizerTypeId, quantity, totalPrice, paymentMethod } = req.body;
  const accountantId = req.user.id;

  const sale = await supplyService.initiateSale({
    farmerId,
    pcId,
    fertilizerTypeId,
    quantity: parseFloat(quantity),
    totalPrice: parseFloat(totalPrice),
    paymentMethod: paymentMethod as PaymentMethod,
    accountantId,
  });

  res.status(201).json(sale);
});

// @desc    Deliver physical fertilizer (Storeman)
// @route   PUT /api/supply/sales/:id/deliver
export const deliverSale = asyncHandler(async (req: Request, res: Response) => {
  const storemanId = req.user.id;
  const sale = await supplyService.deliverSale(req.params.id as string, storemanId);
  res.json(sale);
});

// @desc    Get sales by PC
// @route   GET /api/supply/sales/pc/:pcId
export const getSalesByPC = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;
  const sales = await supplyService.getSalesByPC(req.params.pcId as string, status as SaleStatus | undefined);
  res.json(sales);
});
