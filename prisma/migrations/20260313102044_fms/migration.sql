-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Woreda" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Woreda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kebele" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "woredaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kebele_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegionalFlag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegionalFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "signatureUrl" TEXT,
    "idCardUrl" TEXT,
    "profilePictureUrl" TEXT,
    "kebeleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,
    "uniqueFarmerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "farmAreaHectares" DOUBLE PRECISION NOT NULL,
    "photoUrl" TEXT,
    "landCertificateUrl" TEXT,
    "kebeleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FertilizerType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FertilizerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmerDemand" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "cropTypeId" TEXT NOT NULL,
    "fertilizerTypeId" TEXT NOT NULL,
    "requestedAmountQt" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Demand is not approved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmerDemand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AggregatedDemand" (
    "id" TEXT NOT NULL,
    "kebeleId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "fertilizerTypeId" TEXT NOT NULL,
    "demandCollectedQt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "demandIntelligenceQt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "demandApprovedQt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AggregatedDemand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Zone_name_regionId_key" ON "Zone"("name", "regionId");

-- CreateIndex
CREATE UNIQUE INDEX "Woreda_name_zoneId_key" ON "Woreda"("name", "zoneId");

-- CreateIndex
CREATE UNIQUE INDEX "Kebele_name_woredaId_key" ON "Kebele"("name", "woredaId");

-- CreateIndex
CREATE UNIQUE INDEX "RegionalFlag_regionId_key" ON "RegionalFlag"("regionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_uniqueFarmerId_key" ON "Farmer"("uniqueFarmerId");

-- CreateIndex
CREATE UNIQUE INDEX "Farmer_phoneNumber_key" ON "Farmer"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Season_name_key" ON "Season"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CropCategory_name_key" ON "CropCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CropType_name_categoryId_key" ON "CropType"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "FertilizerType_name_key" ON "FertilizerType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FarmerDemand_requestId_key" ON "FarmerDemand"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "AggregatedDemand_kebeleId_seasonId_fertilizerTypeId_key" ON "AggregatedDemand"("kebeleId", "seasonId", "fertilizerTypeId");

-- AddForeignKey
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Woreda" ADD CONSTRAINT "Woreda_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kebele" ADD CONSTRAINT "Kebele_woredaId_fkey" FOREIGN KEY ("woredaId") REFERENCES "Woreda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalFlag" ADD CONSTRAINT "RegionalFlag_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_kebeleId_fkey" FOREIGN KEY ("kebeleId") REFERENCES "Kebele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farmer" ADD CONSTRAINT "Farmer_kebeleId_fkey" FOREIGN KEY ("kebeleId") REFERENCES "Kebele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropType" ADD CONSTRAINT "CropType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CropCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerDemand" ADD CONSTRAINT "FarmerDemand_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerDemand" ADD CONSTRAINT "FarmerDemand_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerDemand" ADD CONSTRAINT "FarmerDemand_cropTypeId_fkey" FOREIGN KEY ("cropTypeId") REFERENCES "CropType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerDemand" ADD CONSTRAINT "FarmerDemand_fertilizerTypeId_fkey" FOREIGN KEY ("fertilizerTypeId") REFERENCES "FertilizerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AggregatedDemand" ADD CONSTRAINT "AggregatedDemand_kebeleId_fkey" FOREIGN KEY ("kebeleId") REFERENCES "Kebele"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AggregatedDemand" ADD CONSTRAINT "AggregatedDemand_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AggregatedDemand" ADD CONSTRAINT "AggregatedDemand_fertilizerTypeId_fkey" FOREIGN KEY ("fertilizerTypeId") REFERENCES "FertilizerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
