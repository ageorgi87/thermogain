import { getEnergyModelSync } from "./getEnergyModelSync"

/**
 * Récupère le modèle électricité depuis la DB (avec auto-refresh si nécessaire)
 *
 * @returns Modèle d'évolution de l'électricité depuis la DB
 */
export const getElectricityModelSync = async () => {
  return getEnergyModelSync('electricite')
}
