"use server"

import { prisma } from "@/lib/prisma"
import { getEnergyEvolution10y, getCurrentEnergyPrice as fetchFromApi } from "@/lib/didoApi"

/**
 * Vérifie si les données en cache sont du mois en cours
 * Le cache est considéré comme valide si lastUpdated est dans le même mois et la même année
 */
const isCacheValid = (lastUpdated: Date): boolean => {
  const now = new Date()
  const cacheDate = new Date(lastUpdated)

  // Vérifie si l'année et le mois sont identiques
  return (
    cacheDate.getFullYear() === now.getFullYear() &&
    cacheDate.getMonth() === now.getMonth()
  )
}

/**
 * Convertit le prix de l'API (€/kWh) vers l'unité appropriée selon le type d'énergie
 */
const convertPriceToUnit = (pricePerKwh: number, energyType: string): number => {
  switch (energyType) {
    case "fioul":
      // Fioul: 10 kWh/litre → prix en €/litre
      return Math.round(pricePerKwh * 10 * 1000) / 1000 // Arrondir à 3 décimales
    case "gaz":
      // Gaz: prix en €/kWh
      return Math.round(pricePerKwh * 10000) / 10000 // Arrondir à 4 décimales
    case "gpl":
      // GPL: 12.8 kWh/kg → prix en €/kg
      return Math.round(pricePerKwh * 12.8 * 1000) / 1000 // Arrondir à 3 décimales
    case "bois":
      // Bois (granulés): 4.8 kWh/kg → prix en €/kg
      return Math.round(pricePerKwh * 4.8 * 1000) / 1000 // Arrondir à 3 décimales
    case "electricite":
      // Électricité: prix en €/kWh
      return Math.round(pricePerKwh * 10000) / 10000 // Arrondir à 4 décimales
    default:
      return pricePerKwh
  }
}

/**
 * Récupère le prix actuel d'une énergie depuis le cache ou l'API DIDO
 * Le cache est valide pour le mois en cours, sinon l'API est appelée
 *
 * @param energyType - Type d'énergie: "fioul", "gaz", "gpl", "bois", "electricite"
 * @returns Le prix dans l'unité appropriée (€/litre, €/kWh, €/kg, etc.)
 */
export const getCachedEnergyPrice = async (energyType: string): Promise<number> => {
  try {
    // Rechercher le prix en cache
    const cached = await prisma.energyPriceCache.findUnique({
      where: { energyType },
    })

    // Si le cache existe et est valide (du mois en cours), le retourner
    if (cached && isCacheValid(cached.lastUpdated) && cached.currentPrice > 0) {
      console.log(`📦 Prix ${energyType} trouvé en cache: ${cached.currentPrice}`)
      return cached.currentPrice
    }

    // Sinon, récupérer le prix depuis l'API DIDO
    console.log(`🌐 Prix ${energyType} non trouvé en cache ou périmé, appel API DIDO...`)
    const pricePerKwh = await fetchFromApi(energyType)

    // Convertir le prix vers l'unité appropriée
    const currentPrice = convertPriceToUnit(pricePerKwh, energyType)

    // Mettre à jour ou créer l'entrée en cache
    await prisma.energyPriceCache.upsert({
      where: { energyType },
      create: {
        energyType,
        currentPrice,
        evolution_10y: 0, // Sera mis à jour par getOrUpdateEnergyPrice
        lastUpdated: new Date(),
      },
      update: {
        currentPrice,
        lastUpdated: new Date(),
      },
    })

    console.log(`✅ Prix ${energyType} mis en cache: ${currentPrice}`)
    return currentPrice
  } catch (error) {
    console.error(`Erreur lors de la récupération du prix pour ${energyType}:`, error)

    // En cas d'erreur, essayer de récupérer la donnée la plus récente en DB
    try {
      const mostRecent = await prisma.energyPriceCache.findFirst({
        where: { energyType },
        orderBy: { lastUpdated: 'desc' }
      })

      if (mostRecent && mostRecent.currentPrice > 0) {
        console.log(`⚠️ Utilisation du prix le plus récent en DB pour ${energyType}: ${mostRecent.currentPrice} (date: ${mostRecent.lastUpdated.toLocaleDateString()})`)
        return mostRecent.currentPrice
      }
    } catch (dbError) {
      console.error(`Erreur lors de la lecture de la DB pour ${energyType}:`, dbError)
    }

    // Si la DB est vide ou inaccessible, utiliser les valeurs par défaut
    console.warn(`⚠️ Utilisation des valeurs par défaut pour ${energyType}`)
    const defaultPrices: Record<string, number> = {
      fioul: 1.15,       // €/litre
      gaz: 0.10,         // €/kWh
      gpl: 1.60,         // €/kg
      bois: 0.26,        // €/kg (pellets)
      electricite: 0.2516, // €/kWh
    }

    return defaultPrices[energyType] || 0.20
  }
}

/**
 * Récupère ou met à jour les données d'évolution de prix pour un type d'énergie
 * Utilise le cache si les données datent du mois en cours, sinon interroge l'API
 * Retourne uniquement l'évolution sur 10 ans (alignée avec l'horizon d'investissement de 17 ans)
 */
export const getOrUpdateEnergyPrice = async (energyType: string) => {
  try {
    // Chercher dans le cache
    const cached = await prisma.energyPriceCache.findUnique({
      where: { energyType }
    })

    // Si le cache existe et est valide (du mois en cours), le retourner
    if (cached && isCacheValid(cached.lastUpdated)) {
      console.log(`📦 Cache hit pour ${energyType} (dernière mise à jour: ${cached.lastUpdated.toLocaleDateString()})`)
      return {
        evolution_10y: cached.evolution_10y,
        fromCache: true,
      }
    }

    // Sinon, interroger l'API DIDO
    console.log(`🌐 Récupération depuis l'API DIDO pour ${energyType}...`)
    const evolution10y = await getEnergyEvolution10y(energyType)

    // Mettre à jour ou créer dans le cache
    const updated = await prisma.energyPriceCache.upsert({
      where: { energyType },
      update: {
        evolution_10y: evolution10y,
        lastUpdated: new Date(),
      },
      create: {
        energyType,
        currentPrice: 0,
        evolution_10y: evolution10y,
        lastUpdated: new Date(),
      }
    })

    console.log(`✅ Cache mis à jour pour ${energyType}`)

    return {
      evolution_10y: updated.evolution_10y,
      fromCache: false,
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des données pour ${energyType}:`, error)

    // En cas d'erreur, essayer de récupérer la valeur la plus récente en DB
    try {
      const mostRecent = await prisma.energyPriceCache.findFirst({
        where: { energyType },
        orderBy: { lastUpdated: 'desc' }
      })

      if (mostRecent && mostRecent.evolution_10y > 0) {
        console.log(`⚠️ Utilisation de l'évolution la plus récente en DB pour ${energyType}: ${mostRecent.evolution_10y}% (date: ${mostRecent.lastUpdated.toLocaleDateString()})`)
        return {
          evolution_10y: mostRecent.evolution_10y,
          fromCache: true,
        }
      }
    } catch (dbError) {
      console.error(`Erreur lors de la lecture de la DB pour ${energyType}:`, dbError)
    }

    // Si la DB est vide ou inaccessible, utiliser des valeurs par défaut conservatrices
    console.warn(`⚠️ Utilisation des valeurs par défaut pour ${energyType}`)
    const defaults: Record<string, number> = {
      fioul: 3,      // 3% par an (historique moyen)
      gaz: 4,        // 4% par an (impact guerre Ukraine)
      gpl: 3,        // 3% par an (suit le pétrole)
      bois: 2,       // 2% par an (plus stable)
      electricite: 3, // 3% par an (tarifs réglementés)
    }

    return {
      evolution_10y: defaults[energyType] || 3,
      fromCache: false,
    }
  }
}

/**
 * Récupère toutes les évolutions de prix en utilisant le système de cache
 * Retourne l'évolution sur 10 ans pour chaque type d'énergie
 */
export const getAllEnergyPrices = async () => {
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

/**
 * Force la mise à jour du cache pour tous les types d'énergie
 * Utile pour forcer un refresh manuel
 */
export const refreshAllEnergyPrices = async () => {
  console.log("🔄 Rafraîchissement forcé de tous les prix de l'énergie...")

  // Supprimer tout le cache existant
  await prisma.energyPriceCache.deleteMany({})

  // Récupérer à nouveau toutes les données
  return await getAllEnergyPrices()
}
