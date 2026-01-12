/**
 * ANALYSE DÉTAILLÉE DES COÛTS MENSUELS DE LA PAC
 * Project: cmkb5x4pf0001ms3f37q5jc3h - Test 10
 */

// Données extraites de la base de données
const projectData = {
  // CHAUFFAGE ACTUEL - GAZ
  currentHeating: {
    heatingType: "Gaz",
    gasConsumptionKwh: 15000,
    gasPricePerKwh: 0.134,
    gasSubscription: 120, // €/an
    annualMaintenance: 150, // €/an
    dhwIntegrated: true,
  },

  // PROJET PAC
  heatPump: {
    heatPumpType: "Air/Eau",
    heatPumpPowerKw: 8,
    estimatedCop: 3.5,
    adjustedCop: 2.36,
    heatPumpLifespanYears: 20,
    electricityPricePerKwh: 0.26,
    currentSubscribedPowerKva: 6,
    heatPumpSubscribedPowerKva: 9,
    annualMaintenanceCost: 20, // €/an
    withDhwManagement: true,
  },

  // RÉSULTATS CALCULÉS
  results: {
    currentAnnualCost: 2709, // €/an
    heatPumpAnnualCost: 2320, // €/an
    annualSavings: 926, // €/an
    consommationPacKwh: 6356, // kWh/an
    currentMonthlyCost: 226, // €/mois
    heatPumpMonthlyCost: 193, // €/mois
    monthlySavings: 77, // €/mois
  },
}

console.log('=' .repeat(100))
console.log('ANALYSE DÉTAILLÉE DES COÛTS MENSUELS DE LA PAC')
console.log('Project ID: cmkb5x4pf0001ms3f37q5jc3h - Test 10')
console.log('=' .repeat(100))

console.log('\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('1. COÛT ACTUEL DU CHAUFFAGE GAZ')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const gazConsomEnergieAnnuelle = projectData.currentHeating.gasConsumptionKwh
const gazPrixKwh = projectData.currentHeating.gasPricePerKwh
const gazAbonnementAnnuel = projectData.currentHeating.gasSubscription
const gazEntretienAnnuel = projectData.currentHeating.annualMaintenance

const gazCoutEnergieAnnuel = gazConsomEnergieAnnuelle * gazPrixKwh
const gazCoutTotalAnnuel = gazCoutEnergieAnnuel + gazAbonnementAnnuel + gazEntretienAnnuel
const gazCoutMensuel = gazCoutTotalAnnuel / 12

console.log('\n📊 Composantes du coût annuel:')
console.log('   ├─ Consommation gaz:           ', gazConsomEnergieAnnuelle.toLocaleString('fr-FR'), 'kWh/an')
console.log('   ├─ Prix du gaz:                ', gazPrixKwh.toFixed(3), '€/kWh')
console.log('   ├─ Coût énergie (conso × prix):', gazCoutEnergieAnnuel.toFixed(2), '€/an')
console.log('   ├─ Abonnement gaz:             ', gazAbonnementAnnuel.toFixed(2), '€/an')
console.log('   └─ Entretien annuel:           ', gazEntretienAnnuel.toFixed(2), '€/an')
console.log('')
console.log('💰 COÛT TOTAL ANNUEL GAZ:         ', gazCoutTotalAnnuel.toFixed(2), '€/an')
console.log('💰 COÛT MENSUEL GAZ:              ', gazCoutMensuel.toFixed(2), '€/mois')
console.log('')
console.log('   Vérification avec results.currentAnnualCost:', projectData.results.currentAnnualCost, '€/an')
console.log('   Vérification avec results.currentMonthlyCost:', projectData.results.currentMonthlyCost, '€/mois')

console.log('\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('2. COÛT FUTUR AVEC POMPE À CHALEUR')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const pacConsomElecAnnuelle = projectData.results.consommationPacKwh
const pacPrixElecKwh = projectData.heatPump.electricityPricePerKwh
const pacEntretienAnnuel = projectData.heatPump.annualMaintenanceCost

// CALCUL DE L'ABONNEMENT ÉLECTRIQUE
// Puissance souscrite ACTUELLE (pour usages hors chauffage)
const puissanceActuelleKva = projectData.heatPump.currentSubscribedPowerKva
const puissancePacKva = projectData.heatPump.heatPumpSubscribedPowerKva

// TARIFS RÉGLEMENTÉS 2024 (BASE - compteur 6 kVA et 9 kVA)
const TARIFS_ABONNEMENT_EDF = {
  '3': 115.56,  // €/an
  '6': 151.20,  // €/an
  '9': 189.48,  // €/an
  '12': 228.48, // €/an
  '15': 264.84, // €/an
  '18': 301.08, // €/an
}

const abonnementActuel = TARIFS_ABONNEMENT_EDF[puissanceActuelleKva.toString() as keyof typeof TARIFS_ABONNEMENT_EDF] || 151.20
const abonnementPac = TARIFS_ABONNEMENT_EDF[puissancePacKva.toString() as keyof typeof TARIFS_ABONNEMENT_EDF] || 189.48

// COÛT DIFFÉRENTIEL D'ABONNEMENT
const coutDifferentielAbonnement = abonnementPac - abonnementActuel

console.log('\n📊 Composantes du coût annuel PAC:')
console.log('   ├─ Consommation PAC:                ', pacConsomElecAnnuelle.toLocaleString('fr-FR'), 'kWh/an')
console.log('   ├─ Prix électricité:                ', pacPrixElecKwh.toFixed(3), '€/kWh')
console.log('   ├─ Coût énergie (conso × prix):     ', (pacConsomElecAnnuelle * pacPrixElecKwh).toFixed(2), '€/an')
console.log('   ├─ Entretien annuel PAC:            ', pacEntretienAnnuel.toFixed(2), '€/an')
console.log('   │')
console.log('   ├─ Abonnement actuel (' + puissanceActuelleKva + ' kVA):       ', abonnementActuel.toFixed(2), '€/an')
console.log('   ├─ Abonnement PAC (' + puissancePacKva + ' kVA):           ', abonnementPac.toFixed(2), '€/an')
console.log('   └─ Coût différentiel abonnement:    ', coutDifferentielAbonnement.toFixed(2), '€/an')

const pacCoutEnergieAnnuel = pacConsomElecAnnuelle * pacPrixElecKwh
const pacCoutTotalAnnuel = pacCoutEnergieAnnuel + coutDifferentielAbonnement + pacEntretienAnnuel
const pacCoutMensuel = pacCoutTotalAnnuel / 12

console.log('')
console.log('💰 COÛT TOTAL ANNUEL PAC:            ', pacCoutTotalAnnuel.toFixed(2), '€/an')
console.log('💰 COÛT MENSUEL PAC:                 ', pacCoutMensuel.toFixed(2), '€/mois')
console.log('')
console.log('   Vérification avec results.heatPumpAnnualCost:', projectData.results.heatPumpAnnualCost, '€/an')
console.log('   Vérification avec results.heatPumpMonthlyCost:', projectData.results.heatPumpMonthlyCost, '€/mois')

console.log('\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('3. ÉCONOMIES ET COMPARAISON')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const economiesAnnuelles = gazCoutTotalAnnuel - pacCoutTotalAnnuel
const economiesMensuelles = economiesAnnuelles / 12
const tauxEconomie = (economiesAnnuelles / gazCoutTotalAnnuel) * 100

console.log('\n💡 Analyse comparative:')
console.log('   ├─ Coût annuel GAZ:          ', gazCoutTotalAnnuel.toFixed(2), '€/an')
console.log('   ├─ Coût annuel PAC:          ', pacCoutTotalAnnuel.toFixed(2), '€/an')
console.log('   ├─ Économies annuelles:      ', economiesAnnuelles.toFixed(2), '€/an')
console.log('   └─ Taux d\'économie:          ', tauxEconomie.toFixed(1), '%')
console.log('')
console.log('💰 ÉCONOMIES MENSUELLES:        ', economiesMensuelles.toFixed(2), '€/mois')
console.log('')
console.log('   Vérification avec results.annualSavings:', projectData.results.annualSavings, '€/an')
console.log('   Vérification avec results.monthlySavings:', projectData.results.monthlySavings, '€/mois')

console.log('\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('4. DÉTAIL DU CALCUL MENSUEL PAC')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

console.log('\n🔍 Décomposition du coût mensuel PAC (' + pacCoutMensuel.toFixed(2) + ' €/mois):')
console.log('')
console.log('   ┌─────────────────────────────────────────────────┬───────────┬────────────┐')
console.log('   │ Composante                                      │ Annuel    │ Mensuel    │')
console.log('   ├─────────────────────────────────────────────────┼───────────┼────────────┤')
console.log('   │ 1. Consommation électrique PAC                  │           │            │')
console.log('   │    ' + pacConsomElecAnnuelle.toLocaleString('fr-FR').padEnd(18) + ' kWh × ' + pacPrixElecKwh.toFixed(3) + ' €/kWh  │ ' + (pacCoutEnergieAnnuel.toFixed(2) + ' €').padStart(9) + ' │ ' + ((pacCoutEnergieAnnuel / 12).toFixed(2) + ' €').padStart(10) + ' │')
console.log('   ├─────────────────────────────────────────────────┼───────────┼────────────┤')
console.log('   │ 2. Surcoût abonnement électrique                │           │            │')
console.log('   │    Abonnement ' + puissancePacKva + ' kVA - Abonnement ' + puissanceActuelleKva + ' kVA      │ ' + (coutDifferentielAbonnement.toFixed(2) + ' €').padStart(9) + ' │ ' + ((coutDifferentielAbonnement / 12).toFixed(2) + ' €').padStart(10) + ' │')
console.log('   ├─────────────────────────────────────────────────┼───────────┼────────────┤')
console.log('   │ 3. Entretien PAC                                │ ' + (pacEntretienAnnuel.toFixed(2) + ' €').padStart(9) + ' │ ' + ((pacEntretienAnnuel / 12).toFixed(2) + ' €').padStart(10) + ' │')
console.log('   ├─────────────────────────────────────────────────┼───────────┼────────────┤')
console.log('   │ TOTAL                                           │ ' + (pacCoutTotalAnnuel.toFixed(2) + ' €').padStart(9) + ' │ ' + (pacCoutMensuel.toFixed(2) + ' €').padStart(10) + ' │')
console.log('   └─────────────────────────────────────────────────┴───────────┴────────────┘')

console.log('\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('5. EXPLICATION DES ÉCARTS (si présents)')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

const ecartAnnuel = Math.abs(pacCoutTotalAnnuel - projectData.results.heatPumpAnnualCost)
const ecartMensuel = Math.abs(pacCoutMensuel - projectData.results.heatPumpMonthlyCost)

console.log('\n📊 Comparaison calcul manuel vs base de données:')
console.log('')
console.log('   Coût annuel PAC:')
console.log('   ├─ Calcul manuel:        ', pacCoutTotalAnnuel.toFixed(2), '€/an')
console.log('   ├─ Base de données:      ', projectData.results.heatPumpAnnualCost, '€/an')
console.log('   └─ Écart:                ', ecartAnnuel.toFixed(2), '€/an')
console.log('')
console.log('   Coût mensuel PAC:')
console.log('   ├─ Calcul manuel:        ', pacCoutMensuel.toFixed(2), '€/mois')
console.log('   ├─ Base de données:      ', projectData.results.heatPumpMonthlyCost, '€/mois')
console.log('   └─ Écart:                ', ecartMensuel.toFixed(2), '€/mois')

if (ecartAnnuel > 1 || ecartMensuel > 0.1) {
  console.log('')
  console.log('⚠️  ATTENTION: Un écart significatif a été détecté!')
  console.log('')
  console.log('   Causes possibles:')
  console.log('   1. Le calcul en base utilise un tarif d\'abonnement différent')
  console.log('   2. Le code applicatif intègre d\'autres composantes non visibles dans les données')
  console.log('   3. Les arrondis successifs créent des écarts cumulatifs')
  console.log('   4. Une évolution tarifaire ou un paramètre non extrait des données')
  console.log('')
  console.log('   Recommandation:')
  console.log('   └─ Vérifier le code source des calculs dans:')
  console.log('      • app/(main)/projects/[projectId]/results/calculations/')
  console.log('      • lib/subscription/getElectricitySubscription.ts (si existe)')
} else {
  console.log('')
  console.log('✅ Les calculs manuels correspondent aux valeurs en base de données!')
}

console.log('\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('6. SYNTHÈSE FINALE')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

console.log('\n📋 Résumé des coûts mensuels:')
console.log('')
console.log('   Chauffage GAZ (actuel):  ' + gazCoutMensuel.toFixed(2) + ' €/mois')
console.log('   Pompe à Chaleur (futur): ' + pacCoutMensuel.toFixed(2) + ' €/mois')
console.log('   ─────────────────────────────────────')
console.log('   Économies mensuelles:    ' + economiesMensuelles.toFixed(2) + ' €/mois (' + tauxEconomie.toFixed(1) + '%)')
console.log('')
console.log('🎯 Conclusion:')
console.log('   Le passage de la chaudière gaz à la pompe à chaleur permet')
console.log('   d\'économiser ' + economiesMensuelles.toFixed(2) + ' € par mois, soit ' + economiesAnnuelles.toFixed(2) + ' € par an.')
console.log('   Cela représente une réduction de ' + tauxEconomie.toFixed(1) + '% des coûts énergétiques.')

console.log('\n')
console.log('=' .repeat(100))
console.log('FIN DE L\'ANALYSE')
console.log('=' .repeat(100))
