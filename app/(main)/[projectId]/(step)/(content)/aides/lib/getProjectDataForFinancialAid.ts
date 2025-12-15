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

  // Retourner les données brutes (English field names matching DB schema)
  return {
    // Housing
    postalCode: project.housing.postalCode,
    constructionYear: project.housing.constructionYear,
    numberOfOccupants: project.housing.numberOfOccupants,
    dpeRating: project.housing.dpeRating as ClasseDPE,
    livingArea: project.housing.livingArea,

    // Financial aid criteria (user input)
    housingType: project.financialAid.housingType as "maison" | "appartement",
    taxIncomeReference: project.financialAid.referenceTaxIncome,
    primaryResidence: project.financialAid.isPrimaryResidence,

    // Current heating
    currentHeatingType: project.currentHeating?.heatingType || null,

    // Heat pump project
    heatPumpType: project.heatPump.heatPumpType,
    estimatedCop: project.heatPump.estimatedCop!,

    // Costs
    heatPumpCost: project.costs.heatPumpCost,
    installationCost: project.costs.installationCost,
  };
};
