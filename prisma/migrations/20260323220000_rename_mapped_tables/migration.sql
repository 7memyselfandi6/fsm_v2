-- Rename CropType -> crop_master (matches @@map("crop_master"))
ALTER TABLE "CropType" RENAME TO "crop_master";

-- Rename FertilizerType -> fertilizer_master (matches @@map("fertilizer_master"))
ALTER TABLE "FertilizerType" RENAME TO "fertilizer_master";

-- Create farmer_requirement table (matches @@map("farmer_requirement"))
CREATE TABLE "farmer_requirement" (
    "uniqueFarmerId" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cropTypeIds" TEXT[],

    CONSTRAINT "farmer_requirement_pkey" PRIMARY KEY ("uniqueFarmerId")
);

-- Create seasons table (matches @@map("seasons"))
CREATE TABLE "seasons" (
    "id" TEXT NOT NULL,
    "uniqueFarmerId" TEXT NOT NULL,
    "seasonName" TEXT NOT NULL,
    "month" TEXT NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- Create fertilizers table (matches @@map("fertilizers"))
CREATE TABLE "fertilizers" (
    "id" TEXT NOT NULL,
    "uniqueFarmerId" TEXT NOT NULL,
    "fertilizerTypeId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "fertilizers_pkey" PRIMARY KEY ("id")
);

-- Add FK: seasons -> farmer_requirement
ALTER TABLE "seasons" ADD CONSTRAINT "seasons_uniqueFarmerId_fkey" FOREIGN KEY ("uniqueFarmerId") REFERENCES "farmer_requirement"("uniqueFarmerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add FK: fertilizers -> farmer_requirement
ALTER TABLE "fertilizers" ADD CONSTRAINT "fertilizers_uniqueFarmerId_fkey" FOREIGN KEY ("uniqueFarmerId") REFERENCES "farmer_requirement"("uniqueFarmerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add FK: fertilizers -> fertilizer_master
ALTER TABLE "fertilizers" ADD CONSTRAINT "fertilizers_fertilizerTypeId_fkey" FOREIGN KEY ("fertilizerTypeId") REFERENCES "fertilizer_master"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add federalId to Region
ALTER TABLE "Region" ADD COLUMN "federalId" TEXT;

-- Add FK: Region -> Federal
ALTER TABLE "Region" ADD CONSTRAINT "Region_federalId_fkey" FOREIGN KEY ("federalId") REFERENCES "Federal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateEnum for DemandPriority
CREATE TYPE "DemandPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- AlterTable FarmerDemand: add missing columns
ALTER TABLE "FarmerDemand" 
ADD COLUMN "priority" "DemandPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN "recurrence" TEXT DEFAULT 'NONE',
ADD COLUMN "targetDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Add values to Role enum (Note: using separate statements as required by Postgres for ALTER TYPE)
ALTER TYPE "Role" ADD VALUE 'FARMER';
ALTER TYPE "Role" ADD VALUE 'GUEST';
