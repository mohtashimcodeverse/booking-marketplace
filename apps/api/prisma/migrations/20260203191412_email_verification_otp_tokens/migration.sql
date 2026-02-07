/*
  Warnings:

  - You are about to drop the column `tokenHash` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - Added the required column `email` to the `EmailVerificationToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `otpHash` to the `EmailVerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EmailVerificationToken_tokenHash_key";

-- AlterTable
ALTER TABLE "EmailVerificationToken" DROP COLUMN "tokenHash",
ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "otpHash" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "EmailVerificationToken_email_idx" ON "EmailVerificationToken"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationToken_userId_email_usedAt_idx" ON "EmailVerificationToken"("userId", "email", "usedAt");
