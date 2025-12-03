import { getDataFileRows } from "../getDataFileRows"

/**
 * Calcule le taux d'évolution annuel moyen pondéré
 * 70% du poids sur les 10 dernières années, 30% sur toute la période historique
 * Utilise les moyennes glissantes des 12 derniers mois vs période de référence
 */
export const calculateEnergyEvolution10y = async (rid: string, priceColumnName: string): Promise<number> => {
  try {
    // Récupérer toutes les données disponibles (pas de limite)
    const rows = await getDataFileRows(rid, 10000)

    // Minimum requis : 24 mois (2 ans) pour calculer des moyennes glissantes de 12 mois
    const MIN_REQUIRED_MONTHS = 24

    if (rows.length < MIN_REQUIRED_MONTHS) {
      console.warn(`Pas assez de données pour calculer l'évolution pour ${priceColumnName} (${rows.length}/${MIN_REQUIRED_MONTHS})`)
      return 0
    }

    // Extraire les prix mensuels (du plus récent au plus ancien)
    const prices: number[] = rows
      .map((row: any) => parseFloat(row[priceColumnName]))
      .filter((price: number) => !isNaN(price) && price > 0)

    if (prices.length < MIN_REQUIRED_MONTHS) {
      console.warn(`Pas assez de prix valides pour ${priceColumnName} (${prices.length}/${MIN_REQUIRED_MONTHS} trouvés)`)
      return 0
    }

    const yearsOfData = prices.length / 12
    console.log(`📊 Calcul de l'évolution pondérée pour ${priceColumnName} sur ${prices.length} mois (${yearsOfData.toFixed(1)} ans)`)

    // Prix récent = moyenne des 12 derniers mois
    const recentAvg = prices.slice(0, 12).reduce((a, b) => a + b, 0) / 12

    // CALCUL 1: Évolution sur toute la période historique disponible
    const oldestStartIndex = Math.max(prices.length - 12, 0)
    const oldestAvg = prices.slice(oldestStartIndex, oldestStartIndex + 12).reduce((a, b) => a + b, 0) / 12

    if (oldestAvg <= 0) {
      console.warn(`Prix moyen historique invalide pour ${priceColumnName}`)
      return 0
    }

    const totalEvolution = ((recentAvg - oldestAvg) / oldestAvg) * 100
    const evolutionLongTerm = totalEvolution / yearsOfData

    console.log(`   📈 Évolution long terme (${yearsOfData.toFixed(1)} ans): ${evolutionLongTerm.toFixed(2)}%/an`)

    // CALCUL 2: Évolution sur les 10 dernières années (si disponible)
    let evolution10y = evolutionLongTerm // Par défaut, utiliser l'évolution long terme

    if (prices.length >= 120) {
      // Si on a au moins 10 ans de données, calculer l'évolution sur 10 ans
      const avg10yAgo = prices.slice(108, 120).reduce((a, b) => a + b, 0) / 12
      if (avg10yAgo > 0) {
        const evolution10yTotal = ((recentAvg - avg10yAgo) / avg10yAgo) * 100
        evolution10y = evolution10yTotal / 10
        console.log(`   📈 Évolution 10 ans: ${evolution10y.toFixed(2)}%/an`)
      }
    } else {
      console.log(`   ℹ️  Pas assez de données pour calcul 10 ans (${prices.length}/120), utilisation évolution long terme`)
    }

    // CALCUL FINAL: Moyenne pondérée (30% long terme + 70% 10 dernières années)
    const weightedEvolution = (evolutionLongTerm * 0.3) + (evolution10y * 0.7)

    console.log(`   🎯 Évolution pondérée finale (30% LT + 70% 10y): ${weightedEvolution.toFixed(2)}%/an`)
    console.log(`   Prix ancien: ${oldestAvg.toFixed(2)} €/100kWh → Prix récent: ${recentAvg.toFixed(2)} €/100kWh`)

    // Arrondir à 1 décimale
    return Math.round(weightedEvolution * 10) / 10
  } catch (error) {
    console.error(`Erreur lors du calcul de l'évolution pour ${priceColumnName}:`, error)
    return 0
  }
}
