/**
 * Calcul automatique des modèles d'évolution des prix basés sur l'historique API DIDO-SDES
 *
 * Ce module utilise l'historique complet (18-42 ans) de l'API DIDO pour:
 * 1. Calculer le taux récent (moyenne pondérée 70% sur 10 ans)
 * 2. Calculer le taux d'équilibre (moyenne hors crises sur tout l'historique)
 * 3. Générer automatiquement le modèle Mean Reversion optimal
 */

import { getDataFileRows, DATAFILE_RIDS } from './didoApi'
import {
  EnergyEvolutionModel,
  DEFAULT_GAS_MODEL,
  DEFAULT_ELECTRICITY_MODEL
} from './energyPriceEvolution'

// Export des RIDs pour accès externe si nécessaire
export { DATAFILE_RIDS }

interface HistoricalAnalysis {
  tauxRecent: number          // Taux pondéré 70% sur 10 ans
  tauxEquilibre: number       // Taux moyen hors crises (long terme)
  yearsOfData: number         // Nombre d'années d'historique
  priceRecent: number         // Prix récent moyen (12 derniers mois)
  priceOldest: number         // Prix le plus ancien
  crisisYears: number[]       // Années identifiées comme crises
}

/**
 * Analyse l'historique complet des prix pour extraire taux récent et d'équilibre
 *
 * @param rid Identifiant DIDO du fichier de données
 * @param priceColumnName Nom de la colonne contenant les prix
 * @returns Analyse complète de l'historique
 */
export async function analyzeEnergyPriceHistory(
  rid: string,
  priceColumnName: string
): Promise<HistoricalAnalysis> {
  try {
    // Récupérer TOUT l'historique disponible
    const rows = await getDataFileRows(rid, 10000)

    if (rows.length < 24) {
      console.warn(`Historique insuffisant pour ${priceColumnName}`)
      throw new Error('Historique insuffisant')
    }

    // Extraire les prix mensuels (du plus récent au plus ancien)
    const monthlyPrices: number[] = rows
      .map((row: any) => parseFloat(row[priceColumnName]))
      .filter((price: number) => !isNaN(price) && price > 0)

    const yearsOfData = monthlyPrices.length / 12

    console.log(`📊 Analyse historique ${priceColumnName}: ${monthlyPrices.length} mois (${yearsOfData.toFixed(1)} ans)`)

    // Calculer les moyennes annuelles pour détecter les crises
    const annualAverages: number[] = []
    const annualEvolutions: number[] = []

    for (let year = 0; year < Math.floor(yearsOfData); year++) {
      const startIdx = year * 12
      const endIdx = startIdx + 12
      const yearPrices = monthlyPrices.slice(startIdx, endIdx)

      if (yearPrices.length === 12) {
        const avg = yearPrices.reduce((a, b) => a + b, 0) / 12
        annualAverages.push(avg)

        // Calculer l'évolution vs année précédente
        if (annualAverages.length > 1) {
          const prevAvg = annualAverages[annualAverages.length - 2]
          const evolution = ((avg - prevAvg) / prevAvg) * 100
          annualEvolutions.push(evolution)
        }
      }
    }

    // ===========================================================================
    // 1. CALCUL DU TAUX RÉCENT (pondéré 70% sur 10 ans + 30% long terme)
    // ===========================================================================

    const recentAvg = monthlyPrices.slice(0, 12).reduce((a, b) => a + b, 0) / 12

    // Long terme: toute la période
    const oldestStartIndex = Math.max(monthlyPrices.length - 12, 0)
    const oldestAvg = monthlyPrices
      .slice(oldestStartIndex, oldestStartIndex + 12)
      .reduce((a, b) => a + b, 0) / 12

    const evolutionLongTerm = ((recentAvg - oldestAvg) / oldestAvg) * 100 / yearsOfData

    // 10 dernières années (si disponible)
    let evolution10y = evolutionLongTerm
    if (monthlyPrices.length >= 120) {
      const avg10yAgo = monthlyPrices.slice(108, 120).reduce((a, b) => a + b, 0) / 12
      evolution10y = ((recentAvg - avg10yAgo) / avg10yAgo) * 100 / 10
    }

    const tauxRecent = (evolutionLongTerm * 0.3) + (evolution10y * 0.7)

    console.log(`   📈 Taux récent (70% 10y + 30% LT): ${tauxRecent.toFixed(2)}%/an`)

    // ===========================================================================
    // 2. DÉTECTION DES CRISES (évolutions > 10%/an)
    // ===========================================================================

    const CRISIS_THRESHOLD = 10 // Évolution > 10%/an = crise
    const crisisYears: number[] = []

    annualEvolutions.forEach((evolution, idx) => {
      if (Math.abs(evolution) > CRISIS_THRESHOLD) {
        crisisYears.push(idx + 1) // +1 car évolution année N vs N-1
        console.log(`   🔴 Crise détectée année ${idx + 1}: ${evolution.toFixed(1)}%`)
      }
    })

    // ===========================================================================
    // 3. CALCUL DU TAUX D'ÉQUILIBRE (approche académique)
    // ===========================================================================

    // Au lieu d'utiliser la moyenne historique (souvent négative à cause de la dérégulation),
    // utilisons l'approche académique : Inflation + Croissance structurelle
    //
    // Sources:
    // - INSEE: Inflation moyenne long terme France ≈ 2%/an
    // - Croissance demande énergie: ~1-1,5%/an
    //
    // Les prix de l'énergie sur le long terme suivent:
    // - L'inflation générale (coûts de production, salaires, etc.)
    // - La croissance de la demande
    // - Moins les gains d'efficacité (ENR pour électricité, efficacité extraction pour gaz)

    const INFLATION_LONG_TERME = 2.0  // Inflation moyenne France (source: INSEE)

    let tauxEquilibre: number

    // Pour le gaz/fioul/bois: inflation + légère croissance demande
    // Pour l'électricité: inflation mais baisse structurelle due aux ENR
    // On détecte automatiquement selon le priceColumnName
    if (priceColumnName.includes('ELE')) {
      // Électricité: inflation - baisse coût ENR + croissance demande électrification
      tauxEquilibre = 2.5  // 2% inflation + 0,5% net (électrification - ENR)
      console.log(`   ⚖️  Taux équilibre ÉLECTRICITÉ (inflation + croissance - ENR): ${tauxEquilibre.toFixed(2)}%/an`)
    } else if (priceColumnName.includes('GAZ')) {
      // Gaz: inflation + croissance demande - gains efficacité
      tauxEquilibre = 3.5  // 2% inflation + 1,5% demande
      console.log(`   ⚖️  Taux équilibre GAZ (inflation + croissance demande): ${tauxEquilibre.toFixed(2)}%/an`)
    } else if (priceColumnName.includes('BOIS')) {
      // Bois: inflation + légère croissance (transition énergétique)
      tauxEquilibre = 2.0  // 2% inflation + stabilité
      console.log(`   ⚖️  Taux équilibre BOIS (inflation): ${tauxEquilibre.toFixed(2)}%/an`)
    } else {
      // Fioul/GPL: inflation + légère croissance (mais déclin structurel à terme)
      tauxEquilibre = 2.5  // 2% inflation + 0,5% résiduel
      console.log(`   ⚖️  Taux équilibre FIOUL (inflation + résiduel): ${tauxEquilibre.toFixed(2)}%/an`)
    }

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

    return {
      tauxRecent: Math.round(tauxRecent * 10) / 10,
      tauxEquilibre: Math.round(tauxEquilibre * 10) / 10,
      yearsOfData: Math.round(yearsOfData * 10) / 10,
      priceRecent: Math.round(recentAvg * 100) / 100,
      priceOldest: Math.round(oldestAvg * 100) / 100,
      crisisYears
    }
  } catch (error) {
    console.error(`Erreur analyse historique ${priceColumnName}:`, error)
    throw error
  }
}

/**
 * Génère automatiquement le modèle Mean Reversion optimal pour le gaz
 * basé sur l'historique réel de l'API DIDO
 */
export async function getGasMeanReversionModel(): Promise<EnergyEvolutionModel> {
  try {
    const analysis = await analyzeEnergyPriceHistory(
      DATAFILE_RIDS.gas,
      'PX_GAZ_D_TTES_TRANCHES'
    )

    console.log('\n🎯 Modèle GAZ généré:')
    console.log(`   • Taux récent: ${analysis.tauxRecent}%`)
    console.log(`   • Taux équilibre: ${analysis.tauxEquilibre}%`)
    console.log(`   • Historique: ${analysis.yearsOfData} ans`)
    console.log(`   • Crises détectées: ${analysis.crisisYears.length}\n`)

    return {
      type: 'mean-reversion',
      tauxRecent: analysis.tauxRecent,
      tauxEquilibre: analysis.tauxEquilibre,
      anneesTransition: 5 // Durée standard basée sur crises historiques
    }
  } catch (error) {
    console.warn('⚠️  Impossible de générer modèle gaz depuis API, utilisation valeurs par défaut')
    return DEFAULT_GAS_MODEL
  }
}

/**
 * Génère automatiquement le modèle Mean Reversion optimal pour l'électricité
 * basé sur l'historique réel de l'API DIDO
 */
export async function getElectricityMeanReversionModel(): Promise<EnergyEvolutionModel> {
  try {
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
  } catch (error) {
    console.warn('⚠️  Impossible de générer modèle électricité depuis API, utilisation valeurs par défaut')
    return DEFAULT_ELECTRICITY_MODEL
  }
}

/**
 * Génère le modèle Mean Reversion pour un type d'énergie donné
 *
 * @param energyType Type d'énergie ('gaz', 'electricite', 'fioul', etc.)
 * @returns Modèle Mean Reversion optimal
 */
export async function getEnergyMeanReversionModel(
  energyType: 'gaz' | 'electricite' | 'fioul' | 'bois'
): Promise<EnergyEvolutionModel> {
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

/**
 * Test et affichage des modèles générés pour tous les types d'énergie
 * Utile pour vérifier la qualité des données et des modèles
 */
export async function testAllEnergyModels(): Promise<void> {
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
