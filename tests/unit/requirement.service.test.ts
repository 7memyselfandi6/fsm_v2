// import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// const mockPrismaFarmerRequirementFindUnique = jest.fn();
// const mockPrismaFarmerRequirementFindMany = jest.fn();
// const mockPrismaFarmerRequirementCount = jest.fn();
// const mockPrismaFarmerRequirementCreate = jest.fn();
// const mockPrismaFarmerRequirementUpdate = jest.fn();
// const mockPrismaFarmerRequirementDelete = jest.fn();
// const mockPrismaRequirementSeasonDeleteMany = jest.fn();
// const mockPrismaRequirementFertilizerDeleteMany = jest.fn();
// const mockPrismaFertilizerTypeFindMany = jest.fn();
// const mockPrismaCropTypeFindMany = jest.fn();
// const mockPrisma$transaction = jest.fn();
// const mockPrisma$queryRaw = jest.fn();

// jest.unstable_mockModule('../../src/config/prisma.js', () => ({
//   __esModule: true,
//   default: {
//     farmerRequirement: {
//       findUnique: mockPrismaFarmerRequirementFindUnique,
//       findMany: mockPrismaFarmerRequirementFindMany,
//       count: mockPrismaFarmerRequirementCount,
//       create: mockPrismaFarmerRequirementCreate,
//       update: mockPrismaFarmerRequirementUpdate,
//       delete: mockPrismaFarmerRequirementDelete
//     },
//     requirementSeason: {
//       deleteMany: mockPrismaRequirementSeasonDeleteMany
//     },
//     requirementFertilizer: {
//       deleteMany: mockPrismaRequirementFertilizerDeleteMany
//     },
//     fertilizerType: {
//       findMany: mockPrismaFertilizerTypeFindMany
//     },
//     cropType: {
//       findMany: mockPrismaCropTypeFindMany
//     },
//     $transaction: mockPrisma$transaction,
//     $queryRaw: mockPrisma$queryRaw
//   },
// }));

// const { createRequirement, getRequirements, getRequirementById, updateRequirement, deleteRequirement } = await import('../../src/services/requirement.service.js');

// describe('FarmerRequirement Service', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   const mockInput = {
//     uniqueFarmerId: 'FARM-001',
//     seasons: [{ seasonName: 'Meher', month: 'Tikimt' }],
//     fertilizers: [{ fertilizerTypeId: 'fert-uuid', quantity: 5 }],
//     cropTypeIds: ['crop-uuid']
//   };

//   describe('createRequirement', () => {
//     it('should create a requirement when data is valid', async () => {
//       mockPrismaFarmerRequirementFindUnique.mockResolvedValue(null);
//       mockPrismaFertilizerTypeFindMany.mockResolvedValue([{ id: 'fert-uuid' }]);
//       mockPrismaCropTypeFindMany.mockResolvedValue([{ id: 'crop-uuid' }]);
      
//       mockPrisma$transaction.mockImplementation(async (cb) => await cb({
//         farmerRequirement: {
//           create: mockPrismaFarmerRequirementCreate.mockResolvedValue({
//             ...mockInput,
//             updatedAt: new Date()
//           })
//         }
//       }));

//       const result = await createRequirement(mockInput);
//       expect(result.uniqueFarmerId).toBe('FARM-001');
//       expect(mockPrismaFarmerRequirementCreate).toHaveBeenCalled();
//     });

//     it('should throw 409 if requirement already exists', async () => {
//       mockPrismaFarmerRequirementFindUnique.mockResolvedValue({ uniqueFarmerId: 'FARM-001' });
//       await expect(createRequirement(mockInput)).rejects.toThrow('Farmer requirement already exists');
//     });
//   });

//   describe('getRequirements', () => {
//     it('should return paginated requirements', async () => {
//       mockPrismaFarmerRequirementFindMany.mockResolvedValue([mockInput]);
//       mockPrismaFarmerRequirementCount.mockResolvedValue(1);

//       const result = await getRequirements(0, 50);
//       expect(result.items).toHaveLength(1);
//       expect(result.totalCount).toBe(1);
//     });
//   });

//   describe('updateRequirement', () => {
//     it('should update a requirement with serializable transaction and row lock', async () => {
//       mockPrismaFertilizerTypeFindMany.mockResolvedValue([{ id: 'fert-uuid' }]);
//       mockPrismaCropTypeFindMany.mockResolvedValue([{ id: 'crop-uuid' }]);
      
//       mockPrisma$transaction.mockImplementation(async (cb, options) => {
//         expect(options.isolationLevel).toBe('Serializable');
//         return await cb({
//           $queryRaw: mockPrisma$queryRaw.mockResolvedValue([{ uniqueFarmerId: 'FARM-001' }]),
//           requirementSeason: { deleteMany: mockPrismaRequirementSeasonDeleteMany },
//           requirementFertilizer: { deleteMany: mockPrismaRequirementFertilizerDeleteMany },
//           farmerRequirement: {
//             update: mockPrismaFarmerRequirementUpdate.mockResolvedValue(mockInput)
//           }
//         });
//       });

//       const result = await updateRequirement('FARM-001', mockInput);
//       expect(result.uniqueFarmerId).toBe('FARM-001');
//       expect(mockPrisma$queryRaw).toHaveBeenCalled();
//       expect(mockPrismaRequirementSeasonDeleteMany).toHaveBeenCalled();
//     });
//   });
// });
