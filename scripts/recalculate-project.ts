import { prisma } from "@/lib/prisma"
import { calculateAndSaveResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/calculateAndSaveResults"

const PROJECT_ID = "cmkb5x4pf0001ms3f37q5jc3h"

const main = async () => {
  console.log("🔄 Recalcul des résultats du projet:", PROJECT_ID)
  console.log("─".repeat(80))

  try {
    // Recalculer les résultats
    await calculateAndSaveResults({ projectId: PROJECT_ID })

    // Récupérer les nouveaux résultats
    const results = await prisma.results.findUnique({
      where: { projectId: PROJECT_ID }
    })

    if (!results) {
      console.log("❌ Aucun résultat trouvé")
      return
    }

    console.log("\n✅ NOUVEAUX RÉSULTATS CALCULÉS\n")

    console.log("📊 COÛTS ANNUELS:")
    console.log(`   • Chauffage actuel: ${results.currentAnnualCost} €/an (${Math.round(results.currentAnnualCost / 12)} €/mois)`)
    console.log(`   • Avec PAC:         ${results.heatPumpAnnualCost} €/an (${Math.round(results.heatPumpAnnualCost / 12)} €/mois)`)
    console.log(`   • Économies:        ${results.annualSavings} €/an (${Math.round(results.annualSavings / 12)} €/mois)`)

    console.log("\n💰 RENTABILITÉ:")
    console.log(`   • Investissement réel: ${results.actualInvestment} €`)
    console.log(`   • Retour sur investissement: ${results.paybackPeriod ? results.paybackPeriod.toFixed(1) + ' ans' : 'Non rentable'}`)
    console.log(`   • Année de ROI: ${results.paybackYear || 'N/A'}`)
    console.log(`   • Gain net sur ${results.yearlyData.length} ans: ${results.netBenefitLifetime} €`)
    console.log(`   • Taux de rentabilité annuel: ${results.profitabilityRate ? results.profitabilityRate.toFixed(1) + '%' : 'N/A'}`)

    console.log("\n📅 DÉTAIL ANNÉE 1:")
    if (results.yearlyData && results.yearlyData.length > 0) {
      const year1 = results.yearlyData[0] as any
      console.log(`   • Coût chauffage actuel: ${year1.currentCost} €`)
      console.log(`   • Coût avec PAC: ${year1.heatPumpCost} €`)
      console.log(`   • Économie: ${year1.savings} €`)
    }

    console.log("\n" + "─".repeat(80))
    console.log("✅ Recalcul terminé avec succès!")

  } catch (error) {
    console.error("❌ Erreur lors du recalcul:", error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
