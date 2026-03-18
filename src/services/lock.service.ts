import prisma from '../config/prisma.js';
import { LockingLevel } from '@prisma/client';

export const lockEntity = async (level: LockingLevel, entityId: string, isLocked: boolean, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    let entity: any;
    let model: any;

    switch (level) {
      case LockingLevel.KEBELE:
        model = tx.kebele;
        break;
      case LockingLevel.WOREDA:
        model = tx.woreda;
        break;
      case LockingLevel.ZONE:
        model = tx.zone;
        break;
      case LockingLevel.REGION:
        model = tx.region;
        break;
      case LockingLevel.MOA:
        model = tx.federal;
        break;
      default:
        throw new Error('Invalid locking level');
    }

    entity = await model.findUnique({ where: { id: entityId } });
    if (!entity) throw new Error(`${level} with ID ${entityId} not found`);

    const updatedEntity = await model.update({
      where: { id: entityId },
      data: { isLocked }
    });

    // Audit Log
    await tx.lockHistory.create({
      data: {
        level,
        entityId: entityId,
        entityType: level.toString(),
        isLocked,
        overriddenById: userId,
        reason: `Manual ${isLocked ? 'lock' : 'unlock'} via individual endpoint`
      }
    });

    return updatedEntity;
  });
};

export const bulkLockEntities = async (level: LockingLevel, isLocked: boolean, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    let model: any;
    switch (level) {
      case LockingLevel.KEBELE: model = tx.kebele; break;
      case LockingLevel.WOREDA: model = tx.woreda; break;
      case LockingLevel.ZONE: model = tx.zone; break;
      case LockingLevel.REGION: model = tx.region; break;
      case LockingLevel.MOA: model = tx.federal; break;
      default: throw new Error('Invalid locking level');
    }

    const entities = await model.findMany();
    
    await model.updateMany({
      data: { isLocked }
    });

    // Audit Log for each entity in bulk might be too heavy, 
    // but for audit purposes we log a single bulk entry
    await tx.lockHistory.create({
      data: {
        level,
        isGlobal: true,
        entityType: level.toString(),
        isLocked,
        overriddenById: userId,
        reason: `Bulk ${isLocked ? 'lock' : 'unlock'} all ${level.toString()}s`
      }
    });

    return { 
      affectedCount: entities.length,
      level: level.toString(),
      isLocked 
    };
  });
};

export const getLockStatus = async (level: LockingLevel, entityId?: string) => {
  let model: any;
  switch (level) {
    case LockingLevel.KEBELE: model = prisma.kebele; break;
    case LockingLevel.WOREDA: model = prisma.woreda; break;
    case LockingLevel.ZONE: model = prisma.zone; break;
    case LockingLevel.REGION: model = prisma.region; break;
    case LockingLevel.MOA: model = prisma.federal; break;
    default: throw new Error('Invalid locking level');
  }

  if (entityId) {
    const entity = await model.findUnique({ where: { id: entityId } });
    if (!entity) throw new Error(`${level} with ID ${entityId} not found`);
    return { id: entity.id, name: entity.name, isLocked: entity.isLocked };
  } else {
    const entities = await model.findMany({
      select: { id: true, name: true, isLocked: true }
    });
    return entities;
  }
};
