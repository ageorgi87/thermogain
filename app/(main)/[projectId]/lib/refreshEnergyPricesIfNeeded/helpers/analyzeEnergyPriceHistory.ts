/**
 * Analyse l'historique complet des prix pour extraire taux récent et d'équilibre
 *
 * Ce module utilise l'historique complet (18-42 ans) de l'API DIDO pour:
 * 1. Calculer le taux récent (moyenne pondérée 70% sur 10 ans)
 * 2. Calculer le taux d'équilibre (moyenne hors crises sur tout l'historique)
 * 3. Générer automatiquement le modèle Mean Reversion optimal
 */

import { getDidoColumnNameFromEnergyType } from "@/app/(main)/[projectId]/(step)/(content)/informations/config/didoColumnMappings";
import { ENERGY_ANALYSIS_PARAMS } from "@/config/constants";
import type { ApiEnergyType } from "@/types/energyType";
import { roundToDecimals } from "@/lib/utils/roundToDecimals";

/**
 * Calcule le taux d'évolution récent pondéré (70% sur 10 ans + 30% long terme)
 *
 * Cette pondération permet de capturer la volatilité récente tout en restant
 * ancré dans la tendance structurelle long terme.
 */
const calculateRecentRate = (
  monthlyPrices: number[],
  yearsOfData: number
): number => {
  const recentAvg = monthlyPrices.slice(0, 12).reduce((a, b) => a + b, 0) / 12;

  // Long terme: toute la période
  const oldestStartIndex = Math.max(monthlyPrices.length - 12, 0);
  const oldestAvg =
    monthlyPrices
      .slice(oldestStartIndex, oldestStartIndex + 12)
      .reduce((a, b) => a + b, 0) / 12;

  const evolutionLongTerm =
    (((recentAvg - oldestAvg) / oldestAvg) * 100) / yearsOfData;

  // 10 dernières années (si disponible)
  let evolution10y = evolutionLongTerm;
  if (monthlyPrices.length >= 120) {
    const avg10yAgo =
      monthlyPrices.slice(108, 120).reduce((a, b) => a + b, 0) / 12;
    evolution10y = (((recentAvg - avg10yAgo) / avg10yAgo) * 100) / 10;
  }

  const { SHORT_TERM, LONG_TERM } =
    ENERGY_ANALYSIS_PARAMS.RECENT_RATE_WEIGHTING;
  const tauxRecent = evolutionLongTerm * LONG_TERM + evolution10y * SHORT_TERM;

  return tauxRecent;
};

/**
 * Détecte les années de crise dans l'historique des prix
 *
 * Une année est considérée comme année de crise si l'évolution annuelle
 * dépasse le seuil défini (par défaut 10%/an).
 */
const detectCrisisYears = (annualEvolutions: number[]): number[] => {
  const crisisYears: number[] = [];
  const { CRISIS_THRESHOLD } = ENERGY_ANALYSIS_PARAMS;

  annualEvolutions.forEach((evolution, idx) => {
    if (Math.abs(evolution) > CRISIS_THRESHOLD) {
      crisisYears.push(idx + 1); // +1 car évolution année N vs N-1
    }
  });

  return crisisYears;
};

/**
 * Calcule le taux d'équilibre long terme selon l'approche académique
 *
 * Au lieu d'utiliser la moyenne historique (souvent négative à cause de la dérégulation),
 * utilise l'approche académique: Inflation + Facteurs structurels spécifiques à chaque énergie.
 *
 * Sources:
 * - INSEE: Inflation moyenne long terme France ≈ 2%/an
 * - Croissance demande énergie: ~1-1,5%/an
 *
 * Les prix de l'énergie sur le long terme suivent:
 * - L'inflation générale (coûts de production, salaires, etc.)
 * - La croissance de la demande
 * - Moins les gains d'efficacité (ENR pour électricité, efficacité extraction pour gaz)
 */
const calculateEquilibriumRate = (
  energyType: ApiEnergyType,
  annualEvolutions: number[],
  crisisYears: number[]
): number => {
  const { EQUILIBRIUM_RATES, CRISIS_THRESHOLD } = ENERGY_ANALYSIS_PARAMS;

  // Taux théorique selon le type d'énergie
  let tauxEquilibre: number = EQUILIBRIUM_RATES[energyType];

  // Validation: comparer avec moyenne hors crises (si disponible)
  const normalEvolutions = annualEvolutions.filter(
    (evolution, idx) =>
      !crisisYears.includes(idx + 1) && Math.abs(evolution) <= CRISIS_THRESHOLD
  );

  if (normalEvolutions.length >= 5) {
    const moyenneHorsCrises =
      normalEvolutions.reduce((a, b) => a + b, 0) / normalEvolutions.length;

    // Si la moyenne historique est positive et raisonnable, on peut l'ajuster légèrement
    if (moyenneHorsCrises > 0 && moyenneHorsCrises < 10) {
      // Mix 80% théorique + 20% empirique
      const tauxAjuste = tauxEquilibre * 0.8 + moyenneHorsCrises * 0.2;

      tauxEquilibre = tauxAjuste;
    }
  }

  return tauxEquilibre;
};

/**
 * Interface pour l'analyse d'historique des prix de l'énergie
 */
interface HistoricalAnalysis {
  recentRate: number; // Taux pondéré 70% sur 10 ans
  equilibriumRate: number; // Taux moyen hors crises (long terme)
  yearsOfData: number; // Nombre d'années d'historique
  priceRecent: number; // Prix récent moyen (12 derniers mois)
  priceOldest: number; // Prix le plus ancien
  crisisYears: number[]; // Années identifiées comme crises
}

/**
 * Analyse l'historique complet des prix pour extraire taux récent et d'équilibre
 *
 * @param didoMonthlyEnergyPriceData Données mensuelles de prix énergétiques de l'API DIDO (historique complet)
 * @param energyType Type d'énergie (utilisé pour obtenir le nom de colonne et les taux)
 * @returns Analyse complète de l'historique
 */
export const analyzeEnergyPriceHistory = async (
  didoMonthlyEnergyPriceData: any[],
  energyType: ApiEnergyType
): Promise<HistoricalAnalysis> => {
  try {
    // Conversion early: obtenir le nom de colonne depuis les mappings centralisés
    const priceColumnName = getDidoColumnNameFromEnergyType(energyType);

    if (didoMonthlyEnergyPriceData.length < 24) {
      console.warn(`Historique insuffisant pour ${energyType}`);
      throw new Error("Historique insuffisant");
    }

    // Extraire les prix mensuels (du plus récent au plus ancien)
    const monthlyPrices: number[] = didoMonthlyEnergyPriceData
      .map((row: any) => parseFloat(row[priceColumnName]))
      .filter((price: number) => !isNaN(price) && price > 0);

    const yearsOfData = monthlyPrices.length / 12;

    // Calculer les moyennes annuelles pour détecter les crises
    const annualAverages: number[] = [];
    const annualEvolutions: number[] = [];

    for (let year = 0; year < Math.floor(yearsOfData); year++) {
      const startIdx = year * 12;
      const endIdx = startIdx + 12;
      const yearPrices = monthlyPrices.slice(startIdx, endIdx);

      if (yearPrices.length === 12) {
        const avg = yearPrices.reduce((a, b) => a + b, 0) / 12;
        annualAverages.push(avg);

        // Calculer l'évolution vs année précédente
        if (annualAverages.length > 1) {
          const prevAvg = annualAverages[annualAverages.length - 2];
          const evolution = ((avg - prevAvg) / prevAvg) * 100;
          annualEvolutions.push(evolution);
        }
      }
    }

    // 1. Calcul du taux récent
    const tauxRecent = calculateRecentRate(monthlyPrices, yearsOfData);

    // 2. Détection des années de crise
    const crisisYears = detectCrisisYears(annualEvolutions);

    // 3. Calcul du taux d'équilibre (utilise directement energyType)
    const tauxEquilibre = calculateEquilibriumRate(
      energyType,
      annualEvolutions,
      crisisYears
    );

    // Calcul des prix récent et ancien pour référence
    const recentAvg =
      monthlyPrices.slice(0, 12).reduce((a, b) => a + b, 0) / 12;
    const oldestStartIndex = Math.max(monthlyPrices.length - 12, 0);
    const oldestAvg =
      monthlyPrices
        .slice(oldestStartIndex, oldestStartIndex + 12)
        .reduce((a, b) => a + b, 0) / 12;

    return {
      recentRate: roundToDecimals(tauxRecent, 1),
      equilibriumRate: roundToDecimals(tauxEquilibre, 1),
      yearsOfData: roundToDecimals(yearsOfData, 1),
      priceRecent: roundToDecimals(recentAvg, 2),
      priceOldest: roundToDecimals(oldestAvg, 2),
      crisisYears,
    };
  } catch (error) {
    console.error(`Erreur analyse historique ${energyType}:`, error);
    throw error;
  }
};
