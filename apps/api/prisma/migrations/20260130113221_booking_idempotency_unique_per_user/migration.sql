-- RenameIndex
ALTER INDEX "Booking_customerId_idempotencyKey_key" RENAME TO "uniq_booking_idempotency_per_customer";
