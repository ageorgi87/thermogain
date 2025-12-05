"use server";

import { calculateAidesWithAPI } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/mesAidesRenoClient";
import { prepareApiParams } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/prepareApiParams";

interface CalculateAidesResult {
  success: boolean;
  data?: {
    ma_prime_renov: number;
    cee: number;
    total_aides: number;
    eligible_ma_prime_renov: boolean;
    eligible_cee: boolean;
    raisons_ineligibilite?: string[];
  };
  error?: string;
}

/**
 * Calcule les aides financières (MaPrimeRénov' et CEE) via l'API Mes Aides Réno
 * Action serveur appelée depuis le composant AidCalculator
 * Toutes les données nécessaires sont récupérées depuis la DB via projectId
 *
 * @param props - ID du projet
 * @returns Résultat du calcul avec montants des aides
 */
export const calculateAidesWithApi = async (
  projectId: string
): Promise<CalculateAidesResult> => {
  try {
    // Préparer les paramètres API à partir des données en DB
    const apiParams = await prepareApiParams(projectId);

    // Appeler l'API Mes Aides Réno (avec cache)
    const apiResponse = await calculateAidesWithAPI(apiParams);

    // Extraire les montants des aides
    const ma_prime_renov = apiResponse.aides.ma_prime_renov?.montant || 0;
    const cee = apiResponse.aides.cee?.montant || 0;
    const total_aides = apiResponse.total_aides;

    return {
      success: true,
      data: {
        ma_prime_renov,
        cee,
        total_aides,
        eligible_ma_prime_renov:
          apiResponse.eligibilite.eligible_ma_prime_renov,
        eligible_cee: apiResponse.eligibilite.eligible_cee,
        raisons_ineligibilite: apiResponse.eligibilite.raisons_ineligibilite,
      },
    };
  } catch (error) {
    console.error("❌ Erreur lors du calcul des aides:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erreur inconnue lors du calcul des aides",
    };
  }
};
