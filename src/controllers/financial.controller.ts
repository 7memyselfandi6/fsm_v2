
import type { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as financialService from '../services/financial.service.js';

const handleRequest = (serviceFunction: Function) => asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const { financials, totalCount } = await serviceFunction(page, limit);
  res.json({ 
    data: financials, 
    pagination: { 
      currentPage: page, 
      pageSize: limit, 
      totalPages: Math.ceil(totalCount / limit), 
      totalRecords: totalCount 
    } 
  });
});

export const getKebeleFinancials = handleRequest(financialService.getKebeleFinancials);
export const getWoredaFinancials = handleRequest(financialService.getWoredaFinancials);
export const getZoneFinancials = handleRequest(financialService.getZoneFinancials);
export const getRegionFinancials = handleRequest(financialService.getRegionFinancials);
export const getFederalFinancials = handleRequest(financialService.getFederalFinancials);
