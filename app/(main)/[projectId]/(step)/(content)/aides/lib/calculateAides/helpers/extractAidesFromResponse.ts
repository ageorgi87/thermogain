import type {
  PublicodesFieldResponse,
  CalculateAidesResult,
} from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/calculateAides/types";

/**
 * Extrait les montants MPR et CEE depuis la réponse de l'API Publicodes
 *
 * Cette logique est commune à tous les types de PAC (Air/Eau, Air/Air, Géothermique).
 *
 * @param gesteField - Réponse du field spécifique au type de PAC
 * @returns Résultat avec montants MPR, CEE, total et éligibilité
 */
export const extractAidesFromResponse = (
  gesteField: PublicodesFieldResponse
): CalculateAidesResult => {
  // Le total est dans rawValue
  const totalAid = gesteField.rawValue || 0;

  // Les détails MPR et CEE sont dans le champ "details"
  let maPrimeRenov = 0;
  let cee = 0;

  if (gesteField.details && Array.isArray(gesteField.details)) {
    // Trouver MPR dans les détails
    const mprDetail = gesteField.details.find((d) => d.MPR);
    if (mprDetail?.MPR?.rawValue) {
      maPrimeRenov = Math.round(mprDetail.MPR.rawValue);
    }

    // Trouver CEE ou Coup de pouce dans les détails
    const ceeDetail = gesteField.details.find((d) => d.CEE);
    if (ceeDetail?.CEE?.rawValue) {
      cee = Math.round(ceeDetail.CEE.rawValue);
    }

    // Si pas de CEE, chercher Coup de pouce
    if (cee === 0) {
      const coupDePouceDetail = gesteField.details.find(
        (d) => d["Coup de pouce"]
      );
      if (coupDePouceDetail?.["Coup de pouce"]?.rawValue) {
        cee = Math.round(coupDePouceDetail["Coup de pouce"].rawValue);
      }
    }
  }

  // Vérifier l'éligibilité
  const eligibleMaPrimeRenov = maPrimeRenov > 0;
  const eligibleCee = cee > 0;

  // Collecter les raisons d'inéligibilité depuis missingVariables
  const reasonsIneligibility: string[] = [];
  if (gesteField.missingVariables && gesteField.missingVariables.length > 0) {
    reasonsIneligibility.push(
      `Variables manquantes pour le calcul complet: ${gesteField.missingVariables.join(", ")}`
    );
  }

  return {
    maPrimeRenov,
    cee,
    totalAid,
    eligibleMaPrimeRenov,
    eligibleCee,
    reasonsIneligibility:
      reasonsIneligibility.length > 0 ? reasonsIneligibility : undefined,
  };
};
