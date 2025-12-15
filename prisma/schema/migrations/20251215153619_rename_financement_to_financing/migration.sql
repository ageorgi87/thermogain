/*
  Warnings:

  - You are about to drop the `ProjectFinancement` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectFinancement" DROP CONSTRAINT "ProjectFinancement_projectId_fkey";

-- DropTable
DROP TABLE "ProjectFinancement";

-- CreateTable
CREATE TABLE "ProjectFinancing" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "financingMode" TEXT NOT NULL,
    "downPayment" DOUBLE PRECISION,
    "loanAmount" DOUBLE PRECISION,
    "interestRate" DOUBLE PRECISION,
    "loanDurationMonths" INTEGER,
    "monthlyPayment" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectFinancing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFinancing_projectId_key" ON "ProjectFinancing"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectFinancing" ADD CONSTRAINT "ProjectFinancing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
