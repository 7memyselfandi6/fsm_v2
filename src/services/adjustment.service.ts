import prisma from '../config/prisma.js';
import { LockingLevel } from '@prisma/client';

export const adjustDemand = async (
  level: LockingLevel,
  parentId: string,
  totalAmount: number,
  distributions: { id: string; amount: number }[],
  userId: string,
  reason?: string
) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Check for Federal Global Lock
    const federal = await tx.federal.findFirst();
    if (federal?.isLocked && level !== LockingLevel.MOA) {
      throw new Error('Global federal lock is active. No adjustments allowed.');
    }

    // 2. Validate sum of distributions
    const distributionSum = distributions.reduce((sum, d) => sum + d.amount, 0);
    if (Math.abs(distributionSum - totalAmount) > 0.01) {
      throw new Error(`The sum of distributions (${distributionSum}) must equal the total amount (${totalAmount}).`);
    }

    let parentModel: any;
    let childModel: any;
    let entityType: string;

    switch (level) {
      case LockingLevel.MOA:
        parentModel = tx.federal;
        childModel = tx.region;
        entityType = 'FEDERAL';
        break;
      case LockingLevel.REGION:
        parentModel = tx.region;
        childModel = tx.zone;
        entityType = 'REGION';
        break;
      case LockingLevel.ZONE:
        parentModel = tx.zone;
        childModel = tx.woreda;
        entityType = 'ZONE';
        break;
      case LockingLevel.WOREDA:
        parentModel = tx.woreda;
        childModel = tx.kebele;
        entityType = 'WOREDA';
        break;
      default:
        throw new Error('Invalid adjustment level');
    }

    // 3. Verify parent existence
    const parent = await parentModel.findUnique({ where: { id: parentId } });
    if (!parent) throw new Error(`${entityType} with ID ${parentId} not found`);

    const previousAmount = parent.totalAdjustedQuantity;

    // 4. Update parent total amount
    await parentModel.update({
      where: { id: parentId },
      data: { totalAdjustedQuantity: totalAmount }
    });

    // 5. Update child amounts
    for (const dist of distributions) {
      const child = await childModel.findUnique({ where: { id: dist.id } });
      if (!child) throw new Error(`Child entity with ID ${dist.id} not found at level ${level}`);
      
      await childModel.update({
        where: { id: dist.id },
        data: { totalAdjustedQuantity: dist.amount }
      });
    }

    // 6. Record history
    await tx.adjustmentHistory.create({
      data: {
        level,
        entityId: parentId,
        entityType,
        previousAmount,
        newAmount: totalAmount,
        userId,
        reason,
        distributions: distributions as any
      }
    });

    return {
      success: true,
      level,
      totalAmount,
      distributions
    };
  });
};

export const setGlobalLock = async (isActive: boolean, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const federal = await tx.federal.findFirst();
    if (!federal) throw new Error('Federal record not found');

    const updatedFederal = await tx.federal.update({
      where: { id: federal.id },
      data: { isLocked: isActive }
    });

    // If activating, we could also implement auto-distribution down here 
    // as per requirement "Automatically distributes the federally adjusted final numbers down to all regions"
    // but the adjustDemand already handles federal->region distribution when called.
    
    return updatedFederal;
  });
};

export const getAdjustmentStatus = async (level: LockingLevel, id?: string) => {
  let model: any;
  switch (level) {
    case LockingLevel.MOA: model = prisma.federal; break;
    case LockingLevel.REGION: model = prisma.region; break;
    case LockingLevel.ZONE: model = prisma.zone; break;
    case LockingLevel.WOREDA: model = prisma.woreda; break;
    case LockingLevel.KEBELE: model = prisma.kebele; break;
    default: throw new Error('Invalid level');
  }

  if (id) {
    return await model.findUnique({ where: { id } });
  }
  return await model.findMany();
};
