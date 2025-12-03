/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 */

import { DATAFILE_RIDS } from '@/lib/dido/didoConstants'
import type { EnergyEvolutionModel } from '@/lib/energyEvolution/energyEvolutionData'
import { analyzeEnergyPriceHistory } from './analyzeEnergyPriceHistory'
import { getGasMeanReversionModel } from './getGasMeanReversionModel'
import { getElectricityMeanReversionModel } from './getElectricityMeanReversionModel'

/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', 'bois')
 * @returns Modèle Mean Reversion optimal
 * @throws Error si le type d'énergie est invalide ou si l'API échoue
 */
export const getEnergyMeanReversionModel = async (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): Promise<EnergyEvolutionModel> => {
  switch (energyType) {
    case 'gaz':
      return await getGasMeanReversionModel()

    case 'electricite':
      return await getElectricityMeanReversionModel()

    case 'fioul': {
      const analysis = await analyzeEnergyPriceHistory(
        DATAFILE_RIDS.petroleum,
        'PX_PETRO_FOD_100KWH_C1'
      )
      return {
        type: 'mean-reversion',
        tauxRecent: analysis.tauxRecent,
        tauxEquilibre: analysis.tauxEquilibre,
        anneesTransition: 5
      }
    }

    case 'bois': {
      const analysis = await analyzeEnergyPriceHistory(
        DATAFILE_RIDS.wood,
        'PX_BOIS_GRANVRAC_100KWH'
      )
      return {
        type: 'mean-reversion',
        tauxRecent: analysis.tauxRecent,
        tauxEquilibre: analysis.tauxEquilibre,
        anneesTransition: 5
      }
    }

    default:
      throw new Error(`Type d'énergie invalide: ${energyType}`)
  }
}
