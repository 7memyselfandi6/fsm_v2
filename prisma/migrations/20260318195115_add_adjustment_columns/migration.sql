-- AlterTable
ALTER TABLE "Federal" ADD COLUMN     "isGlobalLockActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totalAdjustedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Kebele" ADD COLUMN     "totalAdjustedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "totalAdjustedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Woreda" ADD COLUMN     "totalAdjustedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Zone" ADD COLUMN     "totalAdjustedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0;
