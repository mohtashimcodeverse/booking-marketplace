-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyMediaCategory" ADD VALUE 'COVER';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'DINING';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'ENTRY';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'HALLWAY';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'STUDY';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'LAUNDRY';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'BALCONY';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'TERRACE';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'VIEW';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'BUILDING';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'NEIGHBORHOOD';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'POOL';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'GYM';
ALTER TYPE "PropertyMediaCategory" ADD VALUE 'PARKING';

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "createdByAdminId" TEXT;

-- CreateIndex
CREATE INDEX "Property_createdByAdminId_idx" ON "Property"("createdByAdminId");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
