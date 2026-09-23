-- AlterTable
ALTER TABLE "Agency" ADD COLUMN     "logoKey" TEXT,
ALTER COLUMN "serviceType" DROP NOT NULL,
ALTER COLUMN "teamSize" DROP NOT NULL;
