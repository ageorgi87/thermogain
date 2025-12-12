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

      logement: {
        create: {
          code_postal: '83000', // H3 sud
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
          conso_gaz_kwh: 5000,
          prix_gaz_kwh: 0.10,
          abonnement_gaz: 120,
          entretien_annuel: 120,
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
          prix_elec_kwh: 0.2516,
          prix_elec_pac: 0.2276,
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
          montant_credit: undefined,
          taux_interet: undefined,
          duree_credit_mois: undefined,
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
    console.log(`   Économies annuelles: ${r.economiesAnnuelles}€`)
    console.log(`   ROI: ${r.paybackPeriod} ans`)
    console.log(`   Bénéfice net 17 ans: ${r.netBenefitLifetime}€`)
    console.log(`   Coût total PAC lifetime: ${r.coutTotalPacLifetime}€`)
    console.log(`   Investissement réel: ${r.investissementReel}€`)
  } else {
    console.log(`   ⚠️  Aucun résultat trouvé`)
  }

  // Nettoyage
  await prisma.user.delete({ where: { id: user.id } })
  await prisma.$disconnect()
  console.log(`\n✅ Nettoyage terminé`)
}

debugTest()
