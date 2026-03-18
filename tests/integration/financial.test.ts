
// import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// const mockFindMany = jest.fn();
// const mockCount = jest.fn();

// jest.unstable_mockModule('../../src/config/prisma.js', () => ({
//   __esModule: true,
//   default: {
//     kebele: {
//       findMany: mockFindMany,
//       count: mockCount,
//     },
//     woreda: {
//       // findMany: mockFindMany,
//       count: mockCount,
//     },
//     zone: {
//       findMany: mockFindMany,
//       count: mockCount,
//     },
//     region: {
//       findMany: mockFindMany,
//       count: mockCount,
//     },
//     federal: {
//       findMany: mockFindMany,
//       count: mockCount,
//     },
//     farmerDemand: {
//       findMany: mockFindMany,
//     },
//   },
// }));

// // Import after mocking
// const {
//   getKebeleFinancials,
//   getWoredaFinancials,
//   getZoneFinancials,
//   getRegionFinancials,
//   getFederalFinancials,
// } = await import('../../src/services/financial.service.js');

// describe('Financial Service', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('getKebeleFinancials', () => {
//     it('should return kebele financials', async () => {
//       mockFindMany.mockResolvedValueOnce([
//         {
//           id: 'kebele-1',
//           name: 'Kebele One',
//           status: true,
//           farmers: [
//             {
//               demands: [
//                 { originalQuantity: 100, moaAdjustedQuantity: 90 },
//               ],
//             },
//           ],
//         },
//       ]);
//       mockCount.mockResolvedValueOnce(1);

//       const { financials, totalCount } = await getKebeleFinancials(1, 10);

//       expect(financials).toHaveLength(1);
//       expect(financials[0].kebeleName).toBe('Kebele One');
//       expect(financials[0].totalAmount).toBe('100.00');
//       expect(financials[0].totalAdjustedAmount).toBe('90.00');
//       expect(financials[0].isEnabled).toBe(true);
//       expect(totalCount).toBe(1);
//     });
//   });

//   // Add similar tests for getWoredaFinancials, getZoneFinancials, getRegionFinancials, getFederalFinancials
// });
