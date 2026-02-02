-- CreateEnum
CREATE TYPE "CancellationActor" AS ENUM ('CUSTOMER', 'VENDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CancellationReason" AS ENUM ('GUEST_REQUEST', 'OWNER_REQUEST', 'NO_PAYMENT', 'FORCE_MAJEURE', 'FRAUD', 'ADMIN_OVERRIDE');

-- CreateEnum
CREATE TYPE "CancellationMode" AS ENUM ('SOFT', 'HARD');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RefundReason" AS ENUM ('CANCELLATION', 'PARTIAL_ADJUSTMENT', 'GOODWILL', 'DISPUTE');

-- CreateEnum
CREATE TYPE "PenaltyType" AS ENUM ('NONE', 'PERCENT_OF_NIGHTS', 'PERCENT_OF_TOTAL', 'FIXED_FEE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cancellationReason" "CancellationReason",
ADD COLUMN     "cancelledBy" "CancellationActor";

-- CreateTable
CREATE TABLE "BookingCancellation" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "actor" "CancellationActor" NOT NULL,
    "reason" "CancellationReason" NOT NULL,
    "notes" TEXT,
    "mode" "CancellationMode" NOT NULL DEFAULT 'SOFT',
    "policyVersion" TEXT,
    "cancelledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" INTEGER NOT NULL,
    "managementFee" INTEGER NOT NULL DEFAULT 0,
    "penaltyAmount" INTEGER NOT NULL DEFAULT 0,
    "refundableAmount" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "releasesInventory" BOOLEAN NOT NULL DEFAULT true,
    "refundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingCancellation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CancellationPolicyConfig" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "freeCancelBeforeHours" INTEGER NOT NULL DEFAULT 0,
    "partialRefundBeforeHours" INTEGER NOT NULL DEFAULT 0,
    "noRefundWithinHours" INTEGER NOT NULL DEFAULT 0,
    "penaltyType" "PenaltyType" NOT NULL DEFAULT 'PERCENT_OF_TOTAL',
    "penaltyValue" INTEGER NOT NULL DEFAULT 0,
    "defaultMode" "CancellationMode" NOT NULL DEFAULT 'SOFT',
    "chargeFirstNightOnLateCancel" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationPolicyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "paymentId" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" "RefundReason" NOT NULL DEFAULT 'CANCELLATION',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "provider" "PaymentProvider" NOT NULL DEFAULT 'STRIPE',
    "providerRefundRef" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingCancellation_bookingId_key" ON "BookingCancellation"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "BookingCancellation_refundId_key" ON "BookingCancellation"("refundId");

-- CreateIndex
CREATE INDEX "BookingCancellation_cancelledAt_idx" ON "BookingCancellation"("cancelledAt");

-- CreateIndex
CREATE INDEX "BookingCancellation_actor_idx" ON "BookingCancellation"("actor");

-- CreateIndex
CREATE INDEX "BookingCancellation_reason_idx" ON "BookingCancellation"("reason");

-- CreateIndex
CREATE UNIQUE INDEX "CancellationPolicyConfig_propertyId_key" ON "CancellationPolicyConfig"("propertyId");

-- CreateIndex
CREATE INDEX "CancellationPolicyConfig_isActive_idx" ON "CancellationPolicyConfig"("isActive");

-- CreateIndex
CREATE INDEX "CancellationPolicyConfig_version_idx" ON "CancellationPolicyConfig"("version");

-- CreateIndex
CREATE INDEX "Refund_status_idx" ON "Refund"("status");

-- CreateIndex
CREATE INDEX "Refund_provider_idx" ON "Refund"("provider");

-- CreateIndex
CREATE INDEX "Refund_bookingId_idx" ON "Refund"("bookingId");

-- AddForeignKey
ALTER TABLE "BookingCancellation" ADD CONSTRAINT "BookingCancellation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingCancellation" ADD CONSTRAINT "BookingCancellation_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES "Refund"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CancellationPolicyConfig" ADD CONSTRAINT "CancellationPolicyConfig_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
