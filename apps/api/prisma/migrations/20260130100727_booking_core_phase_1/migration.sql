/*
  Warnings:

  - A unique constraint covering the columns `[holdId]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[customerId,idempotencyKey]` on the table `Booking` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bookingId]` on the table `PropertyHold` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `holdId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `createdById` on table `PropertyHold` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "holdId" TEXT NOT NULL,
ADD COLUMN     "idempotencyKey" TEXT;

-- AlterTable
ALTER TABLE "PropertyHold" ADD COLUMN     "bookingId" TEXT,
ADD COLUMN     "convertedAt" TIMESTAMP(3),
ALTER COLUMN "createdById" SET NOT NULL;

-- CreateTable
CREATE TABLE "BookingIdempotency" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingIdempotency_bookingId_key" ON "BookingIdempotency"("bookingId");

-- CreateIndex
CREATE INDEX "BookingIdempotency_createdAt_idx" ON "BookingIdempotency"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BookingIdempotency_userId_idempotencyKey_key" ON "BookingIdempotency"("userId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_holdId_key" ON "Booking"("holdId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_customerId_idempotencyKey_key" ON "Booking"("customerId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyHold_bookingId_key" ON "PropertyHold"("bookingId");

-- CreateIndex
CREATE INDEX "PropertyHold_createdById_idx" ON "PropertyHold"("createdById");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_holdId_fkey" FOREIGN KEY ("holdId") REFERENCES "PropertyHold"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingIdempotency" ADD CONSTRAINT "BookingIdempotency_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingIdempotency" ADD CONSTRAINT "BookingIdempotency_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyHold" ADD CONSTRAINT "PropertyHold_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
