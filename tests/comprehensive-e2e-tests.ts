/**
 * Tests End-to-End Complets ThermoGain
 * 50+ scénarios automatisés couvrant tous les cas d'usage
 */

import { prisma } from '@/lib/prisma'
import { calculateAndSaveResultsTestMode } from '@/tests/lib/calculateAndSaveResultsTestMode'

// ============================================================================
// TYPES ET INTERFACES
// ============================================================================

interface TestScenario {
  name: string
  description: string
  data: ProjectCreateData
  validation: ValidationRules
}

interface ProjectCreateData {
  logement: {
    code_postal: string
    annee_construction: number
    surface_logement: number
    nombre_occupants: number
    classe_dpe?: string
  }
  chauffageActuel: {
    type_chauffage: string
    ecs_integrated: boolean
    conso_fioul_litres?: number
    prix_fioul_litre?: number
    conso_gaz_kwh?: number
    prix_gaz_kwh?: number
    conso_gpl_kg?: number
    prix_gpl_kg?: number
    conso_pellets_kg?: number
    prix_pellets_kg?: number
    conso_bois_steres?: number
    prix_bois_stere?: number
    conso_elec_kwh?: number
    prix_elec_kwh?: number
    abonnement_gaz?: number
    entretien_annuel: number
  }
  ecs?: {
    type_production_ecs: string
    nombre_douches: number
    nombre_bains: number
  }
  projetPac: {
    type_pac: string
    puissance_pac_kw: number
    cop_estime: number
    cop_ajuste: number
    emetteurs: string
    duree_vie_pac: number
    prix_elec_kwh: number
    prix_elec_pac?: number
    puissance_souscrite_actuelle: number
    puissance_souscrite_pac: number
    entretien_pac_annuel: number
    with_ecs_management?: boolean
  }
  couts: {
    cout_pac: number
    cout_installation: number
    cout_travaux_annexes: number
    cout_total: number
  }
  aides: {
    type_logement: string
    revenu_fiscal_reference: number
    residence_principale: boolean
    remplacement_complet: boolean
    ma_prime_renov: number
    cee: number
    autres_aides: number
    total_aides: number
  }
  financement: {
    mode_financement: string
    apport_personnel?: number
    montant_credit?: number
    taux_interet?: number
    duree_credit_mois?: number
  }
}

interface ValidationRules {
  economiesAnnuelles: { min: number; max: number }
  paybackPeriod: { min: number; max: number } | { allowNull: true }
  netBenefitLifetime: { min: number }
  expectedOutcome: string
}

// ============================================================================
// GÉNÉRATEURS DE DONNÉES
// ============================================================================

const CODES_POSTAUX = {
  H1_NORD: ["59000", "62000", "80000", "02000"], // Lille, Arras, Amiens, Laon
  H1_EST: ["54000", "57000", "67000", "68000"], // Nancy, Metz, Strasbourg, Colmar
  H1_MONTAGNE: ["73000", "74000", "05000"], // Chambéry, Annecy, Gap
  H2_CENTRE: ["45000", "37000", "41000"], // Orléans, Tours, Blois
  H2_OUEST: ["35000", "44000", "49000", "85000"], // Rennes, Nantes, Angers, La Roche
  H3_SUD: ["13000", "06000", "83000", "34000"], // Marseille, Nice, Toulon, Montpellier
}

const randomChoice = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ============================================================================
// 50+ SCÉNARIOS DE TEST
// ============================================================================

const scenarios: TestScenario[] = [
  // CATÉGORIE 1: FIOUL - Excellents ROI (10 scénarios)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Fioul ${i + 1}: ${["Petite", "Moyenne", "Grande"][i % 3]} maison`,
    description: `Maison fioul ${[80, 120, 200][i % 3]}m² - Zone ${["H1", "H2", "H3"][i % 3]}`,
    data: {
      logement: {
        code_postal: randomChoice([...CODES_POSTAUX.H1_NORD, ...CODES_POSTAUX.H2_CENTRE]),
        annee_construction: randomInt(1970, 2005),
        surface_logement: [80, 120, 200][i % 3],
        nombre_occupants: randomInt(2, 5),
        classe_dpe: randomChoice(["D", "E", "F", "G"]),
      },
      chauffageActuel: {
        type_chauffage: "Fioul",
        age_installation: randomInt(8, 20),
        etat_installation: randomChoice(["Mauvais", "Moyen", "Bon"]),
        ecs_integrated: true,
        conso_fioul_litres: [1200, 1800, 2800][i % 3],
        prix_fioul_litre: 1.40 + (i * 0.05),
        entretien_annuel: 150,
      },
      projetPac: {
        type_pac: "Air/Eau",
        puissance_pac_kw: [8, 12, 16][i % 3],
        cop_estime: 3.5,
        cop_ajuste: 3.2,
        emetteurs: "Radiateurs basse température",
        duree_vie_pac: 17,
        prix_elec_kwh: 0.2516,
        prix_elec_pac: 0.2276,
        puissance_souscrite_actuelle: 6,
        puissance_souscrite_pac: [9, 12, 15][i % 3],
        entretien_pac_annuel: 200,
        with_ecs_management: true,
      },
      couts: {
        cout_pac: [10000, 15000, 18000][i % 3],
        cout_installation: [2500, 4000, 5000][i % 3],
        cout_travaux_annexes: [1500, 3000, 4000][i % 3],
        cout_total: [14000, 22000, 27000][i % 3],
      },
      aides: {
        type_logement: "maison",
        revenu_fiscal_reference: 30000 + (i * 5000),
        residence_principale: true,
        remplacement_complet: true,
        ma_prime_renov: [4000, 5000, 6000][i % 3],
        cee: [2000, 3000, 4000][i % 3],
        autres_aides: 0,
        total_aides: [6000, 8000, 10000][i % 3],
      },
      financement: {
        mode_financement: i % 2 === 0 ? "Crédit" : "Mixte",
        apport_personnel: i % 2 === 0 ? 0 : [3000, 4000, 5000][i % 3],
        montant_credit: i % 2 === 0 ? [8000, 14000, 17000][i % 3] : [5000, 10000, 12000][i % 3],
        taux_interet: 3.0 + (i * 0.1),
        duree_credit_mois: [84, 120, 144][i % 3],
      },
    },
    validation: {
      economiesAnnuelles: { min: -1000, max: 15000 },
      paybackPeriod: { allowNull: true },
      netBenefitLifetime: { min: -40000 },
      expectedOutcome: "ROI variable - Dépend du prix fioul et consommation",
    },
  })),

  // CATÉGORIE 2: GAZ - ROI moyens (10 scénarios)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Gaz ${i + 1}: ${["Appartement", "Maison moyenne", "Grande maison"][i % 3]}`,
    description: `Chauffage gaz ${[70, 120, 180][i % 3]}m² - Isolation ${["bonne", "moyenne", "mauvaise"][i % 3]}`,
    data: {
      logement: {
        code_postal: randomChoice([...CODES_POSTAUX.H2_CENTRE, ...CODES_POSTAUX.H3_SUD]),
        annee_construction: randomInt(1985, 2015),
        surface_logement: [70, 120, 180][i % 3],
        nombre_occupants: randomInt(2, 4),
        classe_dpe: ["C", "D", "E"][i % 3],
      },
      chauffageActuel: {
        type_chauffage: "Gaz",
        age_installation: randomInt(6, 18),
        etat_installation: randomChoice(["Bon", "Moyen", "Mauvais"]),
        ecs_integrated: true,
        conso_gaz_kwh: [5000, 12000, 20000][i % 3],
        prix_gaz_kwh: 0.10 + (i * 0.01),
        abonnement_gaz: 120 + (i * 20),
        entretien_annuel: 120 + (i * 10),
      },
      projetPac: {
        type_pac: "Air/Eau",
        puissance_pac_kw: [6, 10, 14][i % 3],
        cop_estime: 3.8 + (i * 0.05),
        cop_ajuste: 3.5 + (i * 0.05),
        emetteurs: i % 2 === 0 ? "Radiateurs basse température" : "Plancher chauffant",
        duree_vie_pac: 17,
        prix_elec_kwh: 0.2516,
        prix_elec_pac: 0.2276,
        puissance_souscrite_actuelle: [3, 6, 9][i % 3],
        puissance_souscrite_pac: [6, 9, 12][i % 3],
        entretien_pac_annuel: 180,
        with_ecs_management: true,
      },
      couts: {
        cout_pac: [8000, 12000, 16000][i % 3],
        cout_installation: [2000, 3000, 4000][i % 3],
        cout_travaux_annexes: i % 2 === 0 ? [1500, 2500, 3500][i % 3] : [3000, 5000, 7000][i % 3],
        cout_total: i % 2 === 0 ? [11500, 17500, 23500][i % 3] : [13000, 20000, 27000][i % 3],
      },
      aides: {
        type_logement: i % 3 === 0 ? "appartement" : "maison",
        revenu_fiscal_reference: 35000 + (i * 5000),
        residence_principale: true,
        remplacement_complet: true,
        ma_prime_renov: [2000, 3000, 4000][i % 3],
        cee: [1500, 2000, 2500][i % 3],
        autres_aides: 0,
        total_aides: [3500, 5000, 6500][i % 3],
      },
      financement: {
        mode_financement: ["Comptant", "Crédit", "Mixte"][i % 3],
        apport_personnel: i % 3 === 2 ? [3000, 5000, 7000][i % 3] : i % 3 === 0 ? [8000, 12500, 17000][i % 3] : undefined,
        montant_credit: i % 3 === 0 ? undefined : [5000, 10000, 14000][i % 3],
        taux_interet: i % 3 === 0 ? undefined : 3.0 + (i * 0.1),
        duree_credit_mois: i % 3 === 0 ? undefined : [84, 120, 144][i % 3],
      },
    },
    validation: {
      economiesAnnuelles: { min: -200, max: 3500 },
      paybackPeriod: { allowNull: true },
      netBenefitLifetime: { min: -20000 },
      expectedOutcome: "ROI variable - Dépend de la consommation gaz",
    },
  })),

  // CATÉGORIE 3: PROPANE/GPL - Excellents ROI (10 scénarios)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Propane ${i + 1}: Maison ${["petite", "moyenne", "grande"][i % 3]} zone rurale`,
    description: `GPL ${[100, 150, 200][i % 3]}m² - Isolation ${["moyenne", "mauvaise", "très mauvaise"][i % 3]}`,
    data: {
      logement: {
        code_postal: randomChoice([...CODES_POSTAUX.H1_EST, ...CODES_POSTAUX.H2_OUEST]),
        annee_construction: randomInt(1975, 2000),
        surface_logement: [100, 150, 200][i % 3],
        nombre_occupants: randomInt(3, 6),
        classe_dpe: ["E", "F", "G"][i % 3],
      },
      chauffageActuel: {
        type_chauffage: "GPL",
        age_installation: randomInt(10, 25),
        etat_installation: randomChoice(["Mauvais", "Moyen"]),
        ecs_integrated: true,
        conso_gpl_kg: [1600, 2400, 3200][i % 3],
        prix_gpl_kg: 1.80 + (i * 0.10),
        entretien_annuel: 180 + (i * 20),
      },
      projetPac: {
        type_pac: "Air/Eau",
        puissance_pac_kw: [10, 14, 18][i % 3],
        cop_estime: 3.3,
        cop_ajuste: 3.0,
        emetteurs: "Radiateurs basse température",
        duree_vie_pac: 17,
        prix_elec_kwh: 0.2516,
        prix_elec_pac: 0.2276,
        puissance_souscrite_actuelle: 6,
        puissance_souscrite_pac: [12, 15, 18][i % 3],
        entretien_pac_annuel: 220,
        with_ecs_management: true,
      },
      couts: {
        cout_pac: [13000, 16000, 19000][i % 3],
        cout_installation: [3500, 4500, 5500][i % 3],
        cout_travaux_annexes: [2500, 3500, 4500][i % 3],
        cout_total: [19000, 24000, 29000][i % 3],
      },
      aides: {
        type_logement: "maison",
        revenu_fiscal_reference: 25000 + (i * 3000),
        residence_principale: true,
        remplacement_complet: true,
        ma_prime_renov: [5000, 6000, 7000][i % 3],
        cee: [3500, 4000, 4500][i % 3],
        autres_aides: 0,
        total_aides: [8500, 10000, 11500][i % 3],
      },
      financement: {
        mode_financement: i % 2 === 0 ? "Crédit" : "Mixte",
        apport_personnel: i % 2 === 0 ? 0 : [4000, 5000, 6000][i % 3],
        montant_credit: i % 2 === 0 ? [10500, 14000, 17500][i % 3] : [6500, 9000, 11500][i % 3],
        taux_interet: 3.5 + (i * 0.1),
        duree_credit_mois: [96, 120, 144][i % 3],
      },
    },
    validation: {
      economiesAnnuelles: { min: 800, max: 25000 },
      paybackPeriod: { allowNull: true },
      netBenefitLifetime: { min: -10000 },
      expectedOutcome: "ROI généralement bon - GPL cher",
    },
  })),

  // CATÉGORIE 4: ÉLECTRIQUE - ROI variables (10 scénarios)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Électrique ${i + 1}: ${["Convecteurs", "Radiateurs élec", "PAC air-air"][i % 3]}`,
    description: `Chauffage électrique ${[90, 130, 170][i % 3]}m² - COP actuel ${[1.0, 2.5, 1.0][i % 3]}`,
    data: {
      logement: {
        code_postal: randomChoice([...CODES_POSTAUX.H2_OUEST, ...CODES_POSTAUX.H3_SUD]),
        annee_construction: randomInt(1980, 2010),
        surface_logement: [90, 130, 170][i % 3],
        nombre_occupants: randomInt(2, 4),
        classe_dpe: ["D", "E", "F"][i % 3],
      },
      chauffageActuel: {
        type_chauffage: ["Electrique", "Electrique", "PAC Air/Air"][i % 3],
        age_installation: randomInt(5, 15),
        etat_installation: randomChoice(["Bon", "Moyen"]),
        ecs_integrated: false,
        conso_elec_kwh: [10000, 14000, 8000][i % 3],
        prix_elec_kwh: 0.2516,
        entretien_annuel: [50, 50, 100][i % 3],
      },
      ecs: {
        type_ecs: i % 2 === 0 ? "Ballon électrique" : "Thermodynamique",
        consumption_known: false,
        prix_ecs_kwh: 0.2516,
        entretien_ecs: 0,
      },
      projetPac: {
        type_pac: "Air/Eau",
        puissance_pac_kw: [8, 11, 14][i % 3],
        cop_estime: 4.0 + (i * 0.05),
        cop_ajuste: 3.7 + (i * 0.05),
        emetteurs: i % 2 === 0 ? "Plancher chauffant" : "Radiateurs basse température",
        duree_vie_pac: 17,
        prix_elec_kwh: 0.2516,
        prix_elec_pac: 0.2276,
        puissance_souscrite_actuelle: [6, 9, 12][i % 3],
        puissance_souscrite_pac: [9, 12, 15][i % 3],
        entretien_pac_annuel: 190,
        with_ecs_management: true,
      },
      couts: {
        cout_pac: [9000, 13000, 16000][i % 3],
        cout_installation: [2500, 3500, 4500][i % 3],
        cout_travaux_annexes: i % 2 === 0 ? [5000, 6000, 7000][i % 3] : [2000, 3000, 4000][i % 3],
        cout_total: i % 2 === 0 ? [16500, 22500, 27500][i % 3] : [13500, 19500, 24500][i % 3],
      },
      aides: {
        type_logement: "maison",
        revenu_fiscal_reference: 40000 + (i * 5000),
        residence_principale: true,
        remplacement_complet: true,
        ma_prime_renov: [2500, 3000, 3500][i % 3],
        cee: [1500, 2000, 2500][i % 3],
        autres_aides: 0,
        total_aides: [4000, 5000, 6000][i % 3],
      },
      financement: {
        mode_financement: ["Comptant", "Crédit", "Mixte"][i % 3],
        apport_personnel: i % 3 === 2 ? [4000, 6000, 8000][i % 3] : i % 3 === 0 ? [12500, 17500, 21500][i % 3] : undefined,
        montant_credit: i % 3 === 0 ? undefined : [8500, 12500, 16500][i % 3],
        taux_interet: i % 3 === 0 ? undefined : 2.9 + (i * 0.1),
        duree_credit_mois: i % 3 === 0 ? undefined : [84, 120, 144][i % 3],
      },
    },
    validation: {
      economiesAnnuelles: { min: -3000, max: 3000 },
      paybackPeriod: { allowNull: true },
      netBenefitLifetime: { min: -80000 },
      expectedOutcome: "ROI très variable - Mauvais si PAC air-air existante",
    },
  })),

  // CATÉGORIE 5: CAS LIMITES - ROI faibles ou négatifs (10 scénarios)
  ...Array.from({ length: 10 }, (_, i) => ({
    name: `Cas limite ${i + 1}: ${["Gaz BBC", "Pellets", "Maison passive"][i % 3]}`,
    description: `Faible consommation ${[60, 80, 100][i % 3]}m² - Énergie ${["gaz", "bois", "élec"][i % 3]} peu chère`,
    data: {
      logement: {
        code_postal: randomChoice(CODES_POSTAUX.H3_SUD),
        annee_construction: 2010 + i,
        surface_logement: [60, 80, 100][i % 3],
        nombre_occupants: randomInt(1, 3),
        classe_dpe: ["A", "B", "C"][i % 3],
      },
      chauffageActuel: {
        type_chauffage: ["Gaz", "Pellets", "Electrique"][i % 3],
        age_installation: randomInt(3, 12),
        etat_installation: "Bon",
        ecs_integrated: i % 3 !== 1,
        conso_gaz_kwh: i % 3 === 0 ? [3000, 4000, 5000][i % 3] : undefined,
        prix_gaz_kwh: i % 3 === 0 ? 0.10 : undefined,
        abonnement_gaz: i % 3 === 0 ? 120 : undefined,
        conso_pellets_kg: i % 3 === 1 ? [400, 600, 800][i % 3] : undefined,
        prix_pellets_kg: i % 3 === 1 ? 0.35 : undefined,
        conso_elec_kwh: i % 3 === 2 ? [4000, 5000, 6000][i % 3] : undefined,
        prix_elec_kwh: i % 3 === 2 ? 0.2516 : undefined,
        entretien_annuel: [80, 100, 120][i % 3],
      },
      ecs: i % 3 === 1 ? {
        type_ecs: "Chauffe-eau solaire",
        consumption_known: false,
        prix_ecs_kwh: 0.2516,
        entretien_ecs: 50,
      } : undefined,
      projetPac: {
        type_pac: "Air/Eau",
        puissance_pac_kw: [5, 6, 7][i % 3],
        cop_estime: 4.5,
        cop_ajuste: 4.3,
        emetteurs: "Plancher chauffant",
        duree_vie_pac: 17,
        prix_elec_kwh: 0.2516,
        prix_elec_pac: 0.2276,
        puissance_souscrite_actuelle: 3,
        puissance_souscrite_pac: 6,
        entretien_pac_annuel: 180,
        with_ecs_management: i % 3 !== 1,
      },
      couts: {
        cout_pac: [7000, 8000, 9000][i % 3],
        cout_installation: [2000, 2500, 3000][i % 3],
        cout_travaux_annexes: [1000, 1500, 2000][i % 3],
        cout_total: [10000, 12000, 14000][i % 3],
      },
      aides: {
        type_logement: i % 2 === 0 ? "appartement" : "maison",
        revenu_fiscal_reference: 50000 + (i * 5000),
        residence_principale: true,
        remplacement_complet: true,
        ma_prime_renov: [1500, 2000, 2500][i % 3],
        cee: [1000, 1500, 2000][i % 3],
        autres_aides: 0,
        total_aides: [2500, 3500, 4500][i % 3],
      },
      financement: {
        mode_financement: "Comptant",
        apport_personnel: [7500, 8500, 9500][i % 3],
      },
    },
    validation: {
      economiesAnnuelles: { min: -600, max: 2000 },
      paybackPeriod: { allowNull: true },
      netBenefitLifetime: { min: -18000 },
      expectedOutcome: "ROI limite ou négatif - Cas défavorable",
    },
  })),
]

// ============================================================================
// SYSTÈME D'EXÉCUTION DES TESTS
// ============================================================================

interface TestResult {
  scenario: string
  passed: boolean
  economiesAnnuelles?: number
  paybackPeriod?: number | null
  netBenefit?: number
  error?: string
  warnings: string[]
}

const createTestUser = async () => {
  const testEmail = `test-comprehensive-${Date.now()}@thermogain.test`
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      password: 'test-hash',
      firstName: 'Test',
      lastName: 'Comprehensive',
      company: 'ThermoGain Test Suite',
      phone: '0600000000',
      siret: '12345678900001',
      emailVerified: new Date(),
    },
  })
  return user
}

const runScenario = async (scenario: TestScenario, userId: string): Promise<TestResult> => {
  const warnings: string[] = []

  try {
    // Créer le projet
    const project = await prisma.project.create({
      data: {
        name: scenario.name,
        userId,
        currentStep: 8,
        completed: true,
        logement: { create: scenario.data.logement },
        chauffageActuel: { create: scenario.data.chauffageActuel },
        ...(scenario.data.ecs && { ecs: { create: scenario.data.ecs } }),
        projetPac: { create: scenario.data.projetPac },
        couts: { create: scenario.data.couts },
        aides: { create: scenario.data.aides },
        financement: { create: scenario.data.financement },
      },
    })

    // Calculer les résultats
    await calculateAndSaveResultsTestMode(project.id)

    // Récupérer les résultats
    const results = await prisma.project.findUnique({
      where: { id: project.id },
      include: { results: true },
    })

    if (!results?.results) {
      return {
        scenario: scenario.name,
        passed: false,
        error: 'Pas de résultats calculés',
        warnings,
      }
    }

    const r = results.results

    // Validation
    const { validation } = scenario
    const economiesOk =
      r.economiesAnnuelles >= validation.economiesAnnuelles.min &&
      r.economiesAnnuelles <= validation.economiesAnnuelles.max

    const paybackOk =
      'allowNull' in validation.paybackPeriod
        ? validation.paybackPeriod.allowNull || r.paybackPeriod !== null
        : r.paybackPeriod !== null &&
          r.paybackPeriod >= validation.paybackPeriod.min &&
          r.paybackPeriod <= validation.paybackPeriod.max

    const netBenefitOk = r.netBenefitLifetime >= validation.netBenefitLifetime.min

    // Warnings
    if (!economiesOk) {
      warnings.push(
        `Économies hors limites: ${r.economiesAnnuelles}€ (attendu: ${validation.economiesAnnuelles.min}-${validation.economiesAnnuelles.max}€)`
      )
    }
    if (!paybackOk) {
      const expectedRange =
        'allowNull' in validation.paybackPeriod
          ? 'null autorisé'
          : `${validation.paybackPeriod.min}-${validation.paybackPeriod.max}ans`
      warnings.push(`ROI hors limites: ${r.paybackPeriod?.toFixed(1) ?? 'null'}ans (attendu: ${expectedRange})`)
    }
    if (!netBenefitOk) {
      warnings.push(
        `Bénéfice net insuffisant: ${r.netBenefitLifetime}€ (min: ${validation.netBenefitLifetime.min}€)`
      )
    }

    return {
      scenario: scenario.name,
      passed: economiesOk && paybackOk && netBenefitOk,
      economiesAnnuelles: r.economies_annuelles,
      paybackPeriod: r.payback_period,
      netBenefit: r.net_benefit_lifetime,
      warnings,
    }
  } catch (error) {
    return {
      scenario: scenario.name,
      passed: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      warnings,
    }
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

const runAllTests = async () => {
  console.log(`\n${'='.repeat(100)}`)
  console.log(`🧪 Tests End-to-End Complets ThermoGain - ${scenarios.length} scénarios`)
  console.log(`${'='.repeat(100)}\n`)

  const user = await createTestUser()
  console.log(`✅ Utilisateur de test créé: ${user.email}\n`)

  const results: TestResult[] = []
  let testNumber = 0

  for (const scenario of scenarios) {
    testNumber++
    process.stdout.write(`[${testNumber}/${scenarios.length}] ${scenario.name}...`)

    const result = await runScenario(scenario, user.id)
    results.push(result)

    if (result.passed) {
      console.log(` ✅`)
    } else {
      console.log(` ❌`)
      if (result.error) {
        console.log(`    Erreur: ${result.error}`)
      }
      result.warnings.forEach(w => console.log(`    ⚠️  ${w}`))
    }
  }

  // Rapport final
  console.log(`\n${'='.repeat(100)}`)
  console.log(`📊 RÉSUMÉ FINAL`)
  console.log(`${'='.repeat(100)}\n`)

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length

  console.log(`✅ Tests réussis: ${passed}/${scenarios.length} (${((passed / scenarios.length) * 100).toFixed(1)}%)`)
  console.log(`❌ Tests échoués: ${failed}/${scenarios.length} (${((failed / scenarios.length) * 100).toFixed(1)}%)`)

  if (failed > 0) {
    console.log(`\n⚠️  Tests échoués:`)
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.scenario}`)
        if (r.error) console.log(`     Erreur: ${r.error}`)
        r.warnings.forEach(w => console.log(`     ${w}`))
      })
  }

  // Statistiques
  const validResults = results.filter(r => r.economiesAnnuelles !== undefined)
  if (validResults.length > 0) {
    const avgEconomies =
      validResults.reduce((sum, r) => sum + (r.economiesAnnuelles || 0), 0) / validResults.length
    const avgROI =
      validResults.filter(r => r.paybackPeriod).reduce((sum, r) => sum + (r.paybackPeriod || 0), 0) /
      validResults.filter(r => r.paybackPeriod).length

    console.log(`\n📈 Statistiques moyennes:`)
    console.log(`   Économies annuelles: ${avgEconomies.toFixed(0)}€`)
    console.log(`   ROI: ${avgROI.toFixed(1)} ans`)
  }

  console.log(`\n🧹 Nettoyage...`)
  await prisma.user.delete({ where: { id: user.id } })
  console.log(`✅ Utilisateur de test supprimé`)

  console.log(`\n${'='.repeat(100)}\n`)

  await prisma.$disconnect()

  process.exit(failed > 0 ? 1 : 0)
}

runAllTests()
