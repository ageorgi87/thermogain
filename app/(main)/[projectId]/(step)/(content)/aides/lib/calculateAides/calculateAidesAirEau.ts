"use server";

import type { ProjectDataForAides } from "@/app/(main)/[projectId]/(step)/(content)/aides/types/types";
import { postalCodeToInsee } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/postalCodeToInsee";
import type {
  PublicodesApiResponse,
  CalculateAidesResult,
} from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/calculateAides/types";
import { convertAnneeConstruction } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/calculateAides/helpers/convertAnneeConstruction";
import { extractAidesFromResponse } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/calculateAides/helpers/extractAidesFromResponse";

/**
 * URL de l'API Mes Aides Réno (Beta.gouv) - Publicodes
 * https://mesaidesreno.beta.gouv.fr/api-doc
 */
const MES_AIDES_RENO_API_URL = "https://mesaidesreno.beta.gouv.fr/api/v1/";

/**
 * Calcule les aides pour une PAC Air/Eau via l'API Mes Aides Réno
 *
 * Cette fonction :
 * 1. Convertit les données brutes du projet en paramètres API
 * 2. Construit l'URL API spécifique pour les PAC Air/Eau avec :
 *    - Paramètres CEE : usage "chauffage et eau chaude" + Etas "supérieur à 200%"
 *    - Field de calcul : gestes.chauffage.PAC.air-eau.montant
 * 3. Appelle l'API et extrait les montants MPR + CEE
 *
 * @param projectData - Données brutes du projet depuis la DB
 * @returns Montants des aides calculées (MPR, CEE, total)
 * @throws Error si l'API échoue ou retourne une erreur
 */
export const calculateAidesAirEau = async (
  projectData: ProjectDataForAides
): Promise<CalculateAidesResult> => {
  try {
    // Field name pour PAC air-eau
    const fieldName = "gestes.chauffage.PAC.air-eau.montant";
    const gesteKey = "gestes.chauffage.PAC.air-eau";

    // Convertir code postal en code INSEE
    const code_insee = await postalCodeToInsee(projectData.code_postal);

    // Construction des paramètres API pour PAC Air/Eau
    const apiParams: Record<string, string> = {
      // OBLIGATOIRE - Propriétaire
      "vous.propriétaire.statut": "'propriétaire'",

      // OBLIGATOIRE - Ménage
      "ménage.personnes": projectData.nombre_occupants.toString(),
      "ménage.revenu": projectData.revenu_fiscal_reference.toString(),

      // OBLIGATOIRE - Logement
      "logement.type": `'${projectData.type_logement}'`,
      "logement.surface": projectData.surface_logement.toString(),
      "logement.période de construction": `'${convertAnneeConstruction(projectData.annee_construction || undefined)}'`,
      "logement.propriétaire occupant": projectData.residence_principale
        ? "'oui'"
        : "'non'",
      "logement.résidence principale propriétaire":
        projectData.residence_principale ? "'oui'" : "'non'",
      "logement.commune": `'${code_insee}'`,
      "logement.adresse": `'Code INSEE ${code_insee}'`,

      // OBLIGATOIRE - Parcours d'aide
      "parcours d'aide": "'non accompagné'",

      // OBLIGATOIRE - Geste PAC Air/Eau
      [gesteKey]: "oui",

      // OBLIGATOIRE - CEE
      "CEE.projet.remplacement chaudière thermique":
        projectData.type_chauffage_actuel?.includes("chaudière") ? "oui" : "non",

      // SPÉCIFIQUE PAC AIR/EAU - Paramètres CEE
      [`${gesteKey}.CEE.usage`]: "'chauffage et eau chaude'",
      [`${gesteKey}.CEE.Etas`]: "'supérieur à 200 %'",
    };

    // Construire la query string
    const queryString =
      Object.entries(apiParams)
        .map(([key, value]) => `${key}=${value}`)
        .join("&") + `&fields=${fieldName}`;

    const url = `${MES_AIDES_RENO_API_URL}?${queryString}`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erreur API Mes Aides Réno (${response.status}): ${errorText}`
      );
    }

    const apiResponse: PublicodesApiResponse = await response.json();

    // Extraire le field de résultat
    const gesteField = apiResponse[fieldName];

    if (!gesteField) {
      throw new Error(`Réponse API invalide : field ${fieldName} manquant`);
    }

    // Extraire et retourner les montants des aides
    return extractAidesFromResponse(gesteField);
  } catch (error) {
    console.error("❌ Erreur lors du calcul des aides PAC Air/Eau:", error);

    if (error instanceof Error) {
      throw new Error(`Impossible de calculer les aides: ${error.message}`);
    }

    throw new Error("Erreur inconnue lors du calcul des aides");
  }
};
