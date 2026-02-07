/*
  Warnings:

  - You are about to drop the column `reviewNotes` on the `PropertyDocument` table. All the data in the column will be lost.
  - You are about to drop the column `reviewedAt` on the `PropertyDocument` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `PropertyDocument` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PropertyDocument_status_idx";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "provider" SET DEFAULT 'MANUAL';

-- AlterTable
ALTER TABLE "PropertyDocument" DROP COLUMN "reviewNotes",
DROP COLUMN "reviewedAt",
DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Refund" ALTER COLUMN "provider" SET DEFAULT 'MANUAL';
