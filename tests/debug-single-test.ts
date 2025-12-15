/**
 * Debug script - Test un seul scénario pour comprendre le problème
 */

import { prisma } from '@/lib/prisma'
import { calculateAndSaveResultsTestMode } from '@/tests/lib/calculateAndSaveResultsTestMode'

const debugTest = async () => {
  console.log('\n🔍 Debug Test - Scénario Fioul Simple\n')

  // Créer un utilisateur de test
  const user = await prisma.user.create({
    data: {
      email: `debug-${Date.now()}@test.local`,
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

  // Créer un projet simple
  const project = await prisma.project.create({
    data: {
      name: 'Debug - Fioul Simple',
      userId: user.id,
      currentStep: 8,
      completed: true,

      housing: {
        create: {
          postalCode: '75001',
          constructionYear: 1990,
          livingArea: 100,
          numberOfOccupants: 3,
          dpeRating: 'D',
        },
      },

      currentHeating: {
        create: {
          heatingType: 'Fioul',
          installationAge: 15,
          installationCondition: 'Moyen',
          dhwIntegrated: true,
          fuelConsumptionLiters: 1500,
          fuelPricePerLiter: 1.50,
          annualMaintenance: 150,
        },
      },

      heatPump: {
        create: {
          heatPumpType: 'Air/Eau',
          heatPumpPowerKw: 10,
          estimatedCop: 3.5,
          adjustedCop: 3.2,
          emitters: 'Radiateurs basse température',
          heatPumpLifespanYears: 17,
          electricityPricePerKwh: 0.2516,
          heatPumpElectricityPricePerKwh: 0.2276,
          currentSubscribedPowerKva: 6,
          heatPumpSubscribedPowerKva: 9,
          annualMaintenanceCost: 200,
          withDhwManagement: true,
        },
      },

      couts: {
        create: {
          cout_pac: 12000,
          cout_installation: 3000,
          cout_travaux_annexes: 2000,
          cout_total: 17000,
        },
      },

      aides: {
        create: {
          type_logement: 'maison',
          revenu_fiscal_reference: 30000,
          residence_principale: true,
          remplacement_complet: true,
          ma_prime_renov: 4000,
          cee: 2500,
          autres_aides: 0,
          total_aides: 6500,
        },
      },

      financement: {
        create: {
          mode_financement: 'Crédit',
          apport_personnel: 0,
          montant_credit: 10500,
          taux_interet: 3.0,
          duree_credit_mois: 84,
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

  // Récupérer et afficher les résultats
  const projectWithResults = await prisma.project.findUnique({
    where: { id: project.id },
    include: { results: true },
  })

  console.log(`📊 Résultats récupérés:`)
  console.log(`   results existe: ${projectWithResults?.results ? 'OUI' : 'NON'}`)

  if (projectWithResults?.results) {
    console.log(`   Économies annuelles: ${projectWithResults.results.economiesAnnuelles}€`)
    console.log(`   ROI: ${projectWithResults.results.paybackPeriod} ans`)
    console.log(`   Bénéfice net 17 ans: ${projectWithResults.results.netBenefitLifetime}€`)
  } else {
    console.log(`   ⚠️  Aucun résultat trouvé !`)

    // Essayer de récupérer directement
    const directResults = await prisma.projectResults.findUnique({
      where: { projectId: project.id },
    })

    console.log(`   Résultats directs: ${directResults ? 'TROUVÉS' : 'NON TROUVÉS'}`)
    if (directResults) {
      console.log(`   Économies: ${directResults.economiesAnnuelles}€`)
      console.log(`   ROI: ${directResults.paybackPeriod} ans`)
    }
  }

  // Nettoyage
  await prisma.user.delete({ where: { id: user.id } })
  await prisma.$disconnect()
  console.log(`\n✅ Nettoyage terminé`)
}

debugTest()
