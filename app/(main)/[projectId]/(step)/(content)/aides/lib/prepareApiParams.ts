"use server";

import { prisma } from "@/lib/prisma";
import { postalCodeToInsee } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/postalCodeToInsee";
import type { MesAidesRenoRequestParams } from "@/app/(main)/[projectId]/(step)/(content)/aides/types/types";

import type { ClasseDPE } from "@/types/dpe";
import { TypeLogement } from "@/app/(main)/[projectId]/(step)/(content)/logement/types/logement";

/**
 * Mappe le type de PAC ThermoGain vers le type attendu par l'API Mes Aides Réno
 */
const mapTypePacToApiType = (typePac: string): string => {
  const mapping: Record<string, string> = {
    "PAC Air/Eau": "pac_air_eau",
    "PAC Eau/Eau": "pac_eau_eau",
    "PAC Air/Air": "pac_air_air",
  };

  return mapping[typePac] || "pac_air_eau"; // Fallback
};

/**
 * Prépare les paramètres pour l'appel API Mes Aides Réno à partir des données projet
 *
 * @param projectId - ID du projet
 * @returns Paramètres formatés pour l'API
 * @throws Error si des données requises sont manquantes
 */
export const prepareApiParams = async (
  projectId: string
): Promise<MesAidesRenoRequestParams> => {

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
          revenu_fiscal_reference: true,
          residence_principale: true,
          remplacement_complet: true,
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

  if (!project.aides.revenu_fiscal_reference) {
    throw new Error("Revenu fiscal de référence manquant");
  }

  if (project.aides.residence_principale === null || project.aides.residence_principale === undefined) {
    throw new Error("Résidence principale manquante");
  }

  if (project.aides.remplacement_complet === null || project.aides.remplacement_complet === undefined) {
    throw new Error("Remplacement complet manquant");
  }

  // Convertir code postal en code INSEE
  const code_insee = await postalCodeToInsee(project.logement.code_postal);

  // Calculer le coût total du projet
  const cout_projet = project.couts.cout_pac + project.couts.cout_installation;

  // Construire les paramètres API (toutes les données proviennent de la DB)
  const params: MesAidesRenoRequestParams = {
    code_insee,
    revenu_fiscal_reference: project.aides.revenu_fiscal_reference,
    nombre_personnes_menage: project.logement.nombre_occupants,
    type_logement: project.aides.type_logement as TypeLogement,
    annee_construction: project.logement.annee_construction,
    classe_dpe: project.logement.classe_dpe as ClasseDPE,
    type_chauffage_actuel: project.chauffageActuel?.type_chauffage,
    type_travaux: mapTypePacToApiType(project.projetPac.type_pac),
    cout_projet,
  };

  return params;
};
