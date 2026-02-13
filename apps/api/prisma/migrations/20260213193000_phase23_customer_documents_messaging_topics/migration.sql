-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'DOCUMENT_UPLOAD_REQUEST';

-- CreateEnum
CREATE TYPE "MessageTopic" AS ENUM (
  'BOOKING_ISSUE',
  'CHECKIN_ACCESS',
  'CLEANING',
  'MAINTENANCE',
  'PAYMENT_REFUND',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "CustomerDocumentType" AS ENUM (
  'PASSPORT',
  'EMIRATES_ID',
  'VISA',
  'SELFIE',
  'OTHER'
);

-- CreateEnum
CREATE TYPE "CustomerDocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "GuestReview"
ADD COLUMN "cleanlinessRating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "communicationRating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "locationRating" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "valueRating" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "MessageThread"
ADD COLUMN "topic" "MessageTopic" NOT NULL DEFAULT 'OTHER';

-- CreateTable
CREATE TABLE "CustomerDocument" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" "CustomerDocumentType" NOT NULL DEFAULT 'OTHER',
  "status" "CustomerDocumentStatus" NOT NULL DEFAULT 'PENDING',
  "fileKey" TEXT NOT NULL,
  "originalName" TEXT,
  "mimeType" TEXT,
  "notes" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewNotes" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "reviewedByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageThread_topic_lastMessageAt_idx" ON "MessageThread"("topic", "lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_customer_document_user_type" ON "CustomerDocument"("userId", "type");

-- CreateIndex
CREATE INDEX "CustomerDocument_userId_status_updatedAt_idx" ON "CustomerDocument"("userId", "status", "updatedAt");

-- CreateIndex
CREATE INDEX "CustomerDocument_status_createdAt_idx" ON "CustomerDocument"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerDocument_reviewedByAdminId_idx" ON "CustomerDocument"("reviewedByAdminId");

-- AddForeignKey
ALTER TABLE "CustomerDocument"
ADD CONSTRAINT "CustomerDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDocument"
ADD CONSTRAINT "CustomerDocument_reviewedByAdminId_fkey" FOREIGN KEY ("reviewedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
