/*
  Warnings:

  - A unique constraint covering the columns `[farmerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'FARMER';

-- AlterTable
ALTER TABLE "Farmer" ALTER COLUMN "uniqueFarmerId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "farmerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_farmerId_key" ON "User"("farmerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
