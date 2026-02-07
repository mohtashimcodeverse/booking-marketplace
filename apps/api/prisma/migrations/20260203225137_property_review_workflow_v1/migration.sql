-- CreateEnum
CREATE TYPE "PropertyMediaCategory" AS ENUM ('LIVING_ROOM', 'BEDROOM', 'BATHROOM', 'KITCHEN', 'EXTERIOR', 'AMENITY', 'FLOOR_PLAN', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyDocumentType" AS ENUM ('OWNERSHIP_PROOF', 'AUTHORIZATION_PROOF', 'OWNER_ID', 'ADDRESS_PROOF', 'HOLIDAY_HOME_PERMIT', 'OTHER');

-- CreateEnum
CREATE TYPE "PropertyDocumentStatus" AS ENUM ('UPLOADED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PropertyReviewDecision" AS ENUM ('APPROVE', 'REQUEST_CHANGES', 'REJECT');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EMAIL_VERIFICATION_OTP';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PropertyStatus" ADD VALUE 'UNDER_REVIEW';
ALTER TYPE "PropertyStatus" ADD VALUE 'APPROVED';
ALTER TYPE "PropertyStatus" ADD VALUE 'CHANGES_REQUESTED';
ALTER TYPE "PropertyStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "category" "PropertyMediaCategory" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "PropertyDocument" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "PropertyDocumentType" NOT NULL,
    "status" "PropertyDocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "url" TEXT NOT NULL,
    "uploadedByUserId" TEXT NOT NULL,
    "reviewedByAdminId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyReview" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "decision" "PropertyReviewDecision" NOT NULL,
    "notes" TEXT,
    "checklistJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropertyReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyDocument_propertyId_idx" ON "PropertyDocument"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyDocument_type_idx" ON "PropertyDocument"("type");

-- CreateIndex
CREATE INDEX "PropertyDocument_status_idx" ON "PropertyDocument"("status");

-- CreateIndex
CREATE INDEX "PropertyDocument_uploadedByUserId_idx" ON "PropertyDocument"("uploadedByUserId");

-- CreateIndex
CREATE INDEX "PropertyDocument_reviewedByAdminId_idx" ON "PropertyDocument"("reviewedByAdminId");

-- CreateIndex
CREATE INDEX "PropertyReview_propertyId_idx" ON "PropertyReview"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyReview_adminId_idx" ON "PropertyReview"("adminId");

-- CreateIndex
CREATE INDEX "PropertyReview_decision_idx" ON "PropertyReview"("decision");

-- CreateIndex
CREATE INDEX "PropertyReview_createdAt_idx" ON "PropertyReview"("createdAt");

-- CreateIndex
CREATE INDEX "Media_propertyId_category_idx" ON "Media"("propertyId", "category");

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyReview" ADD CONSTRAINT "PropertyReview_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyReview" ADD CONSTRAINT "PropertyReview_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
