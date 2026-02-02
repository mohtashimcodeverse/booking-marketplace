-- CreateEnum
CREATE TYPE "CalendarDayStatus" AS ENUM ('AVAILABLE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "HoldStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CONVERTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "PropertyAvailabilitySettings" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "defaultMinNights" INTEGER NOT NULL DEFAULT 1,
    "defaultMaxNights" INTEGER,
    "advanceNoticeDays" INTEGER NOT NULL DEFAULT 0,
    "preparationDays" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyAvailabilitySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyCalendarDay" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "CalendarDayStatus" NOT NULL DEFAULT 'AVAILABLE',
    "minNightsOverride" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyCalendarDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyHold" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "status" "HoldStatus" NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyHold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAvailabilitySettings_propertyId_key" ON "PropertyAvailabilitySettings"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyAvailabilitySettings_propertyId_idx" ON "PropertyAvailabilitySettings"("propertyId");

-- CreateIndex
CREATE INDEX "PropertyCalendarDay_propertyId_date_idx" ON "PropertyCalendarDay"("propertyId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyCalendarDay_propertyId_date_key" ON "PropertyCalendarDay"("propertyId", "date");

-- CreateIndex
CREATE INDEX "PropertyHold_propertyId_status_expiresAt_idx" ON "PropertyHold"("propertyId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "PropertyHold_propertyId_checkIn_checkOut_idx" ON "PropertyHold"("propertyId", "checkIn", "checkOut");

-- AddForeignKey
ALTER TABLE "PropertyAvailabilitySettings" ADD CONSTRAINT "PropertyAvailabilitySettings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyCalendarDay" ADD CONSTRAINT "PropertyCalendarDay_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyHold" ADD CONSTRAINT "PropertyHold_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
