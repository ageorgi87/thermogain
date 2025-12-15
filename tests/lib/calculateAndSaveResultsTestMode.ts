/**
 * Version de calculateAndSaveResults adaptée pour les tests E2E
 * Bypass l'authentification NextAuth qui nécessite un contexte HTTP
 */

import { prisma } from "@/lib/prisma";
import type { ProjectData } from "@/types/projectData";
import { calculateAllResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateAllResults";
import { saveProjectResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/mutations/saveProjectResults";

/**
 * Récupère les données du projet sans vérification d'authentification
 * Version allégée pour les tests uniquement
 */
const getProjectDataForCalculationsTestMode = async (
  projectId: string
): Promise<ProjectData> => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      housing: true,
      currentHeating: true,
      dhw: true,
      heatPump: true,
      costs: true,
      financialAid: true,
      financing: true,
    },
  });

  if (!project) {
    throw new Error(`Projet ${projectId} introuvable`);
  }

  if (
    !project.housing ||
    !project.currentHeating ||
    !project.heatPump ||
    !project.costs ||
    !project.financialAid
  ) {
    throw new Error(`Projet ${projectId} incomplet`);
  }

  // Calculate remaining cost
  const remainingCost = project.costs.totalCost - project.financialAid.totalAid;

  // Helper to convert null to undefined
  const nullToUndefined = <T>(value: T | null): T | undefined => value ?? undefined;

  // Map Prisma data to ProjectData using English field names
  const data: ProjectData = {
    // Current heating data - with null converted to undefined
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
    heatPumpPowerKw: project.heatPump.heatPumpPowerKw ?? 0,
    estimatedCop: project.heatPump.estimatedCop ?? 0,
    adjustedCop: project.heatPump.adjustedCop ?? 0,
    emitters: project.heatPump.emitters ?? "",
    heatPumpLifespanYears: project.heatPump.heatPumpLifespanYears ?? 17,
    currentSubscribedPowerKva: nullToUndefined(project.heatPump.currentSubscribedPowerKva),
    heatPumpSubscribedPowerKva: nullToUndefined(project.heatPump.heatPumpSubscribedPowerKva),
    annualMaintenanceCost: nullToUndefined(project.heatPump.annualMaintenanceCost),
    heatPumpElectricityPricePerKwh: project.heatPump.heatPumpElectricityPricePerKwh ?? project.heatPump.electricityPricePerKwh ?? undefined,
    withDhwManagement: nullToUndefined(project.heatPump.withDhwManagement),
    dhwCop: nullToUndefined(project.heatPump.dhwCop),

    // Housing data (selected fields)
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

  return data;
};

/**
 * Calcule et sauvegarde les résultats pour un projet (mode test)
 * Version sans authentification pour les tests E2E
 */
export const calculateAndSaveResultsTestMode = async (
  projectId: string
): Promise<void> => {
  try {
    // 1. Récupérer les données du projet
    const data = await getProjectDataForCalculationsTestMode(projectId);

    // 2. Calculer tous les résultats
    const results = await calculateAllResults(data);

    // 3. Sauvegarder dans la base de données
    await saveProjectResults(projectId, results);
  } catch (error) {
    console.error(
      `❌ Erreur lors du calcul et de la sauvegarde des résultats pour le projet ${projectId}:`,
      error
    );
    throw error;
  }
};
