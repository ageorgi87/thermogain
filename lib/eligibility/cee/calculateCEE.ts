/**
 * Calcule l'éligibilité et le montant CEE pour une PAC
 */

import { CEEInput, CEEResult, MONTANTS_CEE_PAC_2024 } from './ceeData'
import { determineCEECategory } from './helpers/determineCEECategory'
import { isIleDeFrance } from './helpers/isIleDeFrance'

export const calculateCEE = (input: CEEInput): CEEResult => {
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
