"use server"

import { prisma } from "@/lib/prisma"
import { fetchEnergyModelFromAPI } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/fetchEnergyModelFromAPI"
import { isDataFresh } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/isDataFresh"
import { updateEnergyPriceCache } from "@/app/(main)/[projectId]/(step)/(content)/informations/mutations/updateEnergyPriceCache/updateEnergyPriceCache"
import { EnergyType, type ApiEnergyType } from "@/types/energyType"

/**
 * Rafraîchit les prix énergétiques depuis l'API DIDO si nécessaire
 *
 * Logique:
 * 1. Vérifie si les données existent en DB
 * 2. Vérifie si elles datent de moins de 31 jours
 * 3. Si absent OU > 31 jours → Appel API + Update DB
 * 4. Sinon → Ne fait rien
 *
 * Cette fonction doit être appelée à la step 1 (informations) du wizard
 * avant de passer à la step suivante.
 */
export const refreshEnergyPricesIfNeeded = async (): Promise<void> => {
  const energyTypes: Array<ApiEnergyType> = [
    EnergyType.GAZ,
    EnergyType.ELECTRICITE,
    EnergyType.FIOUL,
    EnergyType.BOIS
  ]

  for (const energyType of energyTypes) {
    // 1. Chercher en DB
    const cached = await prisma.energyPriceCache.findUnique({
      where: { energyType }
    })

    // 2. Vérifier si update nécessaire
    const needsUpdate = !cached || !isDataFresh(cached.lastUpdated)

    if (needsUpdate) {
      if (!cached) {
        console.log(`📥 Aucune donnée en DB pour ${energyType.toUpperCase()}, appel API DIDO...`)
      } else {
        console.log(
          `🔄 Données ${energyType.toUpperCase()} obsolètes (${Math.floor((new Date().getTime() - cached.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))} jours), rafraîchissement...`
        )
      }

      // 3. Appeler l'API DIDO pour calculer le nouveau modèle ET le prix actuel
      const freshModel = await fetchEnergyModelFromAPI(energyType)

      // 4. Sauvegarder en DB (modèle + prix actuel)
      await updateEnergyPriceCache(energyType, freshModel)

      console.log(`✅ Modèle ${energyType.toUpperCase()} mis à jour en DB`)
    } else {
      console.log(
        `✅ Données ${energyType.toUpperCase()} à jour (${Math.floor((new Date().getTime() - cached.lastUpdated.getTime()) / (1000 * 60 * 60 * 24))} jours)`
      )
    }
  }
}
