"use server"

import { getOrUpdateEnergyPrice } from "@/lib/getOrUpdateEnergyPrice"

/**
 * Récupère toutes les évolutions de prix en utilisant le système de cache
 * Retourne l'évolution sur 10 ans pour chaque type d'énergie
 */
export const getAllEnergyPrices = async (): Promise<{
  evolution_prix_fioul: number
  evolution_prix_gaz: number
  evolution_prix_gpl: number
  evolution_prix_bois: number
  evolution_prix_electricite: number
}> => {
  const [fioul, gaz, gpl, bois, electricite] = await Promise.all([
    getOrUpdateEnergyPrice("fioul"),
    getOrUpdateEnergyPrice("gaz"),
    getOrUpdateEnergyPrice("gpl"),
    getOrUpdateEnergyPrice("bois"),
    getOrUpdateEnergyPrice("electricite"),
  ])

  return {
    evolution_prix_fioul: fioul.evolution_10y,
    evolution_prix_gaz: gaz.evolution_10y,
    evolution_prix_gpl: gpl.evolution_10y,
    evolution_prix_bois: bois.evolution_10y,
    evolution_prix_electricite: electricite.evolution_10y,
  }
}
