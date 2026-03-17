/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Region` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "code" TEXT;

-- AlterTable
ALTER TABLE "ShippingLot" ADD COLUMN     "dapAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "ureaAmount" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kebeleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FederalFlag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FederalFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "center" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "woredaId" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "isOwn" BOOLEAN NOT NULL DEFAULT true,
    "isRental" BOOLEAN NOT NULL DEFAULT false,
    "capacity" DOUBLE PRECISION NOT NULL,
    "storeman" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "education" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "hasOffice" BOOLEAN NOT NULL DEFAULT false,
    "hasComputer" BOOLEAN NOT NULL DEFAULT false,
    "hasSmartphone" BOOLEAN NOT NULL DEFAULT false,
    "hasWifi" BOOLEAN NOT NULL DEFAULT false,
    "hasElectric" BOOLEAN NOT NULL DEFAULT false,
    "networkType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizerSubsidy" (
    "id" TEXT NOT NULL,
    "eid" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "regionId" TEXT NOT NULL,
    "fertilizerTypeId" TEXT NOT NULL,
    "amountMT" DOUBLE PRECISION NOT NULL,
    "amountQT" DOUBLE PRECISION NOT NULL,
    "priceBefore" DOUBLE PRECISION NOT NULL,
    "priceAfter" DOUBLE PRECISION NOT NULL,
    "subsidyAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FertilizerSubsidy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropFertilizerRate" (
    "id" SERIAL NOT NULL,
    "cropId" TEXT NOT NULL,
    "highUrea" DOUBLE PRECISION NOT NULL,
    "highDap" DOUBLE PRECISION NOT NULL,
    "mediumUrea" DOUBLE PRECISION NOT NULL,
    "mediumDap" DOUBLE PRECISION NOT NULL,
    "lowUrea" DOUBLE PRECISION NOT NULL,
    "lowDap" DOUBLE PRECISION NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropFertilizerRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LockHistory" (
    "id" TEXT NOT NULL,
    "level" "LockingLevel" NOT NULL,
    "regionId" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overriddenById" TEXT,

    CONSTRAINT "LockHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Section_kebeleId_idx" ON "Section"("kebeleId");

-- CreateIndex
CREATE UNIQUE INDEX "Section_name_kebeleId_key" ON "Section"("name", "kebeleId");

-- CreateIndex
CREATE UNIQUE INDEX "FertilizerSubsidy_eid_key" ON "FertilizerSubsidy"("eid");

-- CreateIndex
CREATE INDEX "Destination_unionId_idx" ON "Destination"("unionId");

-- CreateIndex
CREATE INDEX "Farmer_kebeleId_idx" ON "Farmer"("kebeleId");

-- CreateIndex
CREATE INDEX "FarmerDemand_farmerId_idx" ON "FarmerDemand"("farmerId");

-- CreateIndex
CREATE INDEX "FarmerDemand_seasonId_idx" ON "FarmerDemand"("seasonId");

-- CreateIndex
CREATE INDEX "FarmerDemand_fertilizerTypeId_idx" ON "FarmerDemand"("fertilizerTypeId");

-- CreateIndex
CREATE INDEX "Kebele_woredaId_idx" ON "Kebele"("woredaId");

-- CreateIndex
CREATE INDEX "PC_kebeleId_idx" ON "PC"("kebeleId");

-- CreateIndex
CREATE INDEX "PC_destinationId_idx" ON "PC"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "Region_code_key" ON "Region"("code");

-- CreateIndex
CREATE INDEX "Union_regionId_idx" ON "Union"("regionId");

-- CreateIndex
CREATE INDEX "Union_zoneId_idx" ON "Union"("zoneId");

-- CreateIndex
CREATE INDEX "Woreda_zoneId_idx" ON "Woreda"("zoneId");

-- CreateIndex
CREATE INDEX "Zone_regionId_idx" ON "Zone"("regionId");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_kebeleId_fkey" FOREIGN KEY ("kebeleId") REFERENCES "Kebele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerSubsidy" ADD CONSTRAINT "FertilizerSubsidy_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FertilizerSubsidy" ADD CONSTRAINT "FertilizerSubsidy_fertilizerTypeId_fkey" FOREIGN KEY ("fertilizerTypeId") REFERENCES "FertilizerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropFertilizerRate" ADD CONSTRAINT "CropFertilizerRate_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "CropType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockHistory" ADD CONSTRAINT "LockHistory_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockHistory" ADD CONSTRAINT "LockHistory_overriddenById_fkey" FOREIGN KEY ("overriddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
