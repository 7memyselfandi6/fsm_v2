-- CreateTable
CREATE TABLE "AdjustmentHistory" (
    "id" TEXT NOT NULL,
    "level" "LockingLevel" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "previousAmount" DOUBLE PRECISION NOT NULL,
    "newAmount" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "distributions" JSONB,

    CONSTRAINT "AdjustmentHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdjustmentHistory" ADD CONSTRAINT "AdjustmentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
