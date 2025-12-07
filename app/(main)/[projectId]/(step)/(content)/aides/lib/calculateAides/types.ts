/**
 * Types communs pour les fonctions calculateAidesXXX
 */

/**
 * Détail d'une aide spécifique (MPR, CEE, Coup de pouce)
 */
export interface AideDetail {
  label: string;
  rawValue: number | null;
  formattedValue: string;
  missingVariables?: string[];
}

/**
 * Réponse de l'API Publicodes pour un field spécifique
 */
export interface PublicodesFieldResponse {
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
 * Résultat du calcul des aides (retour de calculateAidesXXX)
 */
export interface CalculateAidesResult {
  ma_prime_renov: number;
  cee: number;
  total_aides: number;
  eligible_ma_prime_renov: boolean;
  eligible_cee: boolean;
  raisons_ineligibilite?: string[];
}
