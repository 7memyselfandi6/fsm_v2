import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as hierarchicalService from '../services/hierarchicalDemand.service.js';

const getParams = (req: Request): hierarchicalService.SummaryParams => {
  const { productionSeason, 'requestedAt.from': from, 'requestedAt.to': to } = req.query;
  
  return {
    productionSeason: productionSeason as string | undefined,
    requestedAtFrom: from ? new Date(from as string) : undefined,
    requestedAtTo: to ? new Date(to as string) : undefined
  };
};

// 1. Federal
export const getFederalSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await hierarchicalService.getFederalSummary(getParams(req));
  if (!summary) {
    res.status(404);
    throw new Error('Federal unit does not exist or has no requests for the selected season.');
  }
  res.json(summary);
});

export const getFederalDrillDown = asyncHandler(async (req: Request, res: Response) => {
  const { fertilizerType } = req.params;
  const drillDown = await hierarchicalService.getFederalDrillDown(fertilizerType as string, getParams(req));
  res.json(drillDown);
});

// 2. Region
export const getRegionSummary = asyncHandler(async (req: Request, res: Response) => {
  const { regionId } = req.params;
  const summary = await hierarchicalService.getRegionSummary(regionId as string, getParams(req));
  if (!summary) {
    res.status(404);
    throw new Error('Region unit does not exist or has no requests for the selected season.');
  }
  res.json(summary);
});

export const getRegionDrillDown = asyncHandler(async (req: Request, res: Response) => {
  const { regionId, fertilizerType } = req.params;
  const drillDown = await hierarchicalService.getRegionDrillDown(regionId as string, fertilizerType as string, getParams(req));
  res.json(drillDown);
});

// 3. Zone
export const getZoneSummary = asyncHandler(async (req: Request, res: Response) => {
  const { zoneId } = req.params;
  const summary = await hierarchicalService.getZoneSummary(zoneId as string, getParams(req));
  if (!summary) {
    res.status(404);
    throw new Error('Zone unit does not exist or has no requests for the selected season.');
  }
  res.json(summary);
});

export const getZoneDrillDown = asyncHandler(async (req: Request, res: Response) => {
  const { zoneId, fertilizerType } = req.params;
  const drillDown = await hierarchicalService.getZoneDrillDown(zoneId as string, fertilizerType as string, getParams(req));
  res.json(drillDown);
});

// 4. Woreda
export const getWoredaSummary = asyncHandler(async (req: Request, res: Response) => {
  const { woredaId } = req.params;
  const summary = await hierarchicalService.getWoredaSummary(woredaId as string, getParams(req));
  if (!summary) {
    res.status(404);
    throw new Error('Woreda unit does not exist or has no requests for the selected season.');
  }
  res.json(summary);
});

export const getWoredaDrillDown = asyncHandler(async (req: Request, res: Response) => {
  const { woredaId, fertilizerType } = req.params;
  const drillDown = await hierarchicalService.getWoredaDrillDown(woredaId as string, fertilizerType as string, getParams(req));
  res.json(drillDown);
});

// 5. Kebele
export const getKebeleSummary = asyncHandler(async (req: Request, res: Response) => {
  const { kebeleId } = req.params;
  const summary = await hierarchicalService.getKebeleSummary(kebeleId as string, getParams(req));
  if (!summary) {
    res.status(404);
    throw new Error('Kebele unit does not exist or has no requests for the selected season.');
  }
  res.json(summary);
});

export const getKebeleDrillDown = asyncHandler(async (req: Request, res: Response) => {
  const { kebeleId, fertilizerType } = req.params;
  const drillDown = await hierarchicalService.getKebeleDrillDown(kebeleId as string, fertilizerType as string, getParams(req));
  res.json(drillDown);
});
