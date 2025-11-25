/**
 * Logique d'éligibilité et de calcul pour les CEE (Certificats d'Économies d'Énergie)
 *
 * Basé sur les fiches standardisées CEE et les barèmes 2024
 * Les CEE sont cumulables avec MaPrimeRénov'
 */

export type CEECategory = "precaire" | "modeste" | "classique" | "non-eligible"

interface CEEInput {
  revenuFiscalReference: number  // Revenu fiscal de référence (année N-1)
  nombrePersonnes: number         // Nombre de personnes dans le foyer
  codePostal: string             // Pour déterminer zone géographique et précarité
  typePac: string                // Type de PAC installée
  surfaceHabitable: number       // Surface pour calcul selon fiche CEE
  zoneClimatique: string         // H1, H2, H3 (déterminé par code postal)
  logementPlusde2ans: boolean    // Le logement a-t-il plus de 2 ans ?
  remplacementComplet: boolean   // Le système de chauffage actuel sera-t-il complètement remplacé ?
}

interface CEEResult {
  eligible: boolean
  category?: CEECategory
  montant: number
  message: string
  details?: string[]
}

/**
 * Barèmes de précarité CEE 2024 (identiques aux seuils MaPrimeRénov' bleu et jaune)
 */
const SEUILS_PRECARITE_IDF_2024: Record<number, { precaire: number; modeste: number }> = {
  1: { precaire: 23541, modeste: 28657 },
  2: { precaire: 34551, modeste: 42058 },
  3: { precaire: 41493, modeste: 50513 },
  4: { precaire: 48447, modeste: 58981 },
  5: { precaire: 55427, modeste: 67473 },
}

const SEUILS_PRECARITE_PROVINCE_2024: Record<number, { precaire: number; modeste: number }> = {
  1: { precaire: 17009, modeste: 21805 },
  2: { precaire: 24875, modeste: 31889 },
  3: { precaire: 29917, modeste: 38349 },
  4: { precaire: 34948, modeste: 44802 },
  5: { precaire: 40002, modeste: 51281 },
}

/**
 * Montants forfaitaires CEE 2024 pour PAC
 * Basé sur fiche BAR-TH-104 (PAC Air/Eau) et BAR-TH-148 (PAC Air/Air)
 *
 * Montants indicatifs moyens (peuvent varier selon les obligés CEE)
 */
const MONTANTS_CEE_PAC_2024: Record<CEECategory, Record<string, number>> = {
  precaire: {
    "Air/Eau": 5000,
    "Eau/Eau": 5000,
    "Air/Air": 900, // CEE Coup de Pouce
  },
  modeste: {
    "Air/Eau": 4000,
    "Eau/Eau": 4000,
    "Air/Air": 450,
  },
  classique: {
    "Air/Eau": 2500,
    "Eau/Eau": 2500,
    "Air/Air": 0, // Non éligible sans précarité
  },
  "non-eligible": {
    "Air/Eau": 0,
    "Eau/Eau": 0,
    "Air/Air": 0,
  },
}

/**
 * Détermine si le code postal correspond à l'Île-de-France
 */
function isIleDeFrance(codePostal: string): boolean {
  const departement = codePostal.substring(0, 2)
  return ["75", "77", "78", "91", "92", "93", "94", "95"].includes(departement)
}

/**
 * Détermine la catégorie CEE (précarité énergétique)
 */
function determineCEECategory(
  revenuFiscalReference: number,
  nombrePersonnes: number,
  codePostal: string
): CEECategory {
  const isIDF = isIleDeFrance(codePostal)
  const seuils = isIDF ? SEUILS_PRECARITE_IDF_2024 : SEUILS_PRECARITE_PROVINCE_2024

  let seuilsApplicables: { precaire: number; modeste: number }

  if (nombrePersonnes <= 5) {
    seuilsApplicables = seuils[nombrePersonnes]
  } else {
    // Calcul pour foyers de plus de 5 personnes
    const seuilsBase = seuils[5]
    const personnesSupplementaires = nombrePersonnes - 5

    if (isIDF) {
      seuilsApplicables = {
        precaire: seuilsBase.precaire + personnesSupplementaires * 6961,
        modeste: seuilsBase.modeste + personnesSupplementaires * 8486,
      }
    } else {
      seuilsApplicables = {
        precaire: seuilsBase.precaire + personnesSupplementaires * 5045,
        modeste: seuilsBase.modeste + personnesSupplementaires * 6462,
      }
    }
  }

  if (revenuFiscalReference <= seuilsApplicables.precaire) return "precaire"
  if (revenuFiscalReference <= seuilsApplicables.modeste) return "modeste"
  return "classique"
}

/**
 * Calcule l'éligibilité et le montant CEE pour une PAC
 */
export function calculateCEE(input: CEEInput): CEEResult {
  const details: string[] = []

  // Vérification des conditions d'éligibilité de base
  if (!input.remplacementComplet) {
    return {
      eligible: false,
      montant: 0,
      message: "❌ Non éligible : le remplacement complet du système de chauffage est requis.",
      details: [
        "Pour bénéficier des CEE (Coup de Pouce Chauffage), vous devez remplacer complètement votre système de chauffage actuel.",
        "Une installation en complément n'est pas éligible.",
      ],
    }
  }

  if (!input.logementPlusde2ans) {
    return {
      eligible: false,
      montant: 0,
      message: "❌ Non éligible : le logement doit avoir au moins 2 ans d'ancienneté.",
      details: ["Les CEE sont réservés aux logements existants de plus de 2 ans."],
    }
  }

  // Déterminer la catégorie de précarité
  const category = determineCEECategory(
    input.revenuFiscalReference,
    input.nombrePersonnes,
    input.codePostal
  )

  details.push(`Catégorie : ${category.toUpperCase()}`)
  details.push(
    `Zone : ${isIleDeFrance(input.codePostal) ? "Île-de-France" : "Province"}`
  )
  details.push(`Foyer de ${input.nombrePersonnes} personne(s)`)
  details.push(`Revenu fiscal : ${input.revenuFiscalReference.toLocaleString("fr-FR")} €`)

  // Récupérer le montant selon la catégorie et le type de PAC
  const montant = MONTANTS_CEE_PAC_2024[category][input.typePac] || 0

  if (montant === 0) {
    // Cas particulier : Air/Air non éligible pour les foyers classiques
    if (input.typePac === "Air/Air" && category === "classique") {
      return {
        eligible: false,
        category,
        montant: 0,
        message: "❌ Non éligible : les PAC Air/Air ne bénéficient du CEE Coup de Pouce que pour les ménages précaires ou modestes.",
        details: [
          ...details,
          "Les foyers aux revenus intermédiaires ou supérieurs ne sont pas éligibles au CEE pour les PAC Air/Air.",
        ],
      }
    }

    return {
      eligible: false,
      category,
      montant: 0,
      message: `❌ Non éligible : aucune aide CEE pour ${input.typePac} en catégorie ${category}.`,
      details,
    }
  }

  return {
    eligible: true,
    category,
    montant,
    message: `✅ Éligible ! CEE ${category.toUpperCase()} : ${montant.toLocaleString("fr-FR")} €`,
    details: [
      ...details,
      `Montant pour ${input.typePac} : ${montant.toLocaleString("fr-FR")} €`,
      "💡 Les CEE sont cumulables avec MaPrimeRénov'",
      "⚠️ Ce montant est indicatif. Les montants CEE varient selon les fournisseurs d'énergie (obligés).",
      "Contactez plusieurs fournisseurs pour obtenir la meilleure offre.",
    ],
  }
}

/**
 * Calcule le montant CEE selon la fiche standardisée (méthode détaillée)
 * Cette fonction peut être utilisée pour un calcul plus précis basé sur les kWh cumac
 *
 * Non utilisée dans le drawer pour simplifier l'UX, mais disponible pour des calculs avancés
 */
export function calculateCEEDetailed(
  typePac: string,
  surfaceHabitable: number,
  zoneClimatique: string,
  category: CEECategory
): number {
  // Facteurs de pondération selon zone climatique (fiche BAR-TH-104)
  const facteursZone: Record<string, number> = {
    H1: 1.2,
    H2: 1.0,
    H3: 0.8,
  }

  // kWh cumac de base pour PAC Air/Eau (simplifié)
  const kWhCumacBase = surfaceHabitable * 100 * (facteursZone[zoneClimatique] || 1.0)

  // Prix moyen du kWh cumac selon catégorie (en centimes d'€)
  const prixKWhCumac: Record<CEECategory, number> = {
    precaire: 0.012, // 1.2 centime
    modeste: 0.010, // 1.0 centime
    classique: 0.008, // 0.8 centime
    "non-eligible": 0,
  }

  const montantCalcule = kWhCumacBase * prixKWhCumac[category]

  // Les montants forfaitaires sont souvent plus avantageux
  return Math.round(montantCalcule)
}
