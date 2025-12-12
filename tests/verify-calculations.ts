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

      logement: {
        create: {
          code_postal: '83000', // Var - H3 sud
          annee_construction: 2005,
          surface_logement: 70,
          nombre_occupants: 3,
          classe_dpe: 'C',
        },
      },

      chauffageActuel: {
        create: {
          type_chauffage: 'Gaz',
          age_installation: 12,
          etat_installation: 'Bon',
          ecs_integrated: true,
          conso_gaz_kwh: 5000, // 5000 kWh/an de gaz
          prix_gaz_kwh: 0.10, // 0.10€/kWh
          abonnement_gaz: 120, // 120€/an
          entretien_annuel: 120, // 120€/an
        },
      },

      projetPac: {
        create: {
          type_pac: 'Air/Eau',
          puissance_pac_kw: 6,
          cop_estime: 3.8,
          cop_ajuste: 3.5,
          emetteurs: 'Radiateurs basse température',
          duree_vie_pac: 17,
          prix_elec_kwh: 0.2516, // Prix base
          prix_elec_pac: 0.2276, // Prix PAC (heures creuses)
          puissance_souscrite_actuelle: 3,
          puissance_souscrite_pac: 6,
          entretien_pac_annuel: 180,
          with_ecs_management: true,
        },
      },

      couts: {
        create: {
          cout_pac: 8000,
          cout_installation: 2000,
          cout_travaux_annexes: 1500,
          cout_total: 11500,
        },
      },

      aides: {
        create: {
          type_logement: 'appartement',
          revenu_fiscal_reference: 35000,
          residence_principale: true,
          remplacement_complet: true,
          ma_prime_renov: 2000,
          cee: 1500,
          autres_aides: 0,
          total_aides: 3500,
        },
      },

      financement: {
        create: {
          mode_financement: 'Comptant',
          apport_personnel: 8000,
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
