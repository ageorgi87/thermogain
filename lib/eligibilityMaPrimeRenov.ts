/**
 * Logique d'éligibilité et de calcul pour MaPrimeRénov'
 *
 * Basé sur les barèmes officiels 2024
 * Source : https://www.anah.gouv.fr
 */

export type MaPrimeRenovCategory = "bleu" | "jaune" | "violet" | "rose" | "non-eligible"

interface MaPrimeRenovInput {
  revenuFiscalReference: number  // Revenu fiscal de référence (année N-1)
  nombrePersonnes: number         // Nombre de personnes dans le foyer
  codePostal: string             // Pour déterminer si Île-de-France ou province
  typePac: string                // Type de PAC installée
  logementPlusde15ans: boolean   // Le logement a-t-il plus de 15 ans ?
  residencePrincipale: boolean   // Est-ce une résidence principale ?
}

interface MaPrimeRenovResult {
  eligible: boolean
  category?: MaPrimeRenovCategory
  montant: number
  message: string
  details?: string[]
}

/**
 * Barèmes de revenus MaPrimeRénov' 2024
 * Source officielle : ANAH
 */
const BAREME_IDF_2024: Record<number, { bleu: number; jaune: number; violet: number; rose: number }> = {
  1: { bleu: 23541, jaune: 28657, violet: 40018, rose: Infinity },
  2: { bleu: 34551, jaune: 42058, violet: 58827, rose: Infinity },
  3: { bleu: 41493, jaune: 50513, violet: 70382, rose: Infinity },
  4: { bleu: 48447, jaune: 58981, violet: 82839, rose: Infinity },
  5: { bleu: 55427, jaune: 67473, violet: 94844, rose: Infinity },
  // +6961 par personne supplémentaire pour bleu
  // +8486 par personne supplémentaire pour jaune
  // +11995 par personne supplémentaire pour violet
}

const BAREME_PROVINCE_2024: Record<number, { bleu: number; jaune: number; violet: number; rose: number }> = {
  1: { bleu: 17009, jaune: 21805, violet: 30549, rose: Infinity },
  2: { bleu: 24875, jaune: 31889, violet: 44907, rose: Infinity },
  3: { bleu: 29917, jaune: 38349, violet: 54071, rose: Infinity },
  4: { bleu: 34948, jaune: 44802, violet: 63235, rose: Infinity },
  5: { bleu: 40002, jaune: 51281, violet: 72400, rose: Infinity },
  // +5045 par personne supplémentaire pour bleu
  // +6462 par personne supplémentaire pour jaune
  // +9165 par personne supplémentaire pour violet
}

const MONTANTS_PAC_2024: Record<MaPrimeRenovCategory, Record<string, number>> = {
  bleu: {
    "Air/Eau": 5000,
    "Eau/Eau": 5000,
    "Air/Air": 0, // Non éligible
  },
  jaune: {
    "Air/Eau": 4000,
    "Eau/Eau": 4000,
    "Air/Air": 0,
  },
  violet: {
    "Air/Eau": 3000,
    "Eau/Eau": 3000,
    "Air/Air": 0,
  },
  rose: {
    "Air/Eau": 0, // Non éligible pour rose
    "Eau/Eau": 0,
    "Air/Air": 0,
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
 * Détermine la catégorie de revenus selon les barèmes ANAH
 */
function determineCategory(
  revenuFiscalReference: number,
  nombrePersonnes: number,
  codePostal: string
): MaPrimeRenovCategory {
  const isIDF = isIleDeFrance(codePostal)
  const bareme = isIDF ? BAREME_IDF_2024 : BAREME_PROVINCE_2024

  let seuils: { bleu: number; jaune: number; violet: number; rose: number }

  if (nombrePersonnes <= 5) {
    seuils = bareme[nombrePersonnes]
  } else {
    // Calcul pour foyers de plus de 5 personnes
    const seuilsBase = bareme[5]
    const personnesSupplementaires = nombrePersonnes - 5

    if (isIDF) {
      seuils = {
        bleu: seuilsBase.bleu + personnesSupplementaires * 6961,
        jaune: seuilsBase.jaune + personnesSupplementaires * 8486,
        violet: seuilsBase.violet + personnesSupplementaires * 11995,
        rose: Infinity,
      }
    } else {
      seuils = {
        bleu: seuilsBase.bleu + personnesSupplementaires * 5045,
        jaune: seuilsBase.jaune + personnesSupplementaires * 6462,
        violet: seuilsBase.violet + personnesSupplementaires * 9165,
        rose: Infinity,
      }
    }
  }

  if (revenuFiscalReference <= seuils.bleu) return "bleu"
  if (revenuFiscalReference <= seuils.jaune) return "jaune"
  if (revenuFiscalReference <= seuils.violet) return "violet"
  return "rose"
}

/**
 * Calcule l'éligibilité et le montant MaPrimeRénov' pour une PAC
 */
export function calculateMaPrimeRenov(input: MaPrimeRenovInput): MaPrimeRenovResult {
  const details: string[] = []

  // Vérification des conditions d'éligibilité de base
  if (!input.logementPlusde15ans) {
    return {
      eligible: false,
      montant: 0,
      message: "❌ Non éligible : le logement doit avoir au moins 15 ans.",
      details: ["Le logement doit être construit depuis au moins 15 ans."],
    }
  }

  if (!input.residencePrincipale) {
    return {
      eligible: false,
      montant: 0,
      message: "❌ Non éligible : le logement doit être une résidence principale.",
      details: ["MaPrimeRénov' est réservée aux résidences principales (occupées au moins 8 mois/an)."],
    }
  }

  // PAC Air/Air non éligibles
  if (input.typePac === "Air/Air") {
    return {
      eligible: false,
      montant: 0,
      message: "❌ Non éligible : les PAC Air/Air ne sont pas éligibles à MaPrimeRénov'.",
      details: [
        "Les PAC Air/Air (climatisation réversible) ne sont pas prises en charge.",
        "Seules les PAC Air/Eau et Eau/Eau sont éligibles.",
      ],
    }
  }

  // Déterminer la catégorie de revenus
  const category = determineCategory(
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

  // Catégorie ROSE non éligible pour les PAC
  if (category === "rose") {
    return {
      eligible: false,
      category,
      montant: 0,
      message: "❌ Non éligible : vos revenus dépassent les plafonds de MaPrimeRénov' pour les PAC.",
      details: [
        ...details,
        "Les foyers aux revenus supérieurs (catégorie rose) ne sont pas éligibles pour les pompes à chaleur.",
      ],
    }
  }

  // Récupérer le montant selon la catégorie et le type de PAC
  const montant = MONTANTS_PAC_2024[category][input.typePac] || 0

  if (montant === 0) {
    return {
      eligible: false,
      category,
      montant: 0,
      message: `❌ Non éligible : aucune aide pour ${input.typePac} en catégorie ${category}.`,
      details,
    }
  }

  return {
    eligible: true,
    category,
    montant,
    message: `✅ Éligible ! MaPrimeRénov' ${category.toUpperCase()} : ${montant.toLocaleString("fr-FR")} €`,
    details: [
      ...details,
      `Montant pour ${input.typePac} : ${montant.toLocaleString("fr-FR")} €`,
      "⚠️ Ce montant est indicatif. Vérifiez votre éligibilité sur maprimerenov.gouv.fr",
    ],
  }
}
