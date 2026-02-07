-- CreateEnum
CREATE TYPE "SecurityDepositStatus" AS ENUM ('NOT_REQUIRED', 'REQUIRED', 'AUTHORIZED', 'CAPTURED', 'RELEASED', 'CLAIMED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SecurityDepositMode" AS ENUM ('NONE', 'AUTHORIZE', 'CAPTURE');

-- CreateEnum
CREATE TYPE "VendorStatementStatus" AS ENUM ('DRAFT', 'FINALIZED', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('BOOKING_CAPTURED', 'MANAGEMENT_FEE', 'REFUND', 'DEPOSIT_AUTH', 'DEPOSIT_CAPTURE', 'DEPOSIT_RELEASE', 'DEPOSIT_CLAIM', 'ADJUSTMENT', 'PAYOUT');

-- CreateEnum
CREATE TYPE "LedgerDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateTable
CREATE TABLE "SecurityDepositPolicy" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "mode" "SecurityDepositMode" NOT NULL DEFAULT 'NONE',
    "amount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "holdDaysAfterCheckout" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityDepositPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityDeposit" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "mode" "SecurityDepositMode" NOT NULL,
    "status" "SecurityDepositStatus" NOT NULL DEFAULT 'REQUIRED',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
    "providerRef" TEXT,
    "authorizedAt" TIMESTAMP(3),
    "capturedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "note" TEXT,
    "metaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityDeposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorStatement" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "status" "VendorStatementStatus" NOT NULL DEFAULT 'DRAFT',
    "grossBookings" INTEGER NOT NULL DEFAULT 0,
    "managementFees" INTEGER NOT NULL DEFAULT 0,
    "refunds" INTEGER NOT NULL DEFAULT 0,
    "adjustments" INTEGER NOT NULL DEFAULT 0,
    "netPayable" INTEGER NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "metaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "statementId" TEXT NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
    "providerRef" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "propertyId" TEXT,
    "bookingId" TEXT,
    "paymentId" TEXT,
    "refundId" TEXT,
    "statementId" TEXT,
    "type" "LedgerEntryType" NOT NULL,
    "direction" "LedgerDirection" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotencyKey" TEXT,
    "metaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SecurityDepositPolicy_propertyId_key" ON "SecurityDepositPolicy"("propertyId");

-- CreateIndex
CREATE INDEX "SecurityDepositPolicy_propertyId_idx" ON "SecurityDepositPolicy"("propertyId");

-- CreateIndex
CREATE INDEX "SecurityDepositPolicy_isActive_idx" ON "SecurityDepositPolicy"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SecurityDeposit_bookingId_key" ON "SecurityDeposit"("bookingId");

-- CreateIndex
CREATE INDEX "SecurityDeposit_bookingId_idx" ON "SecurityDeposit"("bookingId");

-- CreateIndex
CREATE INDEX "SecurityDeposit_propertyId_idx" ON "SecurityDeposit"("propertyId");

-- CreateIndex
CREATE INDEX "SecurityDeposit_customerId_idx" ON "SecurityDeposit"("customerId");

-- CreateIndex
CREATE INDEX "SecurityDeposit_status_idx" ON "SecurityDeposit"("status");

-- CreateIndex
CREATE INDEX "VendorStatement_vendorId_idx" ON "VendorStatement"("vendorId");

-- CreateIndex
CREATE INDEX "VendorStatement_status_idx" ON "VendorStatement"("status");

-- CreateIndex
CREATE INDEX "VendorStatement_periodStart_periodEnd_idx" ON "VendorStatement"("periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_vendor_statement_period" ON "VendorStatement"("vendorId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "Payout_statementId_key" ON "Payout"("statementId");

-- CreateIndex
CREATE INDEX "Payout_vendorId_idx" ON "Payout"("vendorId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_provider_idx" ON "Payout"("provider");

-- CreateIndex
CREATE INDEX "LedgerEntry_vendorId_idx" ON "LedgerEntry"("vendorId");

-- CreateIndex
CREATE INDEX "LedgerEntry_type_idx" ON "LedgerEntry"("type");

-- CreateIndex
CREATE INDEX "LedgerEntry_occurredAt_idx" ON "LedgerEntry"("occurredAt");

-- CreateIndex
CREATE INDEX "LedgerEntry_statementId_idx" ON "LedgerEntry"("statementId");

-- CreateIndex
CREATE INDEX "LedgerEntry_bookingId_idx" ON "LedgerEntry"("bookingId");

-- CreateIndex
CREATE INDEX "LedgerEntry_paymentId_idx" ON "LedgerEntry"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_ledger_idempotency" ON "LedgerEntry"("vendorId", "type", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "SecurityDepositPolicy" ADD CONSTRAINT "SecurityDepositPolicy_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorStatement" ADD CONSTRAINT "VendorStatement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "VendorStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_statementId_fkey" FOREIGN KEY ("statementId") REFERENCES "VendorStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
