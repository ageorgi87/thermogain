import { getCachedEnergyPrice } from "@/lib/energy/priceCache/getCachedEnergyPrice"
import type { DefaultEnergyPrices } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/defaultEnergyPrices"

/**
 * Récupère les prix par défaut de l'énergie depuis le cache
 * Ces prix sont utilisés comme valeurs par défaut dans le formulaire
 */
export const getDefaultEnergyPrices = async (): Promise<DefaultEnergyPrices> => {
  try {
    const [fioul, gaz, gpl, bois, electricite] = await Promise.all([
      getCachedEnergyPrice("fioul"),
      getCachedEnergyPrice("gaz"),
      getCachedEnergyPrice("gpl"),
      getCachedEnergyPrice("bois"),
      getCachedEnergyPrice("electricite"),
    ])

    return {
      fioul,
      gaz,
      gpl,
      bois,
      electricite,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des prix par défaut:", error)

    // Valeurs par défaut en cas d'erreur
    return {
      fioul: 1.15,
      gaz: 0.1,
      gpl: 1.6,
      bois: 0.26,
      electricite: 0.2516,
    }
  }
}
