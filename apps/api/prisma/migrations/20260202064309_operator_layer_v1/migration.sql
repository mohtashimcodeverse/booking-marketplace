-- CreateEnum
CREATE TYPE "ServicePlanType" AS ENUM ('LISTING_ONLY', 'SEMI_MANAGED', 'FULLY_MANAGED');

-- CreateEnum
CREATE TYPE "VendorAgreementStatus" AS ENUM ('ACTIVE', 'PAUSED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "OpsTaskType" AS ENUM ('CLEANING', 'INSPECTION', 'LINEN', 'RESTOCK');

-- CreateEnum
CREATE TYPE "OpsTaskStatus" AS ENUM ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('DRAFT', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ServicePlan" (
    "id" TEXT NOT NULL,
    "type" "ServicePlanType" NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "managementFeeBps" INTEGER NOT NULL,
    "includesCleaning" BOOLEAN NOT NULL DEFAULT false,
    "includesLinen" BOOLEAN NOT NULL DEFAULT false,
    "includesInspection" BOOLEAN NOT NULL DEFAULT false,
    "includesRestock" BOOLEAN NOT NULL DEFAULT false,
    "includesMaintenance" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorServiceAgreement" (
    "id" TEXT NOT NULL,
    "vendorProfileId" TEXT NOT NULL,
    "servicePlanId" TEXT NOT NULL,
    "status" "VendorAgreementStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "agreedManagementFeeBps" INTEGER NOT NULL,
    "notes" TEXT,
    "approvedByAdminId" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorServiceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyServiceConfig" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "servicePlanId" TEXT NOT NULL,
    "vendorAgreementId" TEXT,
    "cleaningRequired" BOOLEAN,
    "linenChangeRequired" BOOLEAN,
    "inspectionRequired" BOOLEAN,
    "restockRequired" BOOLEAN,
    "maintenanceIncluded" BOOLEAN,
    "guestCleaningFee" INTEGER,
    "linenFee" INTEGER,
    "inspectionFee" INTEGER,
    "restockFee" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyServiceConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpsTask" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "bookingId" TEXT,
    "type" "OpsTaskType" NOT NULL,
    "status" "OpsTaskStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "dueAt" TIMESTAMP(3),
    "assignedToUserId" TEXT,
    "checklistJson" TEXT,
    "notes" TEXT,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpsTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "bookingId" TEXT,
    "createdByUserId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" "MaintenancePriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "MaintenanceStatus" NOT NULL DEFAULT 'OPEN',
    "metaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "maintenanceRequestId" TEXT NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "assignedToUserId" TEXT,
    "costEstimate" INTEGER,
    "actualCost" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServicePlan_code_key" ON "ServicePlan"("code");

-- CreateIndex
CREATE INDEX "ServicePlan_type_idx" ON "ServicePlan"("type");

-- CreateIndex
CREATE INDEX "ServicePlan_isActive_idx" ON "ServicePlan"("isActive");

-- CreateIndex
CREATE INDEX "VendorServiceAgreement_vendorProfileId_status_startDate_idx" ON "VendorServiceAgreement"("vendorProfileId", "status", "startDate");

-- CreateIndex
CREATE INDEX "VendorServiceAgreement_servicePlanId_idx" ON "VendorServiceAgreement"("servicePlanId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyServiceConfig_propertyId_key" ON "PropertyServiceConfig"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyServiceConfig_servicePlanId_idx" ON "PropertyServiceConfig"("servicePlanId");

-- CreateIndex
CREATE INDEX "PropertyServiceConfig_vendorAgreementId_idx" ON "PropertyServiceConfig"("vendorAgreementId");

-- CreateIndex
CREATE INDEX "OpsTask_propertyId_status_scheduledFor_idx" ON "OpsTask"("propertyId", "status", "scheduledFor");

-- CreateIndex
CREATE INDEX "OpsTask_bookingId_idx" ON "OpsTask"("bookingId");

-- CreateIndex
CREATE INDEX "OpsTask_assignedToUserId_idx" ON "OpsTask"("assignedToUserId");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_ops_task_per_booking_type" ON "OpsTask"("bookingId", "type");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_propertyId_status_idx" ON "MaintenanceRequest"("propertyId", "status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_priority_idx" ON "MaintenanceRequest"("priority");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_bookingId_idx" ON "MaintenanceRequest"("bookingId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_createdByUserId_idx" ON "MaintenanceRequest"("createdByUserId");

-- CreateIndex
CREATE INDEX "WorkOrder_maintenanceRequestId_idx" ON "WorkOrder"("maintenanceRequestId");

-- CreateIndex
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");

-- CreateIndex
CREATE INDEX "WorkOrder_assignedToUserId_idx" ON "WorkOrder"("assignedToUserId");

-- AddForeignKey
ALTER TABLE "VendorServiceAgreement" ADD CONSTRAINT "VendorServiceAgreement_vendorProfileId_fkey" FOREIGN KEY ("vendorProfileId") REFERENCES "VendorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceAgreement" ADD CONSTRAINT "VendorServiceAgreement_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "ServicePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorServiceAgreement" ADD CONSTRAINT "VendorServiceAgreement_approvedByAdminId_fkey" FOREIGN KEY ("approvedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyServiceConfig" ADD CONSTRAINT "PropertyServiceConfig_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyServiceConfig" ADD CONSTRAINT "PropertyServiceConfig_servicePlanId_fkey" FOREIGN KEY ("servicePlanId") REFERENCES "ServicePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyServiceConfig" ADD CONSTRAINT "PropertyServiceConfig_vendorAgreementId_fkey" FOREIGN KEY ("vendorAgreementId") REFERENCES "VendorServiceAgreement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTask" ADD CONSTRAINT "OpsTask_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTask" ADD CONSTRAINT "OpsTask_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpsTask" ADD CONSTRAINT "OpsTask_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_maintenanceRequestId_fkey" FOREIGN KEY ("maintenanceRequestId") REFERENCES "MaintenanceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
