/**
 * Debug des coûts ECS pour comprendre l'écart
 */

import { prisma } from '@/lib/prisma'
import { calculateDhwCosts } from '../app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/calculateDhwCosts'
import type { ProjectData } from '../types/projectData'

const debugEcsCosts = async () => {
  console.log('\n🔍 Debug - Coûts ECS\n')

  // Scénario test: Appartement GAZ avec ECS intégrée
  const testData: ProjectData = {
    // Logement
    postalCode: '83000',
    livingArea: 70,
    numberOfOccupants: 3,
    dpeRating: 'C',

    // Chauffage actuel
    heatingType: 'Gaz',
    dhwIntegrated: true, // ← ECS INTÉGRÉE
    gasConsumptionKwh: 5000,
    gasPricePerKwh: 0.10,
    gasSubscription: 120,
    annualMaintenance: 120,

    // Projet PAC
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
    withDhwManagement: true, // ← PAC GÈRE L'ECS

    // Coûts
    totalCost: 11500,

    // Reste à charge
    remainingCost: 8000,

    // Financement
    financingMode: 'Comptant',
    downPayment: 8000,
  }

  console.log('📊 DONNÉES D\'ENTRÉE:\n')
  console.log(`   ECS intégrée: ${testData.dhwIntegrated}`)
  console.log(`   PAC gère l'ECS: ${testData.withDhwManagement}`)
  console.log(`   Nombre d'occupants: ${testData.numberOfOccupants}`)
  console.log(`   Consommation totale (chauffage+ECS): ${testData.gasConsumptionKwh} kWh/an`)
  console.log(`   Prix gaz: ${testData.gasPricePerKwh}€/kWh`)
  console.log(`   Prix élec PAC: ${testData.heatPumpElectricityPricePerKwh}€/kWh`)
  console.log(`   COP ajusté: ${testData.adjustedCop}\n`)

  const dhwCosts = calculateDhwCosts(testData)

  console.log('🔍 RÉSULTATS CALCUL ECS:\n')
  console.log(`   Scénario: ${dhwCosts.scenario}`)
  console.log(`   Consommation ECS: ${dhwCosts.dhwConsumptionKwh.toFixed(0)} kWh/an`)
  console.log(`   Estimation ADEME: ${dhwCosts.isEstimated ? 'OUI' : 'NON'}\n`)

  console.log(`   Coût ECS actuel: ${dhwCosts.currentDhwCost.toFixed(2)}€/an`)
  console.log(`   Coût ECS futur (PAC): ${dhwCosts.futureDhwCost.toFixed(2)}€/an`)
  console.log(`   Économies ECS: ${dhwCosts.dhwEconomiesAnnuelles.toFixed(2)}€/an\n`)

  // Calcul détaillé
  if (dhwCosts.scenario === 'B') {
    console.log('📐 DÉTAILS DU CALCUL (Scénario B):\n')

    const nombreOccupants = testData.numberOfOccupants || 4
    const besoinsEcsEstimes = nombreOccupants * 800 // ADEME: 800 kWh/personne/an
    console.log(`   Besoins ECS estimés: ${nombreOccupants} personnes × 800 kWh = ${besoinsEcsEstimes} kWh/an`)

    const coutEcsActuel = besoinsEcsEstimes * testData.gasPricePerKwh!
    console.log(`   Coût ECS actuel: ${besoinsEcsEstimes} kWh × ${testData.gasPricePerKwh}€ = ${coutEcsActuel}€/an`)

    const copEcs = testData.adjustedCop * 0.9 // COP ECS = COP chauffage × 0.9
    console.log(`   COP ECS: ${testData.adjustedCop} × 0.9 = ${copEcs.toFixed(2)}`)

    const consoElecEcs = besoinsEcsEstimes / copEcs
    console.log(`   Consommation élec ECS: ${besoinsEcsEstimes} kWh ÷ ${copEcs.toFixed(2)} = ${consoElecEcs.toFixed(0)} kWh/an`)

    const coutEcsFutur = consoElecEcs * testData.heatPumpElectricityPricePerKwh!
    console.log(`   Coût ECS futur: ${consoElecEcs.toFixed(0)} kWh × ${testData.heatPumpElectricityPricePerKwh}€ = ${coutEcsFutur.toFixed(2)}€/an`)

    const economiesEcs = coutEcsActuel - coutEcsFutur
    console.log(`   Économies ECS: ${coutEcsActuel}€ - ${coutEcsFutur.toFixed(2)}€ = ${economiesEcs.toFixed(2)}€/an`)
  }

  console.log('\n✅ Debug terminé\n')
  await prisma.$disconnect()
}

debugEcsCosts()
