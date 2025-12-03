/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 */

import { DATAFILE_RIDS } from '@/lib/dido/didoConstants'
import { EnergyEvolutionModel, DEFAULT_GAS_MODEL } from '@/lib/energyEvolution/energyEvolutionData'
import { analyzeEnergyPriceHistory } from './analyzeEnergyPriceHistory'
import { getGasMeanReversionModel } from './getGasMeanReversionModel'
import { getElectricityMeanReversionModel } from './getElectricityMeanReversionModel'

/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', etc.)
 * @returns Modèle Mean Reversion optimal
 */
export const getEnergyMeanReversionModel = async (
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): Promise<EnergyEvolutionModel> => {
  switch (energyType) {
    case 'gaz':
      return await getGasMeanReversionModel()

    case 'electricite':
      return await getElectricityMeanReversionModel()

    case 'fioul':
      try {
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
      } catch (error) {
        return {
          type: 'mean-reversion',
          tauxRecent: 3.0,
          tauxEquilibre: 2.5,
          anneesTransition: 5
        }
      }

    case 'bois':
      try {
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
      } catch (error) {
        return {
          type: 'mean-reversion',
          tauxRecent: 2.0,
          tauxEquilibre: 1.5,
          anneesTransition: 5
        }
      }

    default:
      return DEFAULT_GAS_MODEL
  }
}
