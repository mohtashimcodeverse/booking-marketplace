-- Add enum values for property lifecycle and notifications
ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'APPROVED_PENDING_ACTIVATION_PAYMENT';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PROPERTY_APPROVED_ACTIVATION_REQUIRED';

-- Activation invoice status enum
DO $$
BEGIN
  CREATE TYPE "ActivationInvoiceStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- Notification read model (per-recipient read timestamp)
ALTER TABLE "NotificationEvent"
ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "NotificationEvent_recipientUserId_readAt_idx"
ON "NotificationEvent"("recipientUserId", "readAt");

-- Property activation invoices
CREATE TABLE IF NOT EXISTS "PropertyActivationInvoice" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "vendorId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "status" "ActivationInvoiceStatus" NOT NULL DEFAULT 'PENDING',
  "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
  "providerRef" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PropertyActivationInvoice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PropertyActivationInvoice_propertyId_idx"
ON "PropertyActivationInvoice"("propertyId");

CREATE INDEX IF NOT EXISTS "PropertyActivationInvoice_vendorId_idx"
ON "PropertyActivationInvoice"("vendorId");

CREATE INDEX IF NOT EXISTS "PropertyActivationInvoice_status_idx"
ON "PropertyActivationInvoice"("status");

CREATE INDEX IF NOT EXISTS "PropertyActivationInvoice_propertyId_status_idx"
ON "PropertyActivationInvoice"("propertyId", "status");

DO $$
BEGIN
  ALTER TABLE "PropertyActivationInvoice"
  ADD CONSTRAINT "PropertyActivationInvoice_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  ALTER TABLE "PropertyActivationInvoice"
  ADD CONSTRAINT "PropertyActivationInvoice_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
