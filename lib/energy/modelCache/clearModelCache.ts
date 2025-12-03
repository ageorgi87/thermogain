import { prisma } from "@/lib/prisma"
import { memoryCache } from "./helpers/memoryCache"

/**
 * Force le rafraîchissement du cache (utile pour les tests)
 */
export const clearModelCache = async (): Promise<void> => {
  // Vider le cache mémoire
  Object.keys(memoryCache).forEach(key => delete memoryCache[key])

  // Vider le cache DB
  try {
    await prisma.energyPriceCache.deleteMany({})
    console.log('🗑️  Cache mémoire et DB vidés')
  } catch (error) {
    console.error('Erreur vidage cache DB:', error)
  }
}
