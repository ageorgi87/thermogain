/**
 * Script pour vérifier la justesse des calculs
 * Analyse détaillée d'un scénario type
 */

import { prisma } from '@/lib/prisma'
import { calculateAndSaveResultsTestMode } from '@/tests/lib/calculateAndSaveResultsTestMode'

const verifCalculs = async () => {
  console.log('\n🔍 Vérification de la justesse des calculs\n')
  console.log('Scénario: Appartement 70m² - Chauffage GAZ → PAC Air/Eau\n')

  const user = await prisma.user.create({
    data: {
      email: `verify-${Date.now()}@test.local`,
      password: 'test',
      firstName: 'Verify',
      lastName: 'Test',
      company: 'Test',
      phone: '0600000000',
      siret: '12345678900001',
      emailVerified: new Date(),
    },
  })

  // Scénario réaliste: Appartement avec gaz
  const project = await prisma.project.create({
    data: {
      name: 'Vérification Calculs - Gaz Appartement',
      userId: user.id,
      currentStep: 8,
      completed: true,

      housing: {
        create: {
          postalCode: '83000', // Var - H3 sud
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
          gasConsumptionKwh: 5000, // 5000 kWh/an de gaz
          gasPricePerKwh: 0.10, // 0.10€/kWh
          gasSubscription: 120, // 120€/an
          annualMaintenance: 120, // 120€/an
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
          electricityPricePerKwh: 0.2516, // Prix base
          heatPumpElectricityPricePerKwh: 0.2276, // Prix PAC (heures creuses)
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
        },
      },
    },
  })

  console.log('📊 DONNÉES D\'ENTRÉE:\n')

  // Chauffage actuel
  console.log('💰 Coût actuel (GAZ):')
  const coutGazEnergie = 5000 * 0.10
  const coutGazAbonnement = 120
  const coutGazEntretien = 120
  const coutGazTotal = coutGazEnergie + coutGazAbonnement + coutGazEntretien

  console.log(`   Énergie: 5000 kWh × 0.10€ = ${coutGazEnergie}€/an`)
  console.log(`   Abonnement gaz: ${coutGazAbonnement}€/an`)
  console.log(`   Entretien: ${coutGazEntretien}€/an`)
  console.log(`   → Total: ${coutGazTotal}€/an\n`)

  // PAC future
  console.log('⚡ Coût futur (PAC):')
  console.log('   COP ajusté: 3.5')
  const consoElecPac = 5000 / 3.5 // Conso élec pour produire 5000 kWh de chaleur
  console.log(`   Consommation élec PAC: 5000 kWh ÷ 3.5 = ${consoElecPac.toFixed(0)} kWh/an`)

  const coutElecPac = consoElecPac * 0.2276
  console.log(`   Énergie PAC: ${consoElecPac.toFixed(0)} kWh × 0.2276€ = ${coutElecPac.toFixed(0)}€/an`)

  // Augmentation abonnement élec
  const diffAbonnement = (6 - 3) * 5.29 * 12 // Différence de puissance × prix/kVA/mois × 12 mois
  console.log(`   Augmentation abonnement élec: (6-3) kVA × 5.29€/kVA/mois × 12 = ${diffAbonnement.toFixed(0)}€/an`)

  // Abonnement gaz supprimé
  console.log(`   Suppression abonnement gaz: -${coutGazAbonnement}€/an`)

  const coutEntretienPac = 180
  console.log(`   Entretien PAC: ${coutEntretienPac}€/an`)

  const coutPacTotal = coutElecPac + diffAbonnement - coutGazAbonnement + coutEntretienPac
  console.log(`   → Total: ${coutPacTotal.toFixed(0)}€/an\n`)

  // Économies théoriques
  const economiesTheorique = coutGazTotal - coutPacTotal
  console.log(`💡 ÉCONOMIES THÉORIQUES:`)
  console.log(`   ${coutGazTotal}€ (gaz) - ${coutPacTotal.toFixed(0)}€ (PAC) = ${economiesTheorique.toFixed(0)}€/an\n`)

  // Calcul réel
  console.log('🔧 Lancement du calcul...\n')
  await calculateAndSaveResultsTestMode(project.id)

  const projectWithResults = await prisma.project.findUnique({
    where: { id: project.id },
    include: { results: true },
  })

  if (projectWithResults?.results) {
    const r = projectWithResults.results
    console.log('📊 RÉSULTATS CALCULÉS:\n')
    console.log(`   Économies annuelles: ${r.economiesAnnuelles}€/an`)
    console.log(`   ROI: ${r.paybackPeriod ? r.paybackPeriod.toFixed(1) + ' ans' : 'N/A'}`)
    console.log(`   Bénéfice net sur 17 ans: ${r.netBenefitLifetime}€`)
    console.log(`   Coût total PAC (17 ans): ${r.coutTotalPacLifetime}€`)
    console.log(`   Investissement réel: ${r.investissementReel}€\n`)

    // Comparaison
    console.log('🔍 ANALYSE:\n')
    const diff = economiesTheorique - r.economiesAnnuelles
    console.log(`   Différence économies théorique vs calculé: ${diff.toFixed(0)}€`)

    if (Math.abs(diff) > 50) {
      console.log(`   ⚠️  Écart important détecté!`)
    } else {
      console.log(`   ✅ Calculs cohérents`)
    }

    // Vérification ROI
    if (r.economiesAnnuelles > 0 && r.investissementReel > 0) {
      const roiTheorique = r.investissementReel / r.economiesAnnuelles
      console.log(`\n   ROI théorique: ${r.investissementReel}€ ÷ ${r.economiesAnnuelles}€ = ${roiTheorique.toFixed(1)} ans`)
      console.log(`   ROI calculé: ${r.paybackPeriod?.toFixed(1)} ans`)
    } else {
      console.log(`\n   ⚠️  Économies négatives ou nulles → Pas de ROI`)
    }

    // Vérification bénéfice net
    const beneficeTheorique = (r.economiesAnnuelles * 17) - r.investissementReel
    console.log(`\n   Bénéfice net théorique: (${r.economiesAnnuelles}€ × 17) - ${r.investissementReel}€ = ${beneficeTheorique.toFixed(0)}€`)
    console.log(`   Bénéfice net calculé: ${r.netBenefitLifetime}€`)
    const diffBenefice = Math.abs(beneficeTheorique - r.netBenefitLifetime)
    if (diffBenefice > 100) {
      console.log(`   ⚠️  Écart de ${diffBenefice.toFixed(0)}€ détecté!`)
    } else {
      console.log(`   ✅ Cohérent`)
    }
  }

  // Nettoyage
  await prisma.user.delete({ where: { id: user.id } })
  await prisma.$disconnect()
  console.log('\n✅ Vérification terminée\n')
}

verifCalculs()
