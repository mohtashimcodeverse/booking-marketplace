-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'PAYMENT_FAILED', 'REFUND_PROCESSED', 'NEW_BOOKING_RECEIVED', 'BOOKING_CANCELLED_BY_GUEST', 'OPS_TASKS_CREATED', 'MAINTENANCE_REQUEST_CREATED');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "NotificationEvent" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "payloadJson" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NotificationEvent_type_idx" ON "NotificationEvent"("type");

-- CreateIndex
CREATE INDEX "NotificationEvent_status_idx" ON "NotificationEvent"("status");

-- CreateIndex
CREATE INDEX "NotificationEvent_recipientUserId_idx" ON "NotificationEvent"("recipientUserId");

-- CreateIndex
CREATE INDEX "NotificationEvent_entityType_entityId_idx" ON "NotificationEvent"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "uniq_notification_idempotency" ON "NotificationEvent"("type", "channel", "entityType", "entityId", "recipientUserId");

-- AddForeignKey
ALTER TABLE "NotificationEvent" ADD CONSTRAINT "NotificationEvent_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
