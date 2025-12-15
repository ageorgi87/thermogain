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
 * - evolutions (deprecated depuis novembre 2024)
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
  // (exclut user et evolutions pour réduire la charge)
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      housing: true,
      currentHeating: true,
      dhw: true, // Données DHW (Domestic Hot Water) séparé (si dhwIntegrated = false)
      heatPump: true,
      costs: true,
      financialAid: true,
      financement: true,
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
  const reste_a_charge = project.costs.totalCost - project.financialAid.totalAid;

  // Mapper vers le format ProjectData utilisé par les calculs
  return {
    // Chauffage actuel
    type_chauffage: project.currentHeating.heatingType,
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
    puissance_souscrite_actuelle: project.heatPump.currentSubscribedPowerKva ?? undefined,
    abonnement_gaz: project.currentHeating.gasSubscription ?? undefined,
    entretien_annuel: project.currentHeating.annualMaintenance,
    ecs_integrated: project.currentHeating.dhwIntegrated ?? undefined,

    // ECS séparé (si ecs_integrated = false)
    type_ecs: project.dhw?.dhwSystemType ?? undefined,
    conso_ecs_kwh: project.dhw?.dhwConsumptionKwh ?? undefined,
    prix_ecs_kwh: project.dhw?.dhwEnergyPricePerKwh ?? undefined,
    entretien_ecs: project.dhw?.dhwAnnualMaintenance ?? undefined,

    // Projet PAC
    type_pac: project.heatPump.heatPumpType,
    puissance_pac_kw: project.heatPump.heatPumpPowerKw!,
    cop_estime: project.heatPump.estimatedCop!,
    cop_ajuste: project.heatPump.adjustedCop!, // COP réel ajusté stocké en DB
    emetteurs: project.heatPump.emitters ?? "Radiateurs basse température", // Valeur par défaut (détermine auto la température)
    duree_vie_pac: project.heatPump.heatPumpLifespanYears!,
    puissance_souscrite_pac: project.heatPump.heatPumpSubscribedPowerKva!,
    entretien_pac_annuel: project.heatPump.annualMaintenanceCost!,
    // Prix élec PAC: priorité à heatPumpElectricityPricePerKwh (tarif spécifique), sinon electricityPricePerKwh (tarif standard)
    prix_elec_pac: project.heatPump.heatPumpElectricityPricePerKwh ?? project.heatPump.electricityPricePerKwh ?? undefined,
    with_ecs_management: project.heatPump.withDhwManagement ?? undefined,
    cop_ecs: project.heatPump.dhwCop ?? undefined,

    // Logement (pour estimation ECS + besoins énergétiques DPE)
    nombre_occupants: project.housing.numberOfOccupants ?? undefined,
    classe_dpe: project.housing.dpeRating ?? undefined,
    surface_logement: project.housing.livingArea ?? undefined,

    // Code postal pour ajustement climatique
    code_postal: project.housing.postalCode ?? undefined,

    // Coûts
    cout_total: project.costs.totalCost,

    // Aides - reste_a_charge calculé automatiquement
    reste_a_charge,

    // Financement
    mode_financement: project.financement?.mode_financement ?? undefined,
    montant_credit: project.financement?.montant_credit ?? undefined,
    taux_interet: project.financement?.taux_interet ?? undefined,
    duree_credit_mois: project.financement?.duree_credit_mois ?? undefined,
    apport_personnel: project.financement?.apport_personnel ?? undefined,
  };
};
