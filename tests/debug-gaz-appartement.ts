/**
 * Debug - Scénario Gaz Appartement qui produit des NaN
 */

import { prisma } from '@/lib/prisma'
import { calculateAndSaveResultsTestMode } from '@/tests/lib/calculateAndSaveResultsTestMode'

const debugTest = async () => {
  console.log('\n🔍 Debug - Gaz Appartement (Comptant)\n')

  const user = await prisma.user.create({
    data: {
      email: `debug-gaz-${Date.now()}@test.local`,
      password: 'test',
      firstName: 'Debug',
      lastName: 'Test',
      company: 'Test',
      phone: '0600000000',
      siret: '12345678900001',
      emailVerified: new Date(),
    },
  })

  console.log(`✅ Utilisateur créé: ${user.id}`)

  // Scénario exact: Gaz 1 (i=0, i%3=0)
  const i = 0
  const project = await prisma.project.create({
    data: {
      name: 'Debug - Gaz Appartement',
      userId: user.id,
      currentStep: 8,
      completed: true,

      housing: {
        create: {
          postalCode: '83000', // H3 sud
          constructionYear: 2005,
          livingArea: 70,
          numberOfOccupants: 3,
          dpeRating: 'C',
        },
      },

      currentHeating: {
        create: {
          heatingType: 'Gaz',
          installationAge: 12,
          installationCondition: 'Bon',
          dhwIntegrated: true,
          gasConsumptionKwh: 5000,
          gasPricePerKwh: 0.10,
          gasSubscription: 120,
          annualMaintenance: 120,
        },
      },

      heatPump: {
        create: {
          heatPumpType: 'Air/Eau',
          heatPumpPowerKw: 6,
          estimatedCop: 3.8,
          adjustedCop: 3.5,
          emitters: 'Radiateurs basse température',
          heatPumpLifespanYears: 17,
          electricityPricePerKwh: 0.2516,
          heatPumpElectricityPricePerKwh: 0.2276,
          currentSubscribedPowerKva: 3,
          heatPumpSubscribedPowerKva: 6,
          annualMaintenanceCost: 180,
          withDhwManagement: true,
        },
      },

      costs: {
        create: {
          heatPumpCost: 8000,
          installationCost: 2000,
          additionalWorkCost: 1500,
          totalCost: 11500,
        },
      },

      financialAid: {
        create: {
          housingType: 'appartement',
          referenceTaxIncome: 35000,
          isPrimaryResidence: true,
          isCompleteReplacement: true,
          maPrimeRenov: 2000,
          cee: 1500,
          otherAid: 0,
          totalAid: 3500,
        },
      },

      financing: {
        create: {
          financingMode: 'Comptant',
          downPayment: 8000,
          loanAmount: undefined,
          interestRate: undefined,
          loanDurationMonths: undefined,
        },
      },
    },
  })

  console.log(`✅ Projet créé: ${project.id}\n`)

  // Calculer les résultats
  console.log(`🔧 Calcul des résultats...`)
  try {
    await calculateAndSaveResultsTestMode(project.id)
    console.log(`✅ Calculs terminés\n`)
  } catch (error) {
    console.error(`❌ Erreur de calcul:`, error)
    await prisma.user.delete({ where: { id: user.id } })
    await prisma.$disconnect()
    process.exit(1)
  }

  // Récupérer les résultats
  const projectWithResults = await prisma.project.findUnique({
    where: { id: project.id },
    include: { results: true },
  })

  console.log(`📊 Résultats:`)
  if (projectWithResults?.results) {
    const r = projectWithResults.results
    console.log(`   Économies annuelles: ${r.annualSavings}€`)
    console.log(`   ROI: ${r.paybackPeriod} ans`)
    console.log(`   Bénéfice net 17 ans: ${r.netBenefitLifetime}€`)
    console.log(`   Coût total PAC lifetime: ${r.totalHeatPumpCostLifetime}€`)
    console.log(`   Investissement réel: ${r.actualInvestment}€`)
  } else {
    console.log(`   ⚠️  Aucun résultat trouvé`)
  }

  // Nettoyage
  await prisma.user.delete({ where: { id: user.id } })
  await prisma.$disconnect()
  console.log(`\n✅ Nettoyage terminé`)
}

debugTest()
