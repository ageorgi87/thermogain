/**
 * Test et affichage des modèles générés pour tous les types d'énergie
 * Utile pour vérifier la qualité des données et des modèles
 */

import { getEnergyMeanReversionModel } from './getEnergyMeanReversionModel'

export const testAllEnergyModels = async (): Promise<void> => {
  console.log('\n╔════════════════════════════════════════════════════════════════╗')
  console.log('║  GÉNÉRATION AUTOMATIQUE DES MODÈLES MEAN REVERSION            ║')
  console.log('╚════════════════════════════════════════════════════════════════╝\n')

  const energies: Array<'gaz' | 'electricite' | 'fioul' | 'bois'> = ['gaz', 'electricite', 'fioul', 'bois']

  for (const energy of energies) {
    try {
      const model = await getEnergyMeanReversionModel(energy)
      console.log(`\n✅ ${energy.toUpperCase()}:`)
      console.log(`   Type: ${model.type}`)
      console.log(`   Taux récent: ${model.tauxRecent}%`)
      console.log(`   Taux équilibre: ${model.tauxEquilibre}%`)
      console.log(`   Transition: ${model.anneesTransition} ans`)
    } catch (error) {
      console.error(`\n❌ ${energy.toUpperCase()}: Erreur`, error)
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════════\n')
}
