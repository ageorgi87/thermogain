/**
 * Calcule le taux d'équilibre long terme selon l'approche académique
 *
 * Au lieu d'utiliser la moyenne historique (souvent négative à cause de la dérégulation),
 * utilise l'approche académique: Inflation + Facteurs structurels spécifiques à chaque énergie.
 *
 * Sources:
 * - INSEE: Inflation moyenne long terme France ≈ 2%/an
 * - Croissance demande énergie: ~1-1,5%/an
 *
 * Les prix de l'énergie sur le long terme suivent:
 * - L'inflation générale (coûts de production, salaires, etc.)
 * - La croissance de la demande
 * - Moins les gains d'efficacité (ENR pour électricité, efficacité extraction pour gaz)
 */

import { ENERGY_ANALYSIS_PARAMS } from '@/config/constants'
import type { EnergyType } from '@/lib/energyEvolution/models/helpers/getEnergyTypeFromColumn'

export const calculateEquilibriumRate = (
  energyType: EnergyType,
  annualEvolutions: number[],
  crisisYears: number[]
): number => {
  const { EQUILIBRIUM_RATES, CRISIS_THRESHOLD } = ENERGY_ANALYSIS_PARAMS

  // Taux théorique selon le type d'énergie
  let tauxEquilibre: number = EQUILIBRIUM_RATES[energyType]

  console.log(`   ⚖️  Taux équilibre ${energyType} (théorique): ${tauxEquilibre.toFixed(2)}%/an`)

  // Validation: comparer avec moyenne hors crises (si disponible)
  const normalEvolutions = annualEvolutions.filter(
    (evolution, idx) => !crisisYears.includes(idx + 1) && Math.abs(evolution) <= CRISIS_THRESHOLD
  )

  if (normalEvolutions.length >= 5) {
    const moyenneHorsCrises = normalEvolutions.reduce((a, b) => a + b, 0) / normalEvolutions.length
    console.log(`   📊 Validation: Moyenne historique hors crises = ${moyenneHorsCrises.toFixed(2)}%/an (${normalEvolutions.length} années)`)

    // Si la moyenne historique est positive et raisonnable, on peut l'ajuster légèrement
    if (moyenneHorsCrises > 0 && moyenneHorsCrises < 10) {
      // Mix 80% théorique + 20% empirique
      const tauxAjuste = (tauxEquilibre * 0.8) + (moyenneHorsCrises * 0.2)
      console.log(`   🎯 Taux équilibre ajusté (80% théorie + 20% empirique): ${tauxAjuste.toFixed(2)}%/an`)
      tauxEquilibre = tauxAjuste
    }
  }

  return tauxEquilibre
}
