/*
  Warnings:

  - You are about to drop the column `requestId` on the `FarmerDemand` table. All the data in the column will be lost.
  - You are about to drop the column `requestedAmountQt` on the `FarmerDemand` table. All the data in the column will be lost.
  - The `status` column on the `FarmerDemand` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `idCardUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `signatureUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AggregatedDemand` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `originalQuantity` to the `FarmerDemand` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MOA_EXPERT', 'MOA_MANAGER', 'REGION_EXPERT', 'REGION_MANAGER', 'ZONE_EXPERT', 'ZONE_MANAGER', 'WOREDA_EXPERT', 'WOREDA_MANAGER', 'KEBELE_DA', 'KEBELE_MANAGER', 'PC_ACCOUNTANT', 'PC_STOREMAN', 'UNION_MEMBER');

-- CreateEnum
CREATE TYPE "MoaPosition" AS ENUM ('MINISTER', 'STATE_MINISTER', 'LEAD_EXECUTIVE_MINISTER', 'DESK_HEAD', 'EXPERT');

-- CreateEnum
CREATE TYPE "MoaRole" AS ENUM ('DATA_LOGGER', 'DATA');

-- CreateEnum
CREATE TYPE "MoaSector" AS ENUM ('INPUT_AND_INVESTMENT', 'AGRICULTURE_AND_HORTICULTURE_INVESTMENT');

-- CreateEnum
CREATE TYPE "MoaLeadExecutive" AS ENUM ('INPUT_LE', 'CROP_LE', 'HORTICULTURE_LE', 'AGRICULTURE_AND_INVESTMENT_LE', 'URBAN_LE', 'COTTON_LE');

-- CreateEnum
CREATE TYPE "DemandStatus" AS ENUM ('PENDING', 'APPROVED', 'LOCKED');

-- CreateEnum
CREATE TYPE "LockingLevel" AS ENUM ('NONE', 'KEBELE', 'WOREDA', 'ZONE', 'REGION', 'MOA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TELEBIRR', 'CBE', 'MOBILE_BANKING');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('PAYMENT_RECEIVED', 'DELIVERED');

-- DropForeignKey
ALTER TABLE "AggregatedDemand" DROP CONSTRAINT "AggregatedDemand_fertilizerTypeId_fkey";

-- DropForeignKey
ALTER TABLE "AggregatedDemand" DROP CONSTRAINT "AggregatedDemand_kebeleId_fkey";

-- DropForeignKey
ALTER TABLE "AggregatedDemand" DROP CONSTRAINT "AggregatedDemand_seasonId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_kebeleId_fkey";

-- DropIndex
DROP INDEX "FarmerDemand_requestId_key";

-- AlterTable
ALTER TABLE "FarmerDemand" DROP COLUMN "requestId",
DROP COLUMN "requestedAmountQt",
ADD COLUMN     "kebeleAdjustedQuantity" DOUBLE PRECISION,
ADD COLUMN     "lockedAtLevel" "LockingLevel" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "moaAdjustedQuantity" DOUBLE PRECISION,
ADD COLUMN     "originalQuantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "regionAdjustedQuantity" DOUBLE PRECISION,
ADD COLUMN     "woredaAdjustedQuantity" DOUBLE PRECISION,
ADD COLUMN     "zoneAdjustedQuantity" DOUBLE PRECISION,
DROP COLUMN "status",
ADD COLUMN     "status" "DemandStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "idCardUrl",
DROP COLUMN "signatureUrl",
ADD COLUMN     "moaDesk" TEXT,
ADD COLUMN     "moaLeadExecutive" "MoaLeadExecutive",
ADD COLUMN     "moaPosition" "MoaPosition",
ADD COLUMN     "moaRole" "MoaRole",
ADD COLUMN     "moaSector" "MoaSector",
ADD COLUMN     "pcId" TEXT,
ADD COLUMN     "regionId" TEXT,
ADD COLUMN     "role" "Role" NOT NULL,
ADD COLUMN     "unionId" TEXT,
ADD COLUMN     "woredaId" TEXT,
ADD COLUMN     "zoneId" TEXT,
ALTER COLUMN "kebeleId" DROP NOT NULL;

-- DropTable
DROP TABLE "AggregatedDemand";

-- CreateTable
CREATE TABLE "Union" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "zoneId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Union_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PC" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kebeleId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingLot" (
    "id" TEXT NOT NULL,
    "lotNumber" INTEGER NOT NULL,
    "fertilizerTypeId" TEXT NOT NULL,
    "totalQuantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShippingLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotDispatch" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "dispatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PCInventory" (
    "id" TEXT NOT NULL,
    "pcId" TEXT NOT NULL,
    "fertilizerTypeId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PCInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizerSale" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "pcId" TEXT NOT NULL,
    "fertilizerTypeId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'PAYMENT_RECEIVED',
    "accountantId" TEXT NOT NULL,
    "storemanId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FertilizerSale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Union_name_key" ON "Union"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingLot_lotNumber_key" ON "ShippingLot"("lotNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PCInventory_pcId_fertilizerTypeId_key" ON "PCInventory"("pcId", "fertilizerTypeId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_woredaId_fkey" FOREIGN KEY ("woredaId") REFERENCES "Woreda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_kebeleId_fkey" FOREIGN KEY ("kebeleId") REFERENCES "Kebele"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_pcId_fkey" FOREIGN KEY ("pcId") REFERENCES "PC"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES "Union"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Union" ADD CONSTRAINT "Union_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Union" ADD CONSTRAINT "Union_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Destination" ADD CONSTRAINT "Destination_unionId_fkey" FOREIGN KEY ("unionId") REFERENCES "Union"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PC" ADD CONSTRAINT "PC_kebeleId_fkey" FOREIGN KEY ("kebeleId") REFERENCES "Kebele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PC" ADD CONSTRAINT "PC_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingLot" ADD CONSTRAINT "ShippingLot_fertilizerTypeId_fkey" FOREIGN KEY ("fertilizerTypeId") REFERENCES "FertilizerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotDispatch" ADD CONSTRAINT "LotDispatch_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "ShippingLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotDispatch" ADD CONSTRAINT "LotDispatch_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PCInventory" ADD CONSTRAINT "PCInventory_pcId_fkey" FOREIGN KEY ("pcId") REFERENCES "PC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PCInventory" ADD CONSTRAINT "PCInventory_fertilizerTypeId_fkey" FOREIGN KEY ("fertilizerTypeId") REFERENCES "FertilizerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerSale" ADD CONSTRAINT "FertilizerSale_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerSale" ADD CONSTRAINT "FertilizerSale_pcId_fkey" FOREIGN KEY ("pcId") REFERENCES "PC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerSale" ADD CONSTRAINT "FertilizerSale_fertilizerTypeId_fkey" FOREIGN KEY ("fertilizerTypeId") REFERENCES "FertilizerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerSale" ADD CONSTRAINT "FertilizerSale_accountantId_fkey" FOREIGN KEY ("accountantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerSale" ADD CONSTRAINT "FertilizerSale_storemanId_fkey" FOREIGN KEY ("storemanId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
