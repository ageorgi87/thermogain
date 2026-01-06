/*
  Warnings:

  - You are about to drop the column `anneesTransition` on the `EnergyPriceCache` table. All the data in the column will be lost.
  - You are about to drop the column `tauxEquilibre` on the `EnergyPriceCache` table. All the data in the column will be lost.
  - You are about to drop the column `tauxRecent` on the `EnergyPriceCache` table. All the data in the column will be lost.
  - You are about to drop the column `coutAnnuelActuel` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `coutAnnuelPac` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `coutMensuelActuel` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `coutMensuelPac` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `coutTotalActuelLifetime` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `coutTotalCredit` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `coutTotalPacLifetime` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `economieMensuelle` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `economiesAnnuelles` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `investissementReel` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `mensualiteCredit` on the `ProjectResults` table. All the data in the column will be lost.
  - You are about to drop the column `tauxRentabilite` on the `ProjectResults` table. All the data in the column will be lost.
  - Added the required column `actualInvestment` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `annualSavings` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentAnnualCost` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentMonthlyCost` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heatPumpAnnualCost` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `heatPumpMonthlyCost` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monthlySavings` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCurrentCostLifetime` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalHeatPumpCostLifetime` to the `ProjectResults` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EnergyPriceCache" DROP COLUMN "anneesTransition",
DROP COLUMN "tauxEquilibre",
DROP COLUMN "tauxRecent",
ADD COLUMN     "equilibriumRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "recentRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "transitionYears" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectResults" DROP COLUMN "coutAnnuelActuel",
DROP COLUMN "coutAnnuelPac",
DROP COLUMN "coutMensuelActuel",
DROP COLUMN "coutMensuelPac",
DROP COLUMN "coutTotalActuelLifetime",
DROP COLUMN "coutTotalCredit",
DROP COLUMN "coutTotalPacLifetime",
DROP COLUMN "economieMensuelle",
DROP COLUMN "economiesAnnuelles",
DROP COLUMN "investissementReel",
DROP COLUMN "mensualiteCredit",
DROP COLUMN "tauxRentabilite",
ADD COLUMN     "actualInvestment" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "annualSavings" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "currentAnnualCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "currentMonthlyCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "heatPumpAnnualCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "heatPumpMonthlyCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "monthlyLoanPayment" DOUBLE PRECISION,
ADD COLUMN     "monthlySavings" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "profitabilityRate" DOUBLE PRECISION,
ADD COLUMN     "totalCurrentCostLifetime" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalHeatPumpCostLifetime" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "totalLoanCost" DOUBLE PRECISION;
