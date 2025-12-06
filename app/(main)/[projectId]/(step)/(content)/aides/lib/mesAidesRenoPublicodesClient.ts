"use server";

import type { MesAidesRenoRequestParams } from "@/app/(main)/[projectId]/(step)/(content)/aides/types/types";

/**
 * URL de l'API Mes Aides Réno (Beta.gouv) - Publicodes
 * https://mesaidesreno.beta.gouv.fr/api-doc
 */
const MES_AIDES_RENO_API_URL = "https://mesaidesreno.beta.gouv.fr/api/v1/";

/**
 * Détail d'une aide spécifique (MPR, CEE, Coup de pouce)
 */
interface AideDetail {
  label: string;
  rawValue: number | null;
  formattedValue: string;
  missingVariables?: string[];
}

/**
 * Réponse de l'API Publicodes pour un field spécifique
 */
interface PublicodesFieldResponse {
  label: string;
  rawValue: number | null;
  formattedValue: string;
  missingVariables?: string[];
  details?: Array<{
    MPR?: AideDetail;
    CEE?: AideDetail;
    "Coup de pouce"?: AideDetail;
  }>;
}

/**
 * Réponse complète de l'API Publicodes
 */
export interface PublicodesApiResponse {
  [fieldName: string]: PublicodesFieldResponse;
}

/**
 * Convertit l'année de construction en période Publicodes
 * Valeurs valides: "moins de 2 ans" | "de 2 à 10 ans" | "de 10 à 15 ans" | "au moins 15 ans"
 */
const convertAnneeConstruction = (annee?: number): string => {
  if (!annee) return "au moins 15 ans";
  const age = new Date().getFullYear() - annee;
  if (age < 2) return "moins de 2 ans";
  if (age < 10) return "de 2 à 10 ans";
  if (age < 15) return "de 10 à 15 ans";
  return "au moins 15 ans";
};

/**
 * Construit les paramètres Publicodes pour l'API
 * IMPORTANT : Les valeurs STRING doivent être entre guillemets simples
 * Seuls les champs OBLIGATOIRES sont inclus (testés et validés)
 */
const buildPublicodesParams = (
  params: MesAidesRenoRequestParams
): Record<string, string> => {

  return {
    // OBLIGATOIRE - Propriétaire
    "vous.propriétaire.statut": "'propriétaire'",

    // OBLIGATOIRE - Ménage
    "ménage.personnes": params.nombre_personnes_menage.toString(),
    "ménage.revenu": params.revenu_fiscal_reference.toString(),

    // OBLIGATOIRE - Logement
    "logement.type": `'${params.type_logement}'`,
    "logement.surface": params.surface_logement.toString(),
    "logement.période de construction": `'${convertAnneeConstruction(params.annee_construction)}'`,
    "logement.propriétaire occupant": params.residence_principale ? "'oui'" : "'non'";,
    "logement.résidence principale propriétaire": params.residence_principale ? "'oui'" : "'non'";,
    "logement.commune": `'${params.code_insee}'`,
    "logement.adresse": `'Code INSEE ${params.code_insee}'`,

    // OBLIGATOIRE - Parcours d'aide
    "parcours d'aide": "'non accompagné'",

    // OBLIGATOIRE - Geste PAC air-eau
    "gestes.chauffage.PAC.air-eau": "oui",
    "gestes.chauffage.PAC.air-eau.CEE.usage": "'chauffage et eau chaude'",
    "gestes.chauffage.PAC.air-eau.CEE.Etas": "'supérieur à 200 %'",

    // OBLIGATOIRE - CEE
    "CEE.projet.remplacement chaudière thermique":
      params.type_chauffage_actuel?.includes("chaudière") ? "oui" : "non",
  };
};

/**
 * Calcule les aides disponibles via l'API Mes Aides Réno (Publicodes)
 *
 * @param params - Paramètres du projet et du foyer
 * @returns Détail des aides calculées
 * @throws Error si l'API échoue ou retourne une erreur
 */
export const calculateAidesWithPublicodesAPI = async (
  params: MesAidesRenoRequestParams
): Promise<PublicodesApiResponse> => {
  try {
    // Construire les paramètres Publicodes
    const publicodesParams = buildPublicodesParams(params);

    // Construire la query string
    // IMPORTANT: NE PAS encoder les clés, seulement les valeurs SI NÉCESSAIRE
    // Les guillemets simples et valeurs passent tels quels
    const queryString =
      Object.entries(publicodesParams)
        .map(([key, value]) => `${key}=${value}`)
        .join("&") +
      // Field pour obtenir le montant total avec détails MPR + CEE
      "&fields=gestes.chauffage.PAC.air-eau.montant";

    const url = `${MES_AIDES_RENO_API_URL}?${queryString}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erreur API Mes Aides Réno (${response.status}): ${errorText}`
      );
    }

    const apiResponse: PublicodesApiResponse = await response.json();

    // Vérifier s'il y a des variables manquantes
    for (const [fieldName, fieldData] of Object.entries(apiResponse)) {
      if (fieldData.missingVariables && fieldData.missingVariables.length > 0) {
        console.warn(
          `⚠️  Variables manquantes pour ${fieldName}:`,
          fieldData.missingVariables
        );
      }
    }

    return apiResponse;
  } catch (error) {
    console.error("❌ Erreur lors de l'appel API Mes Aides Réno:", error);

    if (error instanceof Error) {
      throw new Error(`Impossible de calculer les aides: ${error.message}`);
    }

    throw new Error("Erreur inconnue lors du calcul des aides");
  }
};
