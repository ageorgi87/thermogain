"use server"

import { prisma } from "@/lib/prisma"
import { getAllEnergyPrices } from "./getAllEnergyPrices"

/**
 * Force la mise à jour du cache pour tous les types d'énergie
 * Utile pour forcer un refresh manuel
 */
export const refreshAllEnergyPrices = async (): Promise<{
  evolution_prix_fioul: number
  evolution_prix_gaz: number
  evolution_prix_gpl: number
  evolution_prix_bois: number
  evolution_prix_electricite: number
}> => {
  console.log("🔄 Rafraîchissement forcé de tous les prix de l'énergie...")

  // Supprimer tout le cache existant
  await prisma.energyPriceCache.deleteMany({})

  // Récupérer à nouveau toutes les données
  return await getAllEnergyPrices()
}
