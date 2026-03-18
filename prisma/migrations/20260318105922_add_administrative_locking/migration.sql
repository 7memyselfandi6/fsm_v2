-- AlterTable
ALTER TABLE "Federal" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Kebele" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "LockHistory" ADD COLUMN     "entityId" TEXT,
ADD COLUMN     "entityType" TEXT;

-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Woreda" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Zone" ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false;
