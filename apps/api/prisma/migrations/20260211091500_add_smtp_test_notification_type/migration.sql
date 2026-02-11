-- Add dedicated notification type for SMTP health-check emails
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SMTP_TEST';
