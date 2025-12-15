"use server";

import { prisma } from "@/lib/prisma";
import type { ProjectDataForAides } from "@/app/(main)/[projectId]/(step)/(content)/aides/types/types";
import type { ClasseDPE } from "@/types/dpe";

/**
 * Récupère les données brutes du projet depuis la DB pour le calcul des aides
 *
 * Cette fonction ne fait AUCUNE transformation - elle retourne les données telles quelles.
 * Le formatage pour l'API Mes Aides Réno est fait dans chaque calculateAidesXXX.
 *
 * @param projectId - ID du projet
 * @returns Données brutes du projet
 * @throws Error si des données requises sont manquantes
 */
export const getProjectDataForFinancialAid = async (
  projectId: string
): Promise<ProjectDataForAides> => {
  // Récupérer toutes les données nécessaires du projet
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      housing: {
        select: {
          postalCode: true,
          constructionYear: true,
          numberOfOccupants: true,
          dpeRating: true,
          livingArea: true,
        },
      },
      financialAid: {
        select: {
          housingType: true,
          referenceTaxIncome: true,
          isPrimaryResidence: true,
        },
      },
      currentHeating: {
        select: {
          heatingType: true,
        },
      },
      heatPump: {
        select: {
          heatPumpType: true,
          estimatedCop: true,
        },
      },
      costs: {
        select: {
          heatPumpCost: true,
          installationCost: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error(`Projet ${projectId} non trouvé`);
  }

  // Vérifier les données requises
  if (!project.housing) {
    throw new Error("Données logement manquantes");
  }

  if (!project.housing.numberOfOccupants) {
    throw new Error("Nombre d'occupants manquant");
  }

  if (!project.housing.dpeRating) {
    throw new Error("Classe DPE manquante");
  }

  if (!project.housing.livingArea) {
    throw new Error("Surface logement manquante");
  }

  if (!project.heatPump) {
    throw new Error("Données PAC manquantes");
  }

  if (!project.costs) {
    throw new Error("Données coûts manquantes");
  }

  if (!project.financialAid) {
    throw new Error("Données aides manquantes");
  }

  if (!project.financialAid.housingType) {
    throw new Error("Type de logement manquant");
  }

  if (!project.financialAid.referenceTaxIncome) {
    throw new Error("Revenu fiscal de référence manquant");
  }

  if (
    project.financialAid.isPrimaryResidence === null ||
    project.financialAid.isPrimaryResidence === undefined
  ) {
    throw new Error("Résidence principale manquante");
  }

  // Retourner les données brutes (pas de transformation)
  return {
    // Logement
    code_postal: project.housing.postalCode,
    annee_construction: project.housing.constructionYear,
    nombre_occupants: project.housing.numberOfOccupants,
    classe_dpe: project.housing.dpeRating as ClasseDPE,
    surface_logement: project.housing.livingArea,

    // Aides (critères utilisateur)
    type_logement: project.financialAid.housingType as "maison" | "appartement",
    revenu_fiscal_reference: project.financialAid.referenceTaxIncome,
    residence_principale: project.financialAid.isPrimaryResidence,

    // Chauffage actuel
    type_chauffage_actuel: project.currentHeating?.heatingType || null,

    // Projet PAC
    type_pac: project.heatPump.heatPumpType,
    cop_estime: project.heatPump.estimatedCop!,

    // Coûts
    cout_pac: project.costs.heatPumpCost,
    cout_installation: project.costs.installationCost,
  };
};
