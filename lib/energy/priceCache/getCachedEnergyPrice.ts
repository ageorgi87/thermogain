"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentEnergyPrice as fetchFromApi } from "@/lib/dido/getCurrentEnergyPrice"
import { isCacheValid } from "./helpers/isCacheValid"
import { convertPriceToUnit } from "./helpers/convertPriceToUnit"

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
