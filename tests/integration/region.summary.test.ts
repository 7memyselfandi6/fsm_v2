// import { jest, describe, it, expect } from '@jest/globals';
// import { getRegionSummary } from '../../src/services/demand.service';
// import prisma from '../../src/config/prisma';

// jest.mock('../../src/config/prisma', () => ({
//   __esModule: true,
//   default: {
//     region: {
//       findUnique: jest.fn(),
//     },
//     farmerDemand: {
//       findMany: jest.fn(),
//       groupBy: jest.fn(),
//     },
//     season: {
//       findUnique: jest.fn(),
//       findFirst: jest.fn(),
//     },
//     regionalFlag: {
//       findUnique: jest.fn(),
//     },
//   },
// }));

// describe('getRegionSummary Integration', () => {
//   const mockUser = { regionId: 'region-1', role: 'REGION_MANAGER' };

//   it('should return the correct hierarchical structure', async () => {
//     (prisma.region.findUnique as jest.Mock).mockResolvedValue({
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
//                 { id: 'pc-1', name: 'PC 1', kebeleId: 'kebele-1', destinationId: 'dest-1' }
//               ],
//               lotDispatches: []
//             }
//           ]
//         }
//       ]
//     });

//     (prisma.season.findUnique as jest.Mock).mockResolvedValue({ id: 'season-1', name: 'Meher 2026' });
//     (prisma.farmerDemand.findMany as jest.Mock).mockResolvedValue([
//       {
//         id: 'demand-1',
//         originalQuantity: 10,
//         fertilizerType: { name: 'UREA' },
//         farmer: { kebeleId: 'kebele-1', kebele: { name: 'Kebele 01', woredaId: 'woreda-1', woreda: { name: 'Ambo', zoneId: 'zone-1' } } }
//       }
//     ]);
//     (prisma.regionalFlag.findUnique as jest.Mock).mockResolvedValue({ imageUrl: 'http://flag.com' });

//     const result = await getRegionSummary(mockUser, 'Meher 2026');

//     expect(result).toBeDefined();
//     expect(result.regionName).toBe('Oromia');
//     expect(result.zones).toHaveLength(1);
//     expect(result.unions).toHaveLength(1);
//     expect(result.unions[0].destinations[0].pcs[0].pcName).toBe('PC 1');
//   });
// });
