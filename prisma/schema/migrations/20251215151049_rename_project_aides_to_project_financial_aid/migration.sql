/*
  Warnings:

  - You are about to drop the `ProjectAides` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectAides" DROP CONSTRAINT "ProjectAides_projectId_fkey";

-- DropTable
DROP TABLE "ProjectAides";

-- CreateTable
CREATE TABLE "ProjectFinancialAid" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "housingType" TEXT,
    "referenceTaxIncome" INTEGER,
    "isPrimaryResidence" BOOLEAN,
    "isCompleteReplacement" BOOLEAN,
    "maPrimeRenov" DOUBLE PRECISION NOT NULL,
    "cee" DOUBLE PRECISION NOT NULL,
    "otherAid" DOUBLE PRECISION NOT NULL,
    "totalAid" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectFinancialAid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFinancialAid_projectId_key" ON "ProjectFinancialAid"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectFinancialAid" ADD CONSTRAINT "ProjectFinancialAid_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
