import type { EnergyEvolutionModel } from "@/types/energy";
import { EnergyType, type ApiEnergyType } from "@/types/energyType";
import { DATAFILE_RIDS } from "@/app/(main)/[projectId]/(step)/(content)/informations/config/datafileRids";
import { getDidoColumnNameFromEnergyType } from "@/app/(main)/[projectId]/(step)/(content)/informations/config/didoColumnMappings";
import { analyzeEnergyPriceHistory } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/analyzeEnergyPriceHistory";
import { getDataFileRows } from "@/app/(main)/[projectId]/(step)/(content)/informations/queries/getDataFileRows";

/**
 * Calcule le prix actuel moyen d'une énergie (moyenne des 12 derniers mois)
 * à partir des données déjà récupérées de l'API DIDO
 *
 * @param rows Données brutes de l'API DIDO
 * @param priceColumnName Nom de la colonne contenant le prix
 * @param energyType Type d'énergie
 * @returns Prix moyen en €/kWh
 * @throws Error si les données ne sont pas disponibles
 */
const calculateCurrentPrice = (
  rows: any[],
  priceColumnName: string,
  energyType: string
): number => {
  if (rows.length === 0) {
    throw new Error(
      `Aucune donnée de prix disponible pour ${energyType} depuis l'API DIDO`
    );
  }

  // Prendre les 12 derniers mois (les plus récents)
  const recentRows = rows.slice(0, 12);

  // Extraire les prix et calculer la moyenne
  const prices: number[] = recentRows
    .map((row: any) => parseFloat(row[priceColumnName]))
    .filter((price: number) => !isNaN(price) && price > 0);

  if (prices.length === 0) {
    throw new Error(
      `Aucun prix valide trouvé pour ${energyType} dans les données DIDO`
    );
  }

  // Calculer la moyenne des prix des 12 derniers mois
  const averagePrice =
    prices.reduce((sum, price) => sum + price, 0) / prices.length;

  // Les prix dans l'API sont en €/100kWh, donc diviser par 100 pour avoir €/kWh
  const pricePerKwh = averagePrice / 100;

  console.log(`💰 Prix moyen ${energyType}: ${pricePerKwh.toFixed(4)} €/kWh`);

  // Arrondir à 4 décimales
  return Math.round(pricePerKwh * 10000) / 10000;
};

/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 * basé sur l'historique réel de l'API DIDO
 *
 * Cette fonction appelle l'API DIDO UNE SEULE FOIS pour récupérer tout l'historique,
 * puis passe ces données aux fonctions d'analyse.
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle Mean Reversion optimal calculé depuis l'API DIDO
 * @throws Error si le type d'énergie est invalide ou si l'API échoue
 */
export const fetchEnergyModelFromAPI = async (
  energyType: ApiEnergyType
): Promise<EnergyEvolutionModel> => {
  // Utiliser les mappings centralisés pour obtenir le nom de colonne DIDO
  const priceColumnName = getDidoColumnNameFromEnergyType(energyType);

  let rid: string;

  switch (energyType) {
    case EnergyType.GAZ:
      rid = DATAFILE_RIDS.gas;
      break;

    case EnergyType.ELECTRICITE:
      rid = DATAFILE_RIDS.electricity;
      break;

    case EnergyType.FIOUL:
      rid = DATAFILE_RIDS.petroleum;
      break;

    case EnergyType.BOIS:
      rid = DATAFILE_RIDS.wood;
      break;

    default:
      throw new Error(`Type d'énergie invalide: ${energyType}`);
  }

  // ⚠️ APPEL API UNIQUE - Récupérer TOUT l'historique disponible
  const rows = await getDataFileRows(rid, 10000);

  // Analyser l'historique pour obtenir les taux d'évolution (passer energyType directement)
  const analysis = await analyzeEnergyPriceHistory(rows, energyType);

  // Calculer le prix actuel moyen
  const currentPrice = calculateCurrentPrice(rows, priceColumnName, energyType);

  return {
    tauxRecent: analysis.tauxRecent,
    tauxEquilibre: analysis.tauxEquilibre,
    anneesTransition: 5,
    currentPrice,
  };
};
