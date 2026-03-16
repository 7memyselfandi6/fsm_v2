// import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// import { Request, Response } from 'express';

// // Mock must be defined before the controller import in ESM if possible, 
// // but ESM hoisting is different. We'll use a dynamic import or just accept the template.
// const mockGetSeasonByName = jest.fn();
// const mockCreateFarmerDemand = jest.fn();

// jest.mock('../services/demand.service.js', () => ({
//   __esModule: true,
//   getSeasonByName: (name: string) => mockGetSeasonByName(name),
//   createFarmerDemand: (data: any) => mockCreateFarmerDemand(data),
//   getSeasons: jest.fn(),
//   getCropCategories: jest.fn(),
//   getFertilizerTypes: jest.fn(),
// }));

// import { submitFarmerDemand } from '../controllers/demand.controller.js';
// import { DemandStatus } from '@prisma/client';

// describe('Demand Controller - submitFarmerDemand', () => {
//   let mockRequest: Partial<Request>;
//   let mockResponse: Partial<Response>;
//   let nextFunction: any;

//   beforeEach(() => {
//     mockRequest = {
//       body: {},
//       user: {
//         id: 'user-123',
//         farmerId: 'farmer-456',
//         role: 'FARMER',
//       },
//     } as any;
//     mockResponse = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//     } as any;
//     nextFunction = jest.fn();
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should successfully submit demand with auto-populated farmerId and seasonId', async () => {
//     const mockSeason = { id: 'season-789', name: 'Mehir' };
//     const mockDemand = { id: 'demand-1', requestId: 'REQ-2026-ABC', status: DemandStatus.PENDING };

//     mockRequest.body = {
//       seasonName: 'Mehir',
//       cropTypeId: 'crop-111',
//       fertilizerTypeId: 'fert-222',
//       originalQuantity: '10.5',
//     };

//     (mockGetSeasonByName as jest.Mock).mockResolvedValue(mockSeason);
//     mockCreateFarmerDemand.mockResolvedValue(mockDemand);

//     await submitFarmerDemand(mockRequest as Request, mockResponse as Response, nextFunction);

//     expect(mockGetSeasonByName).toHaveBeenCalledWith('Mehir');
//     expect(mockCreateFarmerDemand).toHaveBeenCalledWith(expect.objectContaining({
//       farmerId: 'farmer-456',
//       seasonId: 'season-789',
//       cropTypeId: 'crop-111',
//       fertilizerTypeId: 'fert-222',
//       originalQuantity: 10.5,
//     }));
//     expect(mockResponse.status).toHaveBeenCalledWith(201);
//     expect(mockResponse.json).toHaveBeenCalledWith(mockDemand);
//   });

//   it('should return 401 if user is not linked to a farmer profile', async () => {
//     mockRequest.user = { id: 'user-123', role: 'FARMER' } as any; // Missing farmerId

//     mockRequest.body = {
//       seasonName: 'Mehir',
//       cropTypeId: 'crop-111',
//       fertilizerTypeId: 'fert-222',
//       originalQuantity: '10.5',
//     };

//     await submitFarmerDemand(mockRequest as Request, mockResponse as Response, nextFunction);

//     expect(mockResponse.status).toHaveBeenCalledWith(401);
//   });

//   it('should return 404 if season name is not found', async () => {
//     mockRequest.body = {
//       seasonName: 'UnknownSeason',
//       cropTypeId: 'crop-111',
//       fertilizerTypeId: 'fert-222',
//       originalQuantity: '10.5',
//     };

//     mockGetSeasonByName.mockResolvedValue(null);

//     await submitFarmerDemand(mockRequest as Request, mockResponse as Response, nextFunction);

//     expect(mockResponse.status).toHaveBeenCalledWith(404);
//   });

//   it('should call next with error if required fields are missing', async () => {
//     mockRequest.body = {
//       seasonName: 'Mehir',
//       // cropTypeId missing
//       fertilizerTypeId: 'fert-222',
//       originalQuantity: '10.5',
//     };

//     await submitFarmerDemand(mockRequest as Request, mockResponse as Response, nextFunction);
    
//     expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
//   });
// });
