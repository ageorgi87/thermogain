"use server"

import { getAllEnergyPrices, refreshAllEnergyPrices } from "@/lib/energyPriceCache"

/**
 * Server Action pour récupérer les taux d'évolution des prix de l'énergie
 * Utilise le système de cache en base de données pour éviter les appels API excessifs
 * Les données sont mises à jour automatiquement si elles datent de plus d'un mois
 */
export const fetchEnergyPriceEvolutions = async () => {
  try {
    const evolutions = await getAllEnergyPrices()
    return {
      success: true,
      data: evolutions,
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des évolutions de prix:", error)
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

/**
 * Server Action pour forcer le rafraîchissement du cache des prix de l'énergie
 * Utile pour obtenir les données les plus récentes immédiatement
 */
export const forceRefreshEnergyPrices = async () => {
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
