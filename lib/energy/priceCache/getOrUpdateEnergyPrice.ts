"use server"

import { prisma } from "@/lib/prisma"
import { getEnergyEvolution10y } from "@/lib/dido/getEnergyEvolution10y"
import { isCacheValid } from "./helpers/isCacheValid"

/**
 * Récupère ou met à jour les données d'évolution de prix pour un type d'énergie
 * Utilise le cache si les données datent du mois en cours, sinon interroge l'API
 * Retourne uniquement l'évolution sur 10 ans (alignée avec l'horizon d'investissement de 17 ans)
 */
export const getOrUpdateEnergyPrice = async (energyType: string): Promise<{
  evolution_10y: number
  fromCache: boolean
}> => {
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
