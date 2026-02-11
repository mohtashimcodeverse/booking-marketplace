ALTER TABLE "NotificationEvent"
ADD COLUMN IF NOT EXISTS "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "NotificationEvent_status_nextAttemptAt_idx"
ON "NotificationEvent"("status", "nextAttemptAt");
