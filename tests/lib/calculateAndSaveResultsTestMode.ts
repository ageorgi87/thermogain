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
      couts: true,
      aides: true,
      financement: true,
    },
  });

  if (!project) {
    throw new Error(`Projet ${projectId} introuvable`);
  }

  if (
    !project.housing ||
    !project.currentHeating ||
    !project.heatPump ||
    !project.couts ||
    !project.aides
  ) {
    throw new Error(`Projet ${projectId} incomplet`);
  }

  // Mapper les données Prisma vers ProjectData
  const data: ProjectData = {
    // Housing
    code_postal: project.housing.postalCode,
    surface_logement: project.housing.livingArea,
    nombre_occupants: project.housing.numberOfOccupants,
    classe_dpe: project.housing.dpeRating ?? undefined,

    // Chauffage actuel
    type_chauffage: project.currentHeating.heatingType,
    ecs_integrated: project.currentHeating.dhwIntegrated ?? undefined,
    conso_fioul_litres: project.currentHeating.fuelConsumptionLiters ?? undefined,
    prix_fioul_litre: project.currentHeating.fuelPricePerLiter ?? undefined,
    conso_gaz_kwh: project.currentHeating.gasConsumptionKwh ?? undefined,
    prix_gaz_kwh: project.currentHeating.gasPricePerKwh ?? undefined,
    conso_gpl_kg: project.currentHeating.lpgConsumptionKg ?? undefined,
    prix_gpl_kg: project.currentHeating.lpgPricePerKg ?? undefined,
    conso_pellets_kg: project.currentHeating.pelletsConsumptionKg ?? undefined,
    prix_pellets_kg: project.currentHeating.pelletsPricePerKg ?? undefined,
    conso_bois_steres: project.currentHeating.woodConsumptionSteres ?? undefined,
    prix_bois_stere: project.currentHeating.woodPricePerStere ?? undefined,
    conso_elec_kwh: project.currentHeating.electricityConsumptionKwh ?? undefined,
    prix_elec_kwh: project.currentHeating.electricityPricePerKwh ?? undefined,
    cop_actuel: project.currentHeating.currentCop ?? undefined,
    conso_pac_kwh: project.currentHeating.heatPumpConsumptionKwh ?? undefined,
    abonnement_gaz: project.currentHeating.gasSubscription ?? undefined,
    entretien_annuel: project.currentHeating.annualMaintenance ?? undefined,

    // ECS (si séparé)
    type_ecs: project.dhw?.dhwSystemType ?? undefined,
    conso_ecs_kwh: project.dhw?.dhwConsumptionKwh ?? undefined,
    prix_ecs_kwh: project.dhw?.dhwEnergyPricePerKwh ?? undefined,
    entretien_ecs: project.dhw?.dhwAnnualMaintenance ?? undefined,

    // Projet PAC
    type_pac: project.heatPump.heatPumpType,
    puissance_pac_kw: project.heatPump.heatPumpPowerKw ?? 0,
    cop_estime: project.heatPump.estimatedCop ?? 0,
    cop_ajuste: project.heatPump.adjustedCop ?? 0,
    emetteurs: project.heatPump.emitters ?? "",
    duree_vie_pac: project.heatPump.heatPumpLifespanYears ?? 17,
    prix_elec_pac:
      project.heatPump.heatPumpElectricityPricePerKwh ?? project.heatPump.electricityPricePerKwh ?? undefined,
    puissance_souscrite_actuelle: project.heatPump.currentSubscribedPowerKva ?? undefined,
    puissance_souscrite_pac: project.heatPump.heatPumpSubscribedPowerKva ?? undefined,
    entretien_pac_annuel: project.heatPump.annualMaintenanceCost ?? undefined,
    with_ecs_management: project.heatPump.withDhwManagement ?? undefined,
    cop_ecs: project.heatPump.dhwCop ?? undefined,

    // Coûts
    cout_total: project.couts.cout_total,

    // Reste à charge = coût total - aides
    reste_a_charge: project.couts.cout_total - project.aides.total_aides,

    // Financement
    mode_financement: project.financement?.mode_financement ?? undefined,
    apport_personnel: project.financement?.apport_personnel ?? undefined,
    montant_credit: project.financement?.montant_credit ?? undefined,
    taux_interet: project.financement?.taux_interet ?? undefined,
    duree_credit_mois: project.financement?.duree_credit_mois ?? undefined,
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
