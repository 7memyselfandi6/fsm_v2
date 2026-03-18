-- AlterTable
ALTER TABLE "Kebele" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Region" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Woreda" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Zone" ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Federal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Federal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Federal_name_key" ON "Federal"("name");
