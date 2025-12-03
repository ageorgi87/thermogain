/**
 * Types et interfaces pour l'analyse d'historique des prix de l'énergie
 */

export interface HistoricalAnalysis {
  tauxRecent: number          // Taux pondéré 70% sur 10 ans
  tauxEquilibre: number       // Taux moyen hors crises (long terme)
  yearsOfData: number         // Nombre d'années d'historique
  priceRecent: number         // Prix récent moyen (12 derniers mois)
  priceOldest: number         // Prix le plus ancien
  crisisYears: number[]       // Années identifiées comme crises
}
