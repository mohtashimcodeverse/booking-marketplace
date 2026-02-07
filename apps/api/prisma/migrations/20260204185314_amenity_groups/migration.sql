-- AlterTable
ALTER TABLE "Amenity" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "AmenityGroup" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmenityGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AmenityGroup_key_key" ON "AmenityGroup"("key");

-- CreateIndex
CREATE INDEX "AmenityGroup_isActive_idx" ON "AmenityGroup"("isActive");

-- CreateIndex
CREATE INDEX "AmenityGroup_sortOrder_idx" ON "AmenityGroup"("sortOrder");

-- CreateIndex
CREATE INDEX "Amenity_isActive_idx" ON "Amenity"("isActive");

-- CreateIndex
CREATE INDEX "Amenity_groupId_idx" ON "Amenity"("groupId");

-- CreateIndex
CREATE INDEX "Amenity_sortOrder_idx" ON "Amenity"("sortOrder");

-- CreateIndex
CREATE INDEX "idx_booking_property_status_dates" ON "Booking"("propertyId", "status", "checkIn", "checkOut");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_property_status_city_area" ON "Property"("status", "city", "area");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_property_status_lat_lng" ON "Property"("status", "lat", "lng");

-- CreateIndex
CREATE INDEX "idx_calendar_property_status_date" ON "PropertyCalendarDay"("propertyId", "status", "date");

-- CreateIndex
CREATE INDEX "idx_hold_property_status_dates_expires" ON "PropertyHold"("propertyId", "status", "checkIn", "checkOut", "expiresAt");

-- AddForeignKey
ALTER TABLE "Amenity" ADD CONSTRAINT "Amenity_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "AmenityGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
