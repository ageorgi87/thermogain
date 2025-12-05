"use server"

import { prisma } from "@/lib/prisma"
import { fetchAllEnergyModelsFromAPI } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/fetchAllEnergyModelsFromAPI"
import { isDataFresh } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/isDataFresh"
import { updateEnergyPriceCache } from "@/app/(main)/[projectId]/(step)/(content)/informations/mutations/updateEnergyPriceCache/updateEnergyPriceCache"
import { EnergyType, type ApiEnergyType } from "@/types/energyType"

/**
 * Rafraîchit les prix énergétiques depuis l'API DIDO si nécessaire
 *
 * Logique globale optimisée:
 * 1. Vérifie la date de dernière mise à jour GLOBALE (via electricite comme référence)
 * 2. Si obsolète (>31 jours) → Fetch TOUTES les 4 énergies en parallèle
 * 3. Met à jour TOUTES les 4 énergies ensemble
 *
 * IMPORTANT: La mise à jour est GLOBALE, pas par énergie individuelle.
 * Rationale: Les prix énergétiques de l'API DIDO proviennent de la même source
 * et sont publiés ensemble. Il n'y a aucune raison qu'une seule énergie soit
 * obsolète sans que les autres le soient aussi.
 *
 * Choix d'implémentation: Utilise `electricite` comme référence pour la date globale.
 * Au lieu de créer une nouvelle table EnergyGlobalMetadata, on réutilise une des
 * 4 lignes existantes (electricite choisie arbitrairement). Plus simple et évite
 * une migration Prisma supplémentaire.
 *
 * Optimisation: Les 4 appels API sont exécutés en parallèle (Promise.all).
 * Temps d'exécution: ~1x au lieu de ~4x séquentiel.
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

  // 1. Vérifier la date de mise à jour GLOBALE (via electricite comme référence)
  const globalReference = await prisma.energyPriceCache.findUnique({
    where: { energyType: EnergyType.ELECTRICITE }
  })

  const needsGlobalUpdate = !globalReference || !isDataFresh(globalReference.lastUpdated)

  if (!needsGlobalUpdate) {
    return
  }

  // 2. Fetch TOUTES les énergies en parallèle
  const allModels = await fetchAllEnergyModelsFromAPI()

  // 3. Sauvegarder TOUTES les énergies (update global)
  await Promise.all(
    energyTypes.map(async (energyType) => {
      const freshModel = allModels[energyType]
      await updateEnergyPriceCache(energyType, freshModel)
    })
  )
}
