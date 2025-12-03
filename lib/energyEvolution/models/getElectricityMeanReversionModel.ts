/**
 * Génère automatiquement le modèle Mean Reversion optimal pour l'électricité
 * basé sur l'historique réel de l'API DIDO
 */

import { DATAFILE_RIDS } from '@/lib/dido/didoConstants'
import type { EnergyEvolutionModel } from '@/lib/energyEvolution/energyEvolutionData'
import { analyzeEnergyPriceHistory } from './analyzeEnergyPriceHistory'

export const getElectricityMeanReversionModel = async (): Promise<EnergyEvolutionModel> => {
  const analysis = await analyzeEnergyPriceHistory(
    DATAFILE_RIDS.electricity,
    'PX_ELE_D_TTES_TRANCHES'
  )

  console.log('\n🎯 Modèle ÉLECTRICITÉ généré:')
  console.log(`   • Taux récent: ${analysis.tauxRecent}%`)
  console.log(`   • Taux équilibre: ${analysis.tauxEquilibre}%`)
  console.log(`   • Historique: ${analysis.yearsOfData} ans`)
  console.log(`   • Crises détectées: ${analysis.crisisYears.length}\n`)

  return {
    type: 'mean-reversion',
    tauxRecent: analysis.tauxRecent,
    tauxEquilibre: analysis.tauxEquilibre,
    anneesTransition: 5
  }
}
