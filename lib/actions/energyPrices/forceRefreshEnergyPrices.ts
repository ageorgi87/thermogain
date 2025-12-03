"use server"

import { refreshAllEnergyPrices } from "@/lib/energy/priceCache/refreshAllEnergyPrices"

/**
 * Server Action pour forcer le rafraîchissement du cache des prix de l'énergie
 * Utile pour obtenir les données les plus récentes immédiatement
 */
export const forceRefreshEnergyPrices = async (): Promise<{
  success: boolean
  data: {
    evolution_prix_fioul: number
    evolution_prix_gaz: number
    evolution_prix_gpl: number
    evolution_prix_bois: number
    evolution_prix_electricite: number
  }
}> => {
  try {
    const evolutions = await refreshAllEnergyPrices()
    return {
      success: true,
      data: evolutions,
    }
  } catch (error) {
    console.error("Erreur lors du rafraîchissement des évolutions de prix:", error)
    return {
      success: false,
      data: {
        evolution_prix_fioul: 3,
        evolution_prix_gaz: 4,
        evolution_prix_gpl: 3,
        evolution_prix_bois: 2,
        evolution_prix_electricite: 3,
      },
    }
  }
}
