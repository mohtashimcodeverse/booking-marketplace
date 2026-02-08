-- CreateEnum
CREATE TYPE "PropertyDeletionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PropertyDeletionRequest" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "propertyTitleSnapshot" TEXT NOT NULL,
    "propertyCitySnapshot" TEXT,
    "requestedByVendorId" TEXT NOT NULL,
    "status" "PropertyDeletionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "reviewedByAdminId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyDeletionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyDeletionRequest_propertyId_idx" ON "PropertyDeletionRequest"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyDeletionRequest_requestedByVendorId_idx" ON "PropertyDeletionRequest"("requestedByVendorId");

-- CreateIndex
CREATE INDEX "PropertyDeletionRequest_status_idx" ON "PropertyDeletionRequest"("status");

-- CreateIndex
CREATE INDEX "PropertyDeletionRequest_createdAt_idx" ON "PropertyDeletionRequest"("createdAt");

-- AddForeignKey
ALTER TABLE "PropertyDeletionRequest" ADD CONSTRAINT "PropertyDeletionRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDeletionRequest" ADD CONSTRAINT "PropertyDeletionRequest_requestedByVendorId_fkey" FOREIGN KEY ("requestedByVendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyDeletionRequest" ADD CONSTRAINT "PropertyDeletionRequest_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
