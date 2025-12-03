import type { EnergyEvolutionModel } from "@/lib/energyEvolution/energyEvolutionData"

/**
 * Convertit un modèle EnergyEvolutionModel en objet JSON pour la DB
 */
export const modelToJson = (model: EnergyEvolutionModel): string => {
  return JSON.stringify(model)
}

/**
 * Convertit un objet JSON de la DB en EnergyEvolutionModel
 */
export const jsonToModel = (json: string): EnergyEvolutionModel => {
  return JSON.parse(json)
}
