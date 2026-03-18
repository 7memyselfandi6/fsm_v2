
// import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// const mockFindMany = jest.fn();
// const mockFindFirst = jest.fn();
// const mockFindUnique = jest.fn();

// jest.unstable_mockModule('../../src/config/prisma.js', () => ({
//   __esModule: true,
//   default: {
//     farmerDemand: {
//       findMany: mockFindMany,
//       findFirst: mockFindFirst,
//       groupBy: jest.fn().mockResolvedValue([]),
//     },
//     season: {
//       findUnique: mockFindUnique,
//       findFirst: mockFindFirst,
//     },
//     kebele: {
//       findMany: jest.fn(),
//     },
//   },
// }));

// // Import after mocking
// const { getWoredaAdjustmentTable } = await import('../../src/services/demand.service.js');

// describe('getWoredaAdjustmentTable Integration', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return adjustment table with nested kebele information', async () => {
//     // Mock active season
//     mockFindUnique.mockResolvedValueOnce({ id: 'season-1', name: 'Meher 2026' });

//     // Mock demands with kebele data
//     mockFindMany.mockResolvedValueOnce([
//       {
//         id: 'demand-1',
//         originalQuantity: 100,
//         fertilizerTypeId: 'urea-id',
//         fertilizerType: { name: 'Urea' },
//         kebeleAdjustedQuantity: 90,
//         woredaAdjustedQuantity: 80,
//         farmer: {
//           farmAreaHectares: 2,
//           kebeleId: 'kebele-1',
//           kebele: { id: 'kebele-1', name: 'Kebele 01' }
//         }
//       },
//       {
//         id: 'demand-2',
//         originalQuantity: 50,
//         fertilizerTypeId: 'urea-id',
//         fertilizerType: { name: 'Urea' },
//         kebeleAdjustedQuantity: 40,
//         woredaAdjustedQuantity: 30,
//         farmer: {
//           farmAreaHectares: 1,
//           kebeleId: 'kebele-2',
//           kebele: { id: 'kebele-2', name: 'Kebele 02' }
//         }
//       }
//     ]);

//     // Mock lock status
//     mockFindFirst.mockResolvedValueOnce(null);

//     const user = { woredaId: 'woreda-1' };
//     const result = await getWoredaAdjustmentTable(user, 'Meher 2026');

//     expect(result).toBeDefined();
//     expect(result.adjustmentTable).toHaveLength(1);
    
//     const ureaEntry = result.adjustmentTable[0];
//     expect(ureaEntry.fertilizerType).toBe('Urea');
//     expect(ureaEntry.collectedQty).toBe(150); // 100 + 50
    
//     // Check nested kebeles
//     expect(ureaEntry.kebeles).toHaveLength(2);
    
//     const k1 = ureaEntry.kebeles.find((k: any) => k.kebeleId === 'kebele-1');
//     expect(k1.kebeleName).toBe('Kebele 01');
//     expect(k1.collectedQty).toBe(100);
//     expect(k1.kebeleAdjustedQty).toBe(90);
//     expect(k1.woredaAdjustedQty).toBe(80);

//     const k2 = ureaEntry.kebeles.find((k: any) => k.kebeleId === 'kebele-2');
//     expect(k2.kebeleName).toBe('Kebele 02');
//     expect(k2.collectedQty).toBe(50);
//   });
// });
