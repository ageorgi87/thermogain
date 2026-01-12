import { prisma } from "@/lib/prisma"
import { calculateAllResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateAllResults"
import { getProjectDataForCalculationsWithoutAuth } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/queries/getProjectDataForCalculationsWithoutAuth"

const PROJECT_ID = "cmkb5x4pf0001ms3f37q5jc3h"

const main = async () => {
  console.log("🔄 Recalcul des résultats du projet:", PROJECT_ID)
  console.log("─".repeat(80))

  try {
    // Récupérer les données du projet SANS vérification auth
    const projectData = await prisma.project.findUnique({
      where: { id: PROJECT_ID },
      include: {
        information: true,
        housing: true,
        currentHeating: true,
        currentDhw: true,
        heatPump: true,
        costs: true,
        financialAid: true,
        financing: true,
        results: true,
      }
    })

    if (!projectData) {
      console.log("❌ Projet non trouvé")
      return
    }

    // Convertir en ProjectData
    const data: any = {
      // Information
      postalCode: projectData.information?.postalCode,
      climateZone: projectData.information?.climateZone,

      // Housing
      constructionYear: projectData.housing?.constructionYear,
      habitableSurface: projectData.housing?.habitableSurface,
      occupants: projectData.housing?.occupants,
      insulationQuality: projectData.housing?.insulationQuality,

      // Current Heating
      heatingType: projectData.currentHeating?.heatingType,
      installationAge: projectData.currentHeating?.installationAge,
      installationCondition: projectData.currentHeating?.installationCondition,
      dhwIntegrated: projectData.currentHeating?.dhwIntegrated,
      fuelConsumptionLiters: projectData.currentHeating?.fuelConsumptionLiters,
      fuelPricePerLiter: projectData.currentHeating?.fuelPricePerLiter,
      gasConsumptionKwh: projectData.currentHeating?.gasConsumptionKwh,
      gasPricePerKwh: projectData.currentHeating?.gasPricePerKwh,
      gasSubscription: projectData.currentHeating?.gasSubscription,
      lpgConsumptionKg: projectData.currentHeating?.lpgConsumptionKg,
      lpgPricePerKg: projectData.currentHeating?.lpgPricePerKg,
      pelletsConsumptionKg: projectData.currentHeating?.pelletsConsumptionKg,
      pelletsPricePerKg: projectData.currentHeating?.pelletsPricePerKg,
      woodConsumptionSteres: projectData.currentHeating?.woodConsumptionSteres,
      woodPricePerStere: projectData.currentHeating?.woodPricePerStere,
      electricityConsumptionKwh: projectData.currentHeating?.electricityConsumptionKwh,
      electricityPricePerKwh: projectData.currentHeating?.electricityPricePerKwh,
      currentCop: projectData.currentHeating?.currentCop,
      heatPumpConsumptionKwh: projectData.currentHeating?.heatPumpConsumptionKwh,
      annualMaintenance: projectData.currentHeating?.annualMaintenance,

      // Current DHW
      dhwSystemType: projectData.currentDhw?.dhwSystemType,
      dhwConsumptionKnown: projectData.currentDhw?.dhwConsumptionKnown,
      dhwConsumptionKwh: projectData.currentDhw?.dhwConsumptionKwh,
      dhwEnergyPricePerKwh: projectData.currentDhw?.dhwEnergyPricePerKwh,
      dhwAnnualMaintenance: projectData.currentDhw?.dhwAnnualMaintenance,

      // Heat Pump
      heatPumpType: projectData.heatPump?.heatPumpType,
      heatPumpPowerKw: projectData.heatPump?.heatPumpPowerKw,
      estimatedCop: projectData.heatPump?.estimatedCop,
      adjustedCop: projectData.heatPump?.adjustedCop,
      heatPumpLifespanYears: projectData.heatPump?.heatPumpLifespanYears,
      emitters: projectData.heatPump?.emitters,
      currentSubscribedPowerKva: projectData.heatPump?.currentSubscribedPowerKva,
      heatPumpSubscribedPowerKva: projectData.heatPump?.heatPumpSubscribedPowerKva,
      heatPumpElectricityPricePerKwh: projectData.heatPump?.electricityPricePerKwh,
      annualMaintenanceCost: projectData.heatPump?.annualMaintenanceCost,
      withDhwManagement: projectData.heatPump?.withDhwManagement,

      // Costs
      heatPumpCost: projectData.costs?.heatPumpCost,
      installationCost: projectData.costs?.installationCost,
      additionalWorksCost: projectData.costs?.additionalWorksCost,
      totalCost: projectData.costs?.totalCost,

      // Financial Aid
      maprimeRenovAmount: projectData.financialAid?.maprimeRenovAmount,
      ceeAmount: projectData.financialAid?.ceeAmount,
      totalAidAmount: projectData.financialAid?.totalAidAmount,
      remainingCost: projectData.financialAid?.remainingCost,

      // Financing
      financingMode: projectData.financing?.financingMode,
      downPayment: projectData.financing?.downPayment,
      loanAmount: projectData.financing?.loanAmount,
      interestRate: projectData.financing?.interestRate,
      loanDurationMonths: projectData.financing?.loanDurationMonths,
    }

    // Calculer les résultats
    const results = await calculateAllResults(data)

    // Sauvegarder en BDD
    await prisma.results.upsert({
      where: { projectId: PROJECT_ID },
      create: {
        projectId: PROJECT_ID,
        ...results,
      },
      update: results,
    })

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
