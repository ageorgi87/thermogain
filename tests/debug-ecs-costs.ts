/**
 * Debug des coûts ECS pour comprendre l'écart
 */

import { prisma } from '@/lib/prisma'
import { calculateEcsCosts } from '../app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateEcsCosts'
import type { ProjectData } from '../types/projectData'

const debugEcsCosts = async () => {
  console.log('\n🔍 Debug - Coûts ECS\n')

  // Scénario test: Appartement GAZ avec ECS intégrée
  const testData: ProjectData = {
    // Logement
    code_postal: '83000',
    surface_logement: 70,
    nombre_occupants: 3,
    classe_dpe: 'C',

    // Chauffage actuel
    type_chauffage: 'Gaz',
    ecs_integrated: true, // ← ECS INTÉGRÉE
    conso_gaz_kwh: 5000,
    prix_gaz_kwh: 0.10,
    abonnement_gaz: 120,
    entretien_annuel: 120,

    // Projet PAC
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
    with_ecs_management: true, // ← PAC GÈRE L'ECS

    // Coûts
    cout_total: 11500,

    // Reste à charge
    reste_a_charge: 8000,

    // Financement
    mode_financement: 'Comptant',
    apport_personnel: 8000,
  }

  console.log('📊 DONNÉES D\'ENTRÉE:\n')
  console.log(`   ECS intégrée: ${testData.ecs_integrated}`)
  console.log(`   PAC gère l'ECS: ${testData.with_ecs_management}`)
  console.log(`   Nombre d'occupants: ${testData.nombre_occupants}`)
  console.log(`   Consommation totale (chauffage+ECS): ${testData.conso_gaz_kwh} kWh/an`)
  console.log(`   Prix gaz: ${testData.prix_gaz_kwh}€/kWh`)
  console.log(`   Prix élec PAC: ${testData.prix_elec_pac}€/kWh`)
  console.log(`   COP ajusté: ${testData.cop_ajuste}\n`)

  const ecsCosts = calculateEcsCosts(testData)

  console.log('🔍 RÉSULTATS CALCUL ECS:\n')
  console.log(`   Scénario: ${ecsCosts.scenario}`)
  console.log(`   Consommation ECS: ${ecsCosts.ecsConsumptionKwh.toFixed(0)} kWh/an`)
  console.log(`   Estimation ADEME: ${ecsCosts.isEstimated ? 'OUI' : 'NON'}\n`)

  console.log(`   Coût ECS actuel: ${ecsCosts.currentEcsCost.toFixed(2)}€/an`)
  console.log(`   Coût ECS futur (PAC): ${ecsCosts.futureEcsCost.toFixed(2)}€/an`)
  console.log(`   Économies ECS: ${ecsCosts.ecsEconomiesAnnuelles.toFixed(2)}€/an\n`)

  // Calcul détaillé
  if (ecsCosts.scenario === 'B') {
    console.log('📐 DÉTAILS DU CALCUL (Scénario B):\n')

    const nombreOccupants = testData.nombre_occupants || 4
    const besoinsEcsEstimes = nombreOccupants * 800 // ADEME: 800 kWh/personne/an
    console.log(`   Besoins ECS estimés: ${nombreOccupants} personnes × 800 kWh = ${besoinsEcsEstimes} kWh/an`)

    const coutEcsActuel = besoinsEcsEstimes * testData.prix_gaz_kwh!
    console.log(`   Coût ECS actuel: ${besoinsEcsEstimes} kWh × ${testData.prix_gaz_kwh}€ = ${coutEcsActuel}€/an`)

    const copEcs = testData.cop_ajuste * 0.9 // COP ECS = COP chauffage × 0.9
    console.log(`   COP ECS: ${testData.cop_ajuste} × 0.9 = ${copEcs.toFixed(2)}`)

    const consoElecEcs = besoinsEcsEstimes / copEcs
    console.log(`   Consommation élec ECS: ${besoinsEcsEstimes} kWh ÷ ${copEcs.toFixed(2)} = ${consoElecEcs.toFixed(0)} kWh/an`)

    const coutEcsFutur = consoElecEcs * testData.prix_elec_pac!
    console.log(`   Coût ECS futur: ${consoElecEcs.toFixed(0)} kWh × ${testData.prix_elec_pac}€ = ${coutEcsFutur.toFixed(2)}€/an`)

    const economiesEcs = coutEcsActuel - coutEcsFutur
    console.log(`   Économies ECS: ${coutEcsActuel}€ - ${coutEcsFutur.toFixed(2)}€ = ${economiesEcs.toFixed(2)}€/an`)
  }

  console.log('\n✅ Debug terminé\n')
  await prisma.$disconnect()
}

debugEcsCosts()
