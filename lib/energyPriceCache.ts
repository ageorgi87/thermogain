"use server"

import { prisma } from "@/lib/prisma"
import { getEnergyEvolutionDetails } from "@/lib/didoApi"

/**
 * Vérifie si les données en cache sont encore fraîches (moins d'un mois)
 */
function isCacheFresh(lastUpdated: Date): boolean {
  const now = new Date()
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(now.getMonth() - 1)

  return lastUpdated > oneMonthAgo
}

/**
 * Récupère ou met à jour les données d'évolution de prix pour un type d'énergie
 * Utilise le cache si les données datent de moins d'un mois, sinon interroge l'API
 */
export async function getOrUpdateEnergyPrice(energyType: string) {
  try {
    // Chercher dans le cache
    const cached = await prisma.energyPriceCache.findUnique({
      where: { energyType }
    })

    // Si le cache existe et est frais, le retourner
    if (cached && isCacheFresh(cached.lastUpdated)) {
      console.log(`📦 Cache hit pour ${energyType} (dernière mise à jour: ${cached.lastUpdated.toLocaleDateString()})`)
      return {
        evolution_1y: cached.evolution_1y,
        evolution_5y: cached.evolution_5y,
        evolution_10y: cached.evolution_10y,
        evolution_weighted: cached.evolution_weighted,
        fromCache: true,
      }
    }

    // Sinon, interroger l'API DIDO
    console.log(`🌐 Récupération depuis l'API DIDO pour ${energyType}...`)
    const evolutionData = await getEnergyEvolutionDetails(energyType)

    // Mettre à jour ou créer dans le cache
    const updated = await prisma.energyPriceCache.upsert({
      where: { energyType },
      update: {
        evolution_1y: evolutionData.evolution_1y,
        evolution_5y: evolutionData.evolution_5y,
        evolution_10y: evolutionData.evolution_10y,
        evolution_weighted: evolutionData.evolution_weighted,
        lastUpdated: new Date(),
      },
      create: {
        energyType,
        evolution_1y: evolutionData.evolution_1y,
        evolution_5y: evolutionData.evolution_5y,
        evolution_10y: evolutionData.evolution_10y,
        evolution_weighted: evolutionData.evolution_weighted,
        lastUpdated: new Date(),
      }
    })

    console.log(`✅ Cache mis à jour pour ${energyType}`)

    return {
      evolution_1y: updated.evolution_1y,
      evolution_5y: updated.evolution_5y,
      evolution_10y: updated.evolution_10y,
      evolution_weighted: updated.evolution_weighted,
      fromCache: false,
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des données pour ${energyType}:`, error)

    // En cas d'erreur, retourner des valeurs par défaut
    const defaults: Record<string, number> = {
      fioul: 3,
      gaz: 4,
      gpl: 3,
      bois: 2,
      electricite: 3,
    }

    return {
      evolution_1y: defaults[energyType] || 3,
      evolution_5y: defaults[energyType] || 3,
      evolution_10y: defaults[energyType] || 3,
      evolution_weighted: defaults[energyType] || 3,
      fromCache: false,
    }
  }
}

/**
 * Récupère toutes les évolutions de prix en utilisant le système de cache
 */
export async function getAllEnergyPrices() {
  const [fioul, gaz, gpl, bois, electricite] = await Promise.all([
    getOrUpdateEnergyPrice("fioul"),
    getOrUpdateEnergyPrice("gaz"),
    getOrUpdateEnergyPrice("gpl"),
    getOrUpdateEnergyPrice("bois"),
    getOrUpdateEnergyPrice("electricite"),
  ])

  return {
    evolution_prix_fioul: fioul.evolution_weighted,
    evolution_prix_gaz: gaz.evolution_weighted,
    evolution_prix_gpl: gpl.evolution_weighted,
    evolution_prix_bois: bois.evolution_weighted,
    evolution_prix_electricite: electricite.evolution_weighted,
  }
}

/**
 * Force la mise à jour du cache pour tous les types d'énergie
 * Utile pour forcer un refresh manuel
 */
export async function refreshAllEnergyPrices() {
  console.log("🔄 Rafraîchissement forcé de tous les prix de l'énergie...")

  // Supprimer tout le cache existant
  await prisma.energyPriceCache.deleteMany({})

  // Récupérer à nouveau toutes les données
  return await getAllEnergyPrices()
}
