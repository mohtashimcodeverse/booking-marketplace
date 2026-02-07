-- DropForeignKey
ALTER TABLE "PropertyDocument" DROP CONSTRAINT "PropertyDocument_uploadedByUserId_fkey";

-- DropIndex
DROP INDEX "PropertyDocument_type_idx";

-- AlterTable
ALTER TABLE "PropertyDocument" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "originalName" TEXT,
ADD COLUMN     "storageKey" TEXT,
ALTER COLUMN "url" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PropertyDocument" ADD CONSTRAINT "PropertyDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
