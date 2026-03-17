// import { jest, describe, it, expect } from '@jest/globals';

// // Define mocks before importing the service
// const mockFindUnique = jest.fn();
// const mockFindMany = jest.fn();
// const mockGroupBy = jest.fn();
// const mockFindFirst = jest.fn();

// jest.unstable_mockModule('../../src/config/prisma', () => ({
//   __esModule: true,
//   default: {
//     region: { findUnique: mockFindUnique },
//     farmerDemand: { findMany: mockFindMany, groupBy: mockGroupBy },
//     season: { findUnique: mockFindUnique, findFirst: mockFindFirst },
//     regionalFlag: { findUnique: mockFindUnique },
//     shippingLot: { findMany: mockFindMany },
//   },
// }));

// // Import service after mocking
// const { getRegionSummary } = await import('../../src/services/demand.service');

// describe('getRegionSummary Integration', () => {
//   const mockUser = { regionId: 'region-1', role: 'REGION_MANAGER' };

//   it('should return the correct hierarchical structure and top-level lots', async () => {
//     mockFindUnique.mockResolvedValueOnce({
//       id: 'region-1',
//       name: 'Oromia',
//       zones: [
//         {
//           id: 'zone-1',
//           name: 'West Shewa',
//           woredas: [
//             {
//               id: 'woreda-1',
//               name: 'Ambo',
//               kebeles: [{ id: 'kebele-1', name: 'Kebele 01' }]
//             }
//           ]
//         }
//       ],
//       unions: [
//         {
//           id: 'union-1',
//           name: 'Ambo Union',
//           zoneId: 'zone-1',
//           regionId: 'region-1',
//           destinations: [
//             {
//               id: 'dest-1',
//               name: 'Ambo Center',
//               unionId: 'union-1',
//               pcs: [
//                 { 
//                   id: 'pc-1', 
//                   name: 'PC 1', 
//                   kebeleId: 'kebele-1', 
//                   destinationId: 'dest-1',
//                   kebele: { id: 'kebele-1', name: 'Kebele 01', woredaId: 'woreda-1' }
//                 }
//               ]
//             }
//           ]
//         }
//       ]
//     });

//     // Mock season
//     mockFindUnique.mockResolvedValueOnce({ id: 'season-1', name: 'Meher 2026' });
    
//     // Mock regional flag
//     mockFindUnique.mockResolvedValueOnce({ imageUrl: 'http://flag.com' });

//     // Mock lots
//     mockFindMany.mockResolvedValueOnce([
//       {
//         id: 'lot-1',
//         lotNumber: 101,
//         totalQuantity: 500,
//         ureaAmount: 300,
//         dapAmount: 200,
//         fertilizerType: { name: 'UREA' }
//       }
//     ]);

//     // Mock demands
//     mockFindMany.mockResolvedValueOnce([
//       {
//         id: 'demand-1',
//         originalQuantity: 10,
//         fertilizerType: { name: 'UREA' },
//         farmer: { kebeleId: 'kebele-1', kebele: { name: 'Kebele 01', woredaId: 'woreda-1', woreda: { name: 'Ambo', zoneId: 'zone-1' } } }
//       }
//     ]);

//     const result = await getRegionSummary(mockUser, 'Meher 2026');

//     expect(result).toBeDefined();
//     expect(result.regionName).toBe('Oromia');
//     expect(result.lots).toHaveLength(1);
//     expect(result.lots[0].id).toBe('lot-1');
//   });
// });
