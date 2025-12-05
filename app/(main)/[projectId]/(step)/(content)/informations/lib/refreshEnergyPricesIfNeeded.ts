"use server"

import { prisma } from "@/lib/prisma"
import { fetchAllEnergyModelsFromAPI } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/fetchAllEnergyModelsFromAPI"
import { isDataFresh } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/isDataFresh"
import { updateEnergyPriceCache } from "@/app/(main)/[projectId]/(step)/(content)/informations/mutations/updateEnergyPriceCache/updateEnergyPriceCache"
import { EnergyType, type ApiEnergyType } from "@/types/energyType"

/**
 * Rafraîchit les prix énergétiques depuis l'API DIDO si nécessaire
 *
 * Logique optimisée:
 * 1. Vérifie quelles énergies ont besoin d'un rafraîchissement
 * 2. Si au moins une énergie a besoin d'un update → Fetch TOUTES les énergies en parallèle
 * 3. Met à jour uniquement celles qui en ont besoin
 *
 * Optimisation: Au lieu de 4 appels API séquentiels, fait 4 appels en parallèle.
 * Temps d'exécution réduit de ~4x.
 *
 * Cette fonction doit être appelée à la step 1 (informations) du wizard
 * avant de passer à la step suivante.
 */
export const refreshEnergyPricesIfNeeded = async (): Promise<void> => {
  const energyTypes: ApiEnergyType[] = [
    EnergyType.GAZ,
    EnergyType.ELECTRICITE,
    EnergyType.FIOUL,
    EnergyType.BOIS
  ]

  // 1. Vérifier quelles énergies ont besoin d'un rafraîchissement
  const energyStatuses = await Promise.all(
    energyTypes.map(async (energyType) => {
      const cached = await prisma.energyPriceCache.findUnique({
        where: { energyType }
      })

      const needsUpdate = !cached || !isDataFresh(cached.lastUpdated)

      if (needsUpdate) {
        if (!cached) {
          console.log(`📥 Aucune donnée en DB pour ${energyType.toUpperCase()}`)
        } else {
          const daysSinceUpdate = Math.floor(
            (new Date().getTime() - cached.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
          )
          console.log(`🔄 Données ${energyType.toUpperCase()} obsolètes (${daysSinceUpdate} jours)`)
        }
      } else {
        const daysSinceUpdate = Math.floor(
          (new Date().getTime() - cached!.lastUpdated.getTime()) / (1000 * 60 * 60 * 24)
        )
        console.log(`✅ Données ${energyType.toUpperCase()} à jour (${daysSinceUpdate} jours)`)
      }

      return { energyType, needsUpdate }
    })
  )

  // 2. Vérifier si au moins une énergie a besoin d'un update
  const energiesToUpdate = energyStatuses.filter((status) => status.needsUpdate)

  if (energiesToUpdate.length === 0) {
    console.log("✅ Toutes les données énergétiques sont à jour")
    return
  }

  // 3. Fetch TOUTES les énergies en parallèle (optimisation)
  console.log(`🚀 Rafraîchissement de ${energiesToUpdate.length} énergie(s) en parallèle...`)
  const allModels = await fetchAllEnergyModelsFromAPI()

  // 4. Sauvegarder uniquement les énergies qui avaient besoin d'un update
  await Promise.all(
    energiesToUpdate.map(async ({ energyType }) => {
      const freshModel = allModels[energyType]
      await updateEnergyPriceCache(energyType, freshModel)
      console.log(`✅ Modèle ${energyType.toUpperCase()} mis à jour en DB`)
    })
  )

  console.log("✅ Rafraîchissement terminé")
}
