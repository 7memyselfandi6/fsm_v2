import prisma from '../config/prisma.js';
import { PaymentMethod, SaleStatus } from '@prisma/client';

// Shipping Lots
export const getShippingLots = async () => {
  return await prisma.shippingLot.findMany({
    include: { fertilizerType: true, dispatches: true },
  });
};

export const createLotDispatch = async (dispatchData: any) => {
  return await prisma.lotDispatch.create({
    data: dispatchData,
  });
};

// Unions & Destinations
export const getUnions = async () => await prisma.union.findMany({ include: { region: true, zone: true } });
export const getDestinations = async () => await prisma.destination.findMany({ include: { union: true } });

// PCs
export const getPCs = async () => await prisma.pC.findMany({ include: { kebele: true, destination: true } });

// Inventory
export const getPCInventory = async (pcId: string) => {
  return await prisma.pCInventory.findMany({
    where: { pcId },
    include: { fertilizerType: true },
  });
};

// Farmer Purchasing Workflow
export const initiateSale = async (saleData: any) => {
  return await prisma.fertilizerSale.create({
    data: {
      ...saleData,
      status: SaleStatus.PAYMENT_RECEIVED,
    },
  });
};

export const deliverSale = async (saleId: string, storemanId: string) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the sale
    const sale = await tx.fertilizerSale.findUnique({
      where: { id: saleId },
    });

    if (!sale) throw new Error('Sale not found');
    if (sale.status === SaleStatus.DELIVERED) throw new Error('Already delivered');

    // 2. Deduct from inventory
    const inventory = await tx.pCInventory.findUnique({
      where: {
        pcId_fertilizerTypeId: {
          pcId: sale.pcId,
          fertilizerTypeId: sale.fertilizerTypeId,
        },
      },
    });

    if (!inventory || inventory.quantity < sale.quantity) {
      throw new Error('Insufficient inventory in PC');
    }

    await tx.pCInventory.update({
      where: { id: inventory.id },
      data: { quantity: { decrement: sale.quantity } },
    });

    // 3. Update sale status
    return await tx.fertilizerSale.update({
      where: { id: saleId },
      data: {
        status: SaleStatus.DELIVERED,
        storemanId,
      },
    });
  });
};

export const getSalesByPC = async (pcId: string, status?: SaleStatus) => {
  return await prisma.fertilizerSale.findMany({
    where: status ? { pcId, status } : { pcId },
    include: { farmer: true, fertilizerType: true, accountant: true, storeman: true },
  });
};
