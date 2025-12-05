"use server";

import { prisma } from "@/lib/prisma";
import { postalCodeToInsee } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/postalCodeToInsee";
import type { MesAidesRenoRequestParams } from "@/app/(main)/[projectId]/(step)/(content)/aides/types/types";

import type { ClasseDPE } from "@/types/dpe";

interface PrepareApiParamsInput {
  projectId: string;
  revenu_fiscal_reference: number;
  residence_principale: boolean;
  remplacement_complet: boolean;
}

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
 * Détermine le type de logement selon l'API
 * Note: L'information n'est pas collectée actuellement, on suppose "maison" par défaut
 */
const determineTypeLogement = (): "maison" | "appartement" => {
  // TODO: Ajouter cette information dans le step "logement" si nécessaire
  return "maison";
};

/**
 * Prépare les paramètres pour l'appel API Mes Aides Réno à partir des données projet
 *
 * @param input - Données du projet et du foyer
 * @returns Paramètres formatés pour l'API
 * @throws Error si des données requises sont manquantes
 */
export const prepareApiParams = async (
  input: PrepareApiParamsInput
): Promise<MesAidesRenoRequestParams> => {
  const {
    projectId,
    revenu_fiscal_reference,
    residence_principale,
    remplacement_complet,
  } = input;

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

  // Convertir code postal en code INSEE
  const code_insee = await postalCodeToInsee(project.logement.code_postal);

  // Calculer le coût total du projet
  const cout_projet = project.couts.cout_pac + project.couts.cout_installation;

  // Construire les paramètres API
  const params: MesAidesRenoRequestParams = {
    code_insee,
    revenu_fiscal_reference,
    nombre_personnes_menage: project.logement.nombre_occupants,
    type_logement: determineTypeLogement(),
    annee_construction: project.logement.annee_construction,
    classe_dpe: project.logement.classe_dpe as ClasseDPE,
    type_chauffage_actuel: project.chauffageActuel?.type_chauffage,
    type_travaux: mapTypePacToApiType(project.projetPac.type_pac),
    cout_projet,
  };

  return params;
};
