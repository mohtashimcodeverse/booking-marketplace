-- AlterEnum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'ARCHIVED'
      AND enumtypid = '"PropertyStatus"'::regtype
  ) THEN
    ALTER TYPE "PropertyStatus" ADD VALUE 'ARCHIVED';
  END IF;
END $$;

-- CreateEnum
CREATE TYPE "PropertyUnpublishRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "MessageCounterpartyRole" AS ENUM ('VENDOR', 'CUSTOMER');
CREATE TYPE "BookingDocumentType" AS ENUM ('PASSPORT', 'EMIRATES_ID', 'VISA', 'SELFIE', 'OTHER');
CREATE TYPE "GuestReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "FxQuoteCurrency" AS ENUM ('USD', 'EUR', 'GBP');

-- CreateTable
CREATE TABLE "PropertyUnpublishRequest" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT,
  "propertyTitleSnapshot" TEXT NOT NULL,
  "propertyCitySnapshot" TEXT,
  "requestedByVendorId" TEXT NOT NULL,
  "status" "PropertyUnpublishRequestStatus" NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "reviewedByAdminId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "adminNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PropertyUnpublishRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MessageThread" (
  "id" TEXT NOT NULL,
  "adminId" TEXT NOT NULL,
  "counterpartyUserId" TEXT NOT NULL,
  "counterpartyRole" "MessageCounterpartyRole" NOT NULL,
  "subject" TEXT,
  "lastMessageAt" TIMESTAMP(3),
  "lastMessagePreview" TEXT,
  "lastMessageSenderId" TEXT,
  "adminLastReadAt" TIMESTAMP(3),
  "counterpartyLastReadAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MessageThread_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Message" (
  "id" TEXT NOT NULL,
  "threadId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BookingDocument" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "uploadedByUserId" TEXT NOT NULL,
  "type" "BookingDocumentType" NOT NULL DEFAULT 'OTHER',
  "storageKey" TEXT NOT NULL,
  "originalName" TEXT,
  "mimeType" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "BookingDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuestReview" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "rating" INTEGER NOT NULL,
  "title" TEXT,
  "comment" TEXT,
  "status" "GuestReviewStatus" NOT NULL DEFAULT 'PENDING',
  "moderatedByAdminId" TEXT,
  "moderatedAt" TIMESTAMP(3),
  "moderationNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GuestReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FxRate" (
  "id" TEXT NOT NULL,
  "baseCurrency" TEXT NOT NULL DEFAULT 'AED',
  "quoteCurrency" "FxQuoteCurrency" NOT NULL,
  "rate" DECIMAL(18,8) NOT NULL,
  "asOfDate" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FxRate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PropertyUnpublishRequest_propertyId_idx" ON "PropertyUnpublishRequest"("propertyId");
CREATE INDEX "PropertyUnpublishRequest_requestedByVendorId_idx" ON "PropertyUnpublishRequest"("requestedByVendorId");
CREATE INDEX "PropertyUnpublishRequest_status_idx" ON "PropertyUnpublishRequest"("status");
CREATE INDEX "PropertyUnpublishRequest_createdAt_idx" ON "PropertyUnpublishRequest"("createdAt");

CREATE UNIQUE INDEX "uniq_message_thread_admin_counterparty" ON "MessageThread"("adminId", "counterpartyUserId");
CREATE INDEX "MessageThread_counterpartyUserId_counterpartyRole_idx" ON "MessageThread"("counterpartyUserId", "counterpartyRole");
CREATE INDEX "MessageThread_lastMessageAt_idx" ON "MessageThread"("lastMessageAt");

CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");
CREATE INDEX "Message_senderId_idx" ON "Message"("senderId");

CREATE INDEX "BookingDocument_bookingId_idx" ON "BookingDocument"("bookingId");
CREATE INDEX "BookingDocument_uploadedByUserId_idx" ON "BookingDocument"("uploadedByUserId");
CREATE INDEX "BookingDocument_type_idx" ON "BookingDocument"("type");

CREATE UNIQUE INDEX "GuestReview_bookingId_key" ON "GuestReview"("bookingId");
CREATE INDEX "GuestReview_propertyId_status_idx" ON "GuestReview"("propertyId", "status");
CREATE INDEX "GuestReview_customerId_createdAt_idx" ON "GuestReview"("customerId", "createdAt");

CREATE UNIQUE INDEX "uniq_fx_rate_base_quote_date" ON "FxRate"("baseCurrency", "quoteCurrency", "asOfDate");
CREATE INDEX "FxRate_asOfDate_idx" ON "FxRate"("asOfDate");

-- AlterTable
ALTER TABLE "Property" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "Booking" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "Payment" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "BookingCancellation" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "Refund" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "SecurityDepositPolicy" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "SecurityDeposit" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "VendorStatement" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "Payout" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "LedgerEntry" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "PropertyServiceConfig" ALTER COLUMN "currency" SET DEFAULT 'AED';
ALTER TABLE "WorkOrder" ALTER COLUMN "currency" SET DEFAULT 'AED';

-- AddForeignKey
ALTER TABLE "PropertyUnpublishRequest" ADD CONSTRAINT "PropertyUnpublishRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PropertyUnpublishRequest" ADD CONSTRAINT "PropertyUnpublishRequest_requestedByVendorId_fkey" FOREIGN KEY ("requestedByVendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PropertyUnpublishRequest" ADD CONSTRAINT "PropertyUnpublishRequest_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MessageThread" ADD CONSTRAINT "MessageThread_counterpartyUserId_fkey" FOREIGN KEY ("counterpartyUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BookingDocument" ADD CONSTRAINT "BookingDocument_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingDocument" ADD CONSTRAINT "BookingDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GuestReview" ADD CONSTRAINT "GuestReview_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuestReview" ADD CONSTRAINT "GuestReview_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuestReview" ADD CONSTRAINT "GuestReview_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuestReview" ADD CONSTRAINT "GuestReview_moderatedByAdminId_fkey" FOREIGN KEY ("moderatedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
