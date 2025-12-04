/**
 * Analyse l'historique complet des prix pour extraire taux récent et d'équilibre
 *
 * Ce module utilise l'historique complet (18-42 ans) de l'API DIDO pour:
 * 1. Calculer le taux récent (moyenne pondérée 70% sur 10 ans)
 * 2. Calculer le taux d'équilibre (moyenne hors crises sur tout l'historique)
 * 3. Générer automatiquement le modèle Mean Reversion optimal
 */

import { getDataFileRows } from "@/lib/getDataFileRows";
import { calculateRecentRate } from "@/lib/calculateRecentRate";
import { detectCrisisYears } from "@/lib/detectCrisisYears";
import { getEnergyTypeFromColumn } from "@/lib/getEnergyTypeFromColumn";
import { calculateEquilibriumRate } from "@/lib/calculateEquilibriumRate";

/**
 * Interface pour l'analyse d'historique des prix de l'énergie
 */
interface HistoricalAnalysis {
  tauxRecent: number; // Taux pondéré 70% sur 10 ans
  tauxEquilibre: number; // Taux moyen hors crises (long terme)
  yearsOfData: number; // Nombre d'années d'historique
  priceRecent: number; // Prix récent moyen (12 derniers mois)
  priceOldest: number; // Prix le plus ancien
  crisisYears: number[]; // Années identifiées comme crises
}

/**
 * Analyse l'historique complet des prix pour extraire taux récent et d'équilibre
 *
 * @param rid Identifiant DIDO du fichier de données
 * @param priceColumnName Nom de la colonne contenant les prix
 * @returns Analyse complète de l'historique
 */
export const analyzeEnergyPriceHistory = async (
  rid: string,
  priceColumnName: string
): Promise<HistoricalAnalysis> => {
  try {
    // Récupérer TOUT l'historique disponible
    const rows = await getDataFileRows(rid, 10000);

    if (rows.length < 24) {
      console.warn(`Historique insuffisant pour ${priceColumnName}`);
      throw new Error("Historique insuffisant");
    }

    // Extraire les prix mensuels (du plus récent au plus ancien)
    const monthlyPrices: number[] = rows
      .map((row: any) => parseFloat(row[priceColumnName]))
      .filter((price: number) => !isNaN(price) && price > 0);

    const yearsOfData = monthlyPrices.length / 12;

    console.log(
      `📊 Analyse historique ${priceColumnName}: ${monthlyPrices.length} mois (${yearsOfData.toFixed(1)} ans)`
    );

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

    // 3. Calcul du taux d'équilibre
    const energyType = getEnergyTypeFromColumn(priceColumnName);
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
      tauxRecent: Math.round(tauxRecent * 10) / 10,
      tauxEquilibre: Math.round(tauxEquilibre * 10) / 10,
      yearsOfData: Math.round(yearsOfData * 10) / 10,
      priceRecent: Math.round(recentAvg * 100) / 100,
      priceOldest: Math.round(oldestAvg * 100) / 100,
      crisisYears,
    };
  } catch (error) {
    console.error(`Erreur analyse historique ${priceColumnName}:`, error);
    throw error;
  }
};
