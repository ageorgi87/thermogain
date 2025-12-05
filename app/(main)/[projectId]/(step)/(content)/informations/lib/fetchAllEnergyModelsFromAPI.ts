import { EnergyType, type ApiEnergyType } from "@/types/energyType"
import type { EnergyEvolutionModel } from "@/types/energy"
import { fetchEnergyModelFromAPI } from "@/app/(main)/[projectId]/(step)/(content)/informations/lib/fetchEnergyModelFromAPI"

/**
 * Récupère les modèles énergétiques pour TOUTES les énergies en parallèle
 *
 * Cette fonction optimise les appels API en les exécutant simultanément
 * plutôt que séquentiellement, réduisant significativement le temps d'exécution.
 *
 * @returns Objet contenant les modèles pour chaque type d'énergie
 */
export const fetchAllEnergyModelsFromAPI = async (): Promise<Record<ApiEnergyType, EnergyEvolutionModel>> => {
  console.log("🚀 Récupération de tous les modèles énergétiques en parallèle...")

  const energyTypes: ApiEnergyType[] = [
    EnergyType.GAZ,
    EnergyType.ELECTRICITE,
    EnergyType.FIOUL,
    EnergyType.BOIS
  ]

  // Lancer les 4 appels API en parallèle
  const results = await Promise.all(
    energyTypes.map(async (energyType) => {
      const model = await fetchEnergyModelFromAPI(energyType)
      return { energyType, model }
    })
  )

  // Transformer le tableau en objet indexé par energyType
  const models = results.reduce((acc, { energyType, model }) => {
    acc[energyType] = model
    return acc
  }, {} as Record<ApiEnergyType, EnergyEvolutionModel>)

  console.log("✅ Tous les modèles énergétiques récupérés avec succès")

  return models
}
