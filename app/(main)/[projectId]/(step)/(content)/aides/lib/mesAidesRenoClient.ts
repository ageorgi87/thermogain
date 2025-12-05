"use server";

import type {
  MesAidesRenoRequestParams,
  MesAidesRenoResponse,
} from "@/app/(main)/[projectId]/(step)/(content)/aides/types/types";

/**
 * URL de l'API Mes Aides Réno (Beta.gouv)
 */
const MES_AIDES_RENO_API_URL =
  "https://mesaidesreno.beta.gouv.fr/api/calcul-aides";

/**
 * Calcule les aides disponibles via l'API Mes Aides Réno
 *
 * @param params - Paramètres du projet et du foyer
 * @returns Détail des aides calculées
 * @throws Error si l'API échoue ou retourne une erreur
 */
export const calculateAidesWithAPI = async (
  params: MesAidesRenoRequestParams
): Promise<MesAidesRenoResponse> => {
  console.log(`🌐 Appel API Mes Aides Réno`);

  try {
    const response = await fetch(MES_AIDES_RENO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Erreur API Mes Aides Réno (${response.status}): ${errorText}`
      );
    }

    const apiResponse: MesAidesRenoResponse = await response.json();

    console.log(`✅ Réponse API reçue`);

    return apiResponse;
  } catch (error) {
    console.error("❌ Erreur lors de l'appel API Mes Aides Réno:", error);

    if (error instanceof Error) {
      throw new Error(`Impossible de calculer les aides: ${error.message}`);
    }

    throw new Error("Erreur inconnue lors du calcul des aides");
  }
};
