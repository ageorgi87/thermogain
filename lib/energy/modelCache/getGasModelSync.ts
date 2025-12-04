import { getEnergyModelSync } from "./getEnergyModelSync"

/**
 * Récupère le modèle gaz depuis la DB (avec auto-refresh si nécessaire)
 *
 * @returns Modèle d'évolution du gaz depuis la DB
 */
export const getGasModelSync = async () => {
  return getEnergyModelSync('gaz')
}
