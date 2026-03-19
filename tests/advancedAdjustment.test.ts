// import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// const mockUpdate = jest.fn();
// const mockFindUnique = jest.fn();
// const mockFindFirst = jest.fn();
// const mockCreate = jest.fn();

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

// const { adjustDemand } = await import('../src/services/adjustment.service.js');
// import { LockingLevel } from '@prisma/client';

// describe('Advanced Adjustment System', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should prevent edits if parent has locked the level', async () => {
//     // Federal lock is active
//     mockFindFirst.mockResolvedValueOnce({ id: 'fed-1', isLocked: true });

//     await expect(adjustDemand(
//       LockingLevel.REGION,
//       'reg-1',
//       500,
//       [{ id: 'zone-1', amount: 500 }],
//       'user-1'
//     )).rejects.toThrow('Global federal lock is active. No adjustments allowed.');
//   });

//   it('should enforce distribution sum validation', async () => {
//     mockFindFirst.mockResolvedValueOnce({ id: 'fed-1', isLocked: false });

//     await expect(adjustDemand(
//       LockingLevel.MOA,
//       'fed-1',
//       1000,
//       [{ id: 'reg-1', amount: 999 }], // Sum mismatch
//       'user-1'
//     )).rejects.toThrow('The sum of distributions (999) must equal the total amount (1000).');
//   });

//   it('should create an audit trail entry on adjustment', async () => {
//     mockFindFirst.mockResolvedValueOnce({ id: 'fed-1', isLocked: false });
//     mockFindUnique.mockResolvedValue({ id: 'fed-1', totalAdjustedQuantity: 500 });
    
//     await adjustDemand(
//       LockingLevel.MOA,
//       'fed-1',
//       1000,
//       [{ id: 'reg-1', amount: 1000 }],
//       'user-1',
//       'Test Audit'
//     );

//     expect(mockCreate).toHaveBeenCalledWith({
//       data: expect.objectContaining({
//         level: LockingLevel.MOA,
//         previousAmount: 500,
//         newAmount: 1000,
//         userId: 'user-1',
//         reason: 'Test Audit'
//       })
//     });
//   });
// });
