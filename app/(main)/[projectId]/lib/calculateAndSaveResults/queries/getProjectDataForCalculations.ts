"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectData } from "@/types/projectData";

interface GetProjectDataForCalculationsParams {
  projectId: string;
}

/**
 * Query optimisée pour récupérer uniquement les données nécessaires aux calculs de rentabilité
 *
 * Exclut les données inutiles pour optimiser les performances:
 * - user (non utilisé dans les calculs)
 * - project name et recipient emails (non utilisés dans les calculs)
 *
 * @param projectId - ID du projet
 * @returns Données formatées pour les calculs
 * @throws Error si le projet est introuvable, incomplet, ou non autorisé
 */
export const getProjectDataForCalculations = async ({
  projectId,
}: GetProjectDataForCalculationsParams): Promise<ProjectData> => {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Non autorisé");
  }

  // Query optimisée : uniquement les relations nécessaires aux calculs
  // (exclut user pour réduire la charge)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      housing: true,
      currentHeating: true,
      dhw: true, // Données DHW (Domestic Hot Water) séparé (si dhwIntegrated = false)
      heatPump: true,
      costs: true,
      financialAid: true,
      financing: true,
    },
  });

  if (!project || project.userId !== session.user.id) {
    throw new Error(`Projet ${projectId} introuvable ou non autorisé`);
  }

  // Vérifier que toutes les données nécessaires sont présentes
  if (
    !project.housing ||
    !project.currentHeating ||
    !project.heatPump ||
    !project.costs ||
    !project.financialAid
  ) {
    throw new Error(`Données incomplètes pour le projet ${projectId}`);
  }

  // Calculer le reste à charge (totalCost - totalAid)
  const remainingCost = project.costs.totalCost - project.financialAid.totalAid;

  // Helper to convert null to undefined
  const nullToUndefined = <T>(value: T | null): T | undefined => value ?? undefined;

  // Return ProjectData with English field names matching DB schema
  return {
    // Current heating data - spread with null converted to undefined
    heatingType: project.currentHeating.heatingType,
    fuelConsumptionLiters: nullToUndefined(project.currentHeating.fuelConsumptionLiters),
    fuelPricePerLiter: nullToUndefined(project.currentHeating.fuelPricePerLiter),
    gasConsumptionKwh: nullToUndefined(project.currentHeating.gasConsumptionKwh),
    gasPricePerKwh: nullToUndefined(project.currentHeating.gasPricePerKwh),
    lpgConsumptionKg: nullToUndefined(project.currentHeating.lpgConsumptionKg),
    lpgPricePerKg: nullToUndefined(project.currentHeating.lpgPricePerKg),
    pelletsConsumptionKg: nullToUndefined(project.currentHeating.pelletsConsumptionKg),
    pelletsPricePerKg: nullToUndefined(project.currentHeating.pelletsPricePerKg),
    woodConsumptionSteres: nullToUndefined(project.currentHeating.woodConsumptionSteres),
    woodPricePerStere: nullToUndefined(project.currentHeating.woodPricePerStere),
    electricityConsumptionKwh: nullToUndefined(project.currentHeating.electricityConsumptionKwh),
    electricityPricePerKwh: nullToUndefined(project.currentHeating.electricityPricePerKwh),
    currentCop: nullToUndefined(project.currentHeating.currentCop),
    heatPumpConsumptionKwh: nullToUndefined(project.currentHeating.heatPumpConsumptionKwh),
    gasSubscription: nullToUndefined(project.currentHeating.gasSubscription),
    annualMaintenance: nullToUndefined(project.currentHeating.annualMaintenance),
    dhwIntegrated: nullToUndefined(project.currentHeating.dhwIntegrated),

    // DHW data (if exists)
    dhwSystemType: nullToUndefined(project.dhw?.dhwSystemType),
    dhwConsumptionKwh: nullToUndefined(project.dhw?.dhwConsumptionKwh),
    dhwEnergyPricePerKwh: nullToUndefined(project.dhw?.dhwEnergyPricePerKwh),
    dhwAnnualMaintenance: nullToUndefined(project.dhw?.dhwAnnualMaintenance),

    // Heat pump data
    heatPumpType: project.heatPump.heatPumpType,
    heatPumpPowerKw: project.heatPump.heatPumpPowerKw!,
    estimatedCop: project.heatPump.estimatedCop!,
    adjustedCop: project.heatPump.adjustedCop!,
    emitters: project.heatPump.emitters ?? "Radiateurs basse température",
    heatPumpLifespanYears: project.heatPump.heatPumpLifespanYears!,
    currentSubscribedPowerKva: nullToUndefined(project.heatPump.currentSubscribedPowerKva),
    heatPumpSubscribedPowerKva: project.heatPump.heatPumpSubscribedPowerKva!,
    annualMaintenanceCost: project.heatPump.annualMaintenanceCost!,
    heatPumpElectricityPricePerKwh: project.heatPump.heatPumpElectricityPricePerKwh ?? project.heatPump.electricityPricePerKwh ?? undefined,
    withDhwManagement: nullToUndefined(project.heatPump.withDhwManagement),
    dhwCop: nullToUndefined(project.heatPump.dhwCop),

    // Housing data
    numberOfOccupants: nullToUndefined(project.housing.numberOfOccupants),
    dpeRating: nullToUndefined(project.housing.dpeRating),
    livingArea: nullToUndefined(project.housing.livingArea),
    postalCode: nullToUndefined(project.housing.postalCode),

    // Costs
    totalCost: project.costs.totalCost,

    // Financial aid - remainingCost calculated automatically
    remainingCost,

    // Financing (if exists)
    financingMode: project.financing?.financingMode ?? undefined,
    loanAmount: nullToUndefined(project.financing?.loanAmount),
    interestRate: nullToUndefined(project.financing?.interestRate),
    loanDurationMonths: nullToUndefined(project.financing?.loanDurationMonths),
    downPayment: nullToUndefined(project.financing?.downPayment),
  };
};
