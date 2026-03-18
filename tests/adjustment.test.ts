// import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// // We'll mock prisma to test the service logic
// const mockUpdate = jest.fn();
// const mockFindUnique = jest.fn();
// const mockFindFirst = jest.fn();
// const mockCreate = jest.fn();
// const mockUpdateMany = jest.fn();

// jest.unstable_mockModule('../src/config/prisma.js', () => ({
//   __esModule: true,
//   default: {
//     $transaction: async (cb: any) => cb({
//       federal: { findFirst: mockFindFirst, findUnique: mockFindUnique, update: mockUpdate },
//       region: { findUnique: mockFindUnique, update: mockUpdate },
//       zone: { findUnique: mockFindUnique, update: mockUpdate },
//       woreda: { findUnique: mockFindUnique, update: mockUpdate },
//       kebele: { findUnique: mockFindUnique, update: mockUpdate },
//       adjustmentHistory: { create: mockCreate }
//     }),
//     federal: { findFirst: mockFindFirst },
//     region: { findUnique: mockFindUnique },
//     zone: { findUnique: mockFindUnique },
//     woreda: { findUnique: mockFindUnique },
//     kebele: { findUnique: mockFindUnique }
//   }
// }));

// const { adjustDemand, setGlobalLock } = await import('../src/services/adjustment.service.js');
// import { LockingLevel } from '@prisma/client';

// describe('Adjustment System Integration', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should allow federal adjustment and distribution', async () => {
//     mockFindFirst.mockResolvedValueOnce({ id: 'fed-1', isGlobalLockActive: false });
//     mockFindUnique.mockResolvedValue({ id: 'parent-1', totalAdjustedQuantity: 0 }); // for parent check
//     mockFindUnique.mockResolvedValue({ id: 'child-1' }); // for child check

//     const result = await adjustDemand(
//       LockingLevel.MOA,
//       'fed-1',
//       1000,
//       [{ id: 'reg-1', amount: 600 }, { id: 'reg-2', amount: 400 }],
//       'user-1',
//       'Initial distribution'
//     );

//     expect(result.success).toBe(true);
//     expect(mockUpdate).toHaveBeenCalledTimes(3); // 1 parent + 2 children
//     expect(mockCreate).toHaveBeenCalled(); // History record
//   });

//   it('should fail if distributions sum does not match total', async () => {
//     await expect(adjustDemand(
//       LockingLevel.MOA,
//       'fed-1',
//       1000,
//       [{ id: 'reg-1', amount: 500 }], // only 500
//       'user-1'
//     )).rejects.toThrow('The sum of distributions (500) must equal the total amount (1000).');
//   });

//   it('should prevent lower level adjustment if global lock is active', async () => {
//     mockFindFirst.mockResolvedValueOnce({ id: 'fed-1', isGlobalLockActive: true });

//     await expect(adjustDemand(
//       LockingLevel.REGION,
//       'reg-1',
//       500,
//       [{ id: 'zone-1', amount: 500 }],
//       'user-1'
//     )).rejects.toThrow('Global federal lock is active. No adjustments allowed.');
//   });
// });
