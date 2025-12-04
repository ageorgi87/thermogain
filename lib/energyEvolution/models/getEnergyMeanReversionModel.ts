/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 * basé sur l'historique réel de l'API DIDO
 */

import { DATAFILE_RIDS } from "@/lib/dido/didoConstants";
import type { EnergyEvolutionModel } from "@/types/energy";
import { analyzeEnergyPriceHistory } from "./analyzeEnergyPriceHistory";

/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle Mean Reversion optimal calculé depuis l'API DIDO
 * @throws Error si le type d'énergie est invalide ou si l'API échoue
 */
export const getEnergyMeanReversionModel = async (
  energyType: "gaz" | "electricite" | "fioul" | "bois"
): Promise<EnergyEvolutionModel> => {
  let rid: string;
  let priceColumnName: string;
  let label: string;

  switch (energyType) {
    case "gaz":
      rid = DATAFILE_RIDS.gas;
      priceColumnName = "PX_GAZ_D_TTES_TRANCHES";
      label = "GAZ";
      break;

    case "electricite":
      rid = DATAFILE_RIDS.electricity;
      priceColumnName = "PX_ELE_D_TTES_TRANCHES";
      label = "ÉLECTRICITÉ";
      break;

    case "fioul":
      rid = DATAFILE_RIDS.petroleum;
      priceColumnName = "PX_PETRO_FOD_100KWH_C1";
      label = "FIOUL";
      break;

    case "bois":
      rid = DATAFILE_RIDS.wood;
      priceColumnName = "PX_BOIS_GRANVRAC_100KWH";
      label = "BOIS";
      break;

    default:
      throw new Error(`Type d'énergie invalide: ${energyType}`);
  }

  const analysis = await analyzeEnergyPriceHistory(rid, priceColumnName);

  return {
    tauxRecent: analysis.tauxRecent,
    tauxEquilibre: analysis.tauxEquilibre,
    anneesTransition: 5,
  };
};
