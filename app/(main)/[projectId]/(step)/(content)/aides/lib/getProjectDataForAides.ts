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
export const getProjectDataForAides = async (
  projectId: string
): Promise<ProjectDataForAides> => {
  // Récupérer toutes les données nécessaires du projet
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      logement: {
        select: {
          code_postal: true,
          annee_construction: true,
          nombre_occupants: true,
          classe_dpe: true,
        },
      },
      aides: {
        select: {
          type_logement: true,
          surface_logement: true,
          revenu_fiscal_reference: true,
          residence_principale: true,
        },
      },
      chauffageActuel: {
        select: {
          type_chauffage: true,
        },
      },
      projetPac: {
        select: {
          type_pac: true,
          cop_estime: true,
        },
      },
      couts: {
        select: {
          cout_pac: true,
          cout_installation: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error(`Projet ${projectId} non trouvé`);
  }

  // Vérifier les données requises
  if (!project.logement) {
    throw new Error("Données logement manquantes");
  }

  if (!project.logement.nombre_occupants) {
    throw new Error("Nombre d'occupants manquant");
  }

  if (!project.logement.classe_dpe) {
    throw new Error("Classe DPE manquante");
  }

  if (!project.projetPac) {
    throw new Error("Données PAC manquantes");
  }

  if (!project.couts) {
    throw new Error("Données coûts manquantes");
  }

  if (!project.aides) {
    throw new Error("Données aides manquantes");
  }

  if (!project.aides.type_logement) {
    throw new Error("Type de logement manquant");
  }

  if (!project.aides.surface_logement) {
    throw new Error("Surface du logement manquante");
  }

  if (!project.aides.revenu_fiscal_reference) {
    throw new Error("Revenu fiscal de référence manquant");
  }

  if (
    project.aides.residence_principale === null ||
    project.aides.residence_principale === undefined
  ) {
    throw new Error("Résidence principale manquante");
  }

  // Retourner les données brutes (pas de transformation)
  return {
    // Logement
    code_postal: project.logement.code_postal,
    annee_construction: project.logement.annee_construction,
    nombre_occupants: project.logement.nombre_occupants,
    classe_dpe: project.logement.classe_dpe as ClasseDPE,

    // Aides
    type_logement: project.aides.type_logement as "maison" | "appartement",
    surface_logement: project.aides.surface_logement,
    revenu_fiscal_reference: project.aides.revenu_fiscal_reference,
    residence_principale: project.aides.residence_principale,

    // Chauffage actuel
    type_chauffage_actuel: project.chauffageActuel?.type_chauffage || null,

    // Projet PAC
    type_pac: project.projetPac.type_pac,
    cop_estime: project.projetPac.cop_estime,

    // Coûts
    cout_pac: project.couts.cout_pac,
    cout_installation: project.couts.cout_installation,
  };
};
