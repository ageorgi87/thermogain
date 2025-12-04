import type { EnergyEvolutionModel } from "@/types/energy";
import { getOrRefreshEnergyModel } from "@/app/(main)/[projectId]/lib/calculateAllResults/getOrRefreshEnergyModel";
import { cache } from "react";

/**
 * Version cachée de getOrRefreshEnergyModel pour une requête Next.js
 * Utilise React.cache() pour dédupliquer les appels pendant le rendu
 */
const getCachedModel = cache(
  async (energyType: "gaz" | "electricite" | "fioul" | "bois") => {
    return getOrRefreshEnergyModel(energyType);
  }
);

/**
 * Récupère un modèle énergétique depuis la DB (avec auto-refresh si nécessaire)
 *
 * ⚠️ ATTENTION: Cette fonction est ASYNCHRONE maintenant.
 * Elle doit être appelée avec await dans un contexte async.
 *
 * Logique:
 * - Vérifie la DB
 * - Si données obsolètes (mois précédent) → Rafraîchit via API DIDO
 * - Retourne toujours les données depuis la DB
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle d'évolution depuis la DB
 */
export const getEnergyModelSync = async (
  energyType: "gaz" | "electricite" | "fioul" | "bois"
): Promise<EnergyEvolutionModel> => {
  return getCachedModel(energyType);
};
