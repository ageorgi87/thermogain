-- CreateTable
CREATE TABLE "EnergyPriceCache" (
    "id" TEXT NOT NULL,
    "energyType" TEXT NOT NULL,
    "tauxRecent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tauxEquilibre" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "anneesTransition" INTEGER NOT NULL DEFAULT 5,
    "currentPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnergyPriceCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "recipientEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "currentStep" INTEGER NOT NULL DEFAULT 1,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectResults" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "coutAnnuelActuel" DOUBLE PRECISION NOT NULL,
    "coutAnnuelPac" DOUBLE PRECISION NOT NULL,
    "economiesAnnuelles" DOUBLE PRECISION NOT NULL,
    "consommationPacKwh" DOUBLE PRECISION NOT NULL,
    "coutMensuelActuel" DOUBLE PRECISION NOT NULL,
    "coutMensuelPac" DOUBLE PRECISION NOT NULL,
    "economieMensuelle" DOUBLE PRECISION NOT NULL,
    "paybackPeriod" DOUBLE PRECISION,
    "paybackYear" INTEGER,
    "totalSavingsLifetime" DOUBLE PRECISION NOT NULL,
    "netBenefitLifetime" DOUBLE PRECISION NOT NULL,
    "tauxRentabilite" DOUBLE PRECISION,
    "coutTotalActuelLifetime" DOUBLE PRECISION NOT NULL,
    "coutTotalPacLifetime" DOUBLE PRECISION NOT NULL,
    "mensualiteCredit" DOUBLE PRECISION,
    "coutTotalCredit" DOUBLE PRECISION,
    "investissementReel" DOUBLE PRECISION NOT NULL,
    "yearlyData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectResults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAides" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type_logement" TEXT,
    "revenu_fiscal_reference" INTEGER,
    "residence_principale" BOOLEAN,
    "remplacement_complet" BOOLEAN,
    "ma_prime_renov" DOUBLE PRECISION NOT NULL,
    "cee" DOUBLE PRECISION NOT NULL,
    "autres_aides" DOUBLE PRECISION NOT NULL,
    "total_aides" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectAides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCurrentHeating" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "heatingType" TEXT NOT NULL,
    "installationAge" INTEGER NOT NULL,
    "installationCondition" TEXT NOT NULL,
    "dhwIntegrated" BOOLEAN,
    "fuelConsumptionLiters" DOUBLE PRECISION,
    "fuelPricePerLiter" DOUBLE PRECISION,
    "gasConsumptionKwh" DOUBLE PRECISION,
    "gasPricePerKwh" DOUBLE PRECISION,
    "lpgConsumptionKg" DOUBLE PRECISION,
    "lpgPricePerKg" DOUBLE PRECISION,
    "pelletsConsumptionKg" DOUBLE PRECISION,
    "pelletsPricePerKg" DOUBLE PRECISION,
    "woodConsumptionSteres" DOUBLE PRECISION,
    "woodPricePerStere" DOUBLE PRECISION,
    "electricityConsumptionKwh" DOUBLE PRECISION,
    "electricityPricePerKwh" DOUBLE PRECISION,
    "currentCop" DOUBLE PRECISION,
    "heatPumpConsumptionKwh" DOUBLE PRECISION,
    "gasSubscription" DOUBLE PRECISION,
    "annualMaintenance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCurrentHeating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCosts" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "heatPumpCost" DOUBLE PRECISION NOT NULL,
    "installationCost" DOUBLE PRECISION NOT NULL,
    "additionalWorkCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectCosts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDhw" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "dhwSystemType" TEXT NOT NULL,
    "dhwConsumptionKnown" BOOLEAN NOT NULL,
    "dhwConsumptionKwh" DOUBLE PRECISION,
    "dhwEnergyPricePerKwh" DOUBLE PRECISION NOT NULL,
    "dhwAnnualMaintenance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDhw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEvolutions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "evolution_prix_fioul" DOUBLE PRECISION,
    "evolution_prix_gaz" DOUBLE PRECISION,
    "evolution_prix_gpl" DOUBLE PRECISION,
    "evolution_prix_bois" DOUBLE PRECISION,
    "evolution_prix_electricite" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectEvolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFinancement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "mode_financement" TEXT NOT NULL,
    "apport_personnel" DOUBLE PRECISION,
    "montant_credit" DOUBLE PRECISION,
    "taux_interet" DOUBLE PRECISION,
    "duree_credit_mois" INTEGER,
    "mensualite" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectFinancement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectHousing" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "constructionYear" INTEGER NOT NULL,
    "livingArea" INTEGER NOT NULL,
    "numberOfOccupants" INTEGER NOT NULL,
    "dpeRating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectHousing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectHeatPump" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "heatPumpType" TEXT NOT NULL,
    "heatPumpPowerKw" DOUBLE PRECISION,
    "estimatedCop" DOUBLE PRECISION,
    "adjustedCop" DOUBLE PRECISION,
    "emitters" TEXT,
    "heatPumpLifespanYears" INTEGER,
    "electricityPricePerKwh" DOUBLE PRECISION,
    "currentSubscribedPowerKva" INTEGER,
    "heatPumpSubscribedPowerKva" INTEGER,
    "annualMaintenanceCost" DOUBLE PRECISION,
    "heatPumpElectricityPricePerKwh" DOUBLE PRECISION,
    "withDhwManagement" BOOLEAN,
    "dhwTankVolumeLiters" INTEGER,
    "dhwCop" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectHeatPump_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "password" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "website" TEXT,
    "siret" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnergyPriceCache_energyType_key" ON "EnergyPriceCache"("energyType");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectResults_projectId_key" ON "ProjectResults"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectAides_projectId_key" ON "ProjectAides"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCurrentHeating_projectId_key" ON "ProjectCurrentHeating"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCosts_projectId_key" ON "ProjectCosts"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDhw_projectId_key" ON "ProjectDhw"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEvolutions_projectId_key" ON "ProjectEvolutions"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFinancement_projectId_key" ON "ProjectFinancement"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectHousing_projectId_key" ON "ProjectHousing"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectHeatPump_projectId_key" ON "ProjectHeatPump"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectResults" ADD CONSTRAINT "ProjectResults_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAides" ADD CONSTRAINT "ProjectAides_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCurrentHeating" ADD CONSTRAINT "ProjectCurrentHeating_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCosts" ADD CONSTRAINT "ProjectCosts_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDhw" ADD CONSTRAINT "ProjectDhw_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEvolutions" ADD CONSTRAINT "ProjectEvolutions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFinancement" ADD CONSTRAINT "ProjectFinancement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectHousing" ADD CONSTRAINT "ProjectHousing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectHeatPump" ADD CONSTRAINT "ProjectHeatPump_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
