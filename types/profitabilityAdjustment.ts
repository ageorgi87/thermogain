/**
 * Coefficients d'ajustement de rentabilité pour le calcul de consommation PAC
 *
 * Permet d'ajuster artificiellement la consommation calculée de la PAC
 * pour augmenter ou diminuer la rentabilité apparente du projet.
 *
 * Les valeurs représentent le coefficient multiplicateur appliqué à la consommation:
 * - 0.80 = Réduction de 20% de la consommation (augmentation très forte de rentabilité)
 * - 1.00 = Aucun ajustement (neutre)
 */
export enum ProfitabilityAdjustment {
  VERY_STRONG = 0.80, // -20%
  STRONG = 0.85,      // -15%
  MEDIUM = 0.90,      // -10%
  WEAK = 0.95,        // -5%
  NEUTRAL = 1.00,     // 0%
}
