/**
 * Calcule l'éligibilité et le montant MaPrimeRénov' pour une PAC
 */

import {
  MaPrimeRenovInput,
  MaPrimeRenovResult,
  MONTANTS_PAC_2024,
} from "./maPrimeRenovData";
import { determineCategory } from "./helpers/determineCategory";
import { isIleDeFrance } from "@/lib/isIleDeFrance";

export const calculateMaPrimeRenov = (
  input: MaPrimeRenovInput
): MaPrimeRenovResult => {
  const details: string[] = [];

  // Vérification des conditions d'éligibilité de base
  if (!input.remplacementComplet) {
    return {
      eligible: false,
      montant: 0,
      message:
        "❌ Non éligible : le remplacement complet du système de chauffage est requis.",
      details: [
        "Pour bénéficier de MaPrimeRénov', vous devez remplacer complètement votre système de chauffage actuel.",
        "Une installation en complément (chauffage d'appoint) n'est pas éligible.",
      ],
    };
  }

  if (!input.logementPlusde15ans) {
    return {
      eligible: false,
      montant: 0,
      message: "❌ Non éligible : le logement doit avoir au moins 15 ans.",
      details: ["Le logement doit être construit depuis au moins 15 ans."],
    };
  }

  if (!input.residencePrincipale) {
    return {
      eligible: false,
      montant: 0,
      message:
        "❌ Non éligible : le logement doit être une résidence principale.",
      details: [
        "MaPrimeRénov' est réservée aux résidences principales (occupées au moins 8 mois/an).",
      ],
    };
  }

  // PAC Air/Air non éligibles
  if (input.typePac === "Air/Air") {
    return {
      eligible: false,
      montant: 0,
      message:
        "❌ Non éligible : les PAC Air/Air ne sont pas éligibles à MaPrimeRénov'.",
      details: [
        "Les PAC Air/Air (climatisation réversible) ne sont pas prises en charge.",
        "Seules les PAC Air/Eau et Eau/Eau sont éligibles.",
      ],
    };
  }

  // Déterminer la catégorie de revenus
  const category = determineCategory(
    input.revenuFiscalReference,
    input.nombrePersonnes,
    input.codePostal
  );

  details.push(`Catégorie : ${category.toUpperCase()}`);
  details.push(
    `Zone : ${isIleDeFrance(input.codePostal) ? "Île-de-France" : "Province"}`
  );
  details.push(`Foyer de ${input.nombrePersonnes} personne(s)`);
  details.push(
    `Revenu fiscal : ${input.revenuFiscalReference.toLocaleString("fr-FR")} €`
  );

  // Catégorie ROSE non éligible pour les PAC
  if (category === "rose") {
    return {
      eligible: false,
      category,
      montant: 0,
      message:
        "❌ Non éligible : vos revenus dépassent les plafonds de MaPrimeRénov' pour les PAC.",
      details: [
        ...details,
        "Les foyers aux revenus supérieurs (catégorie rose) ne sont pas éligibles pour les pompes à chaleur.",
      ],
    };
  }

  // Récupérer le montant selon la catégorie et le type de PAC
  const montant = MONTANTS_PAC_2024[category][input.typePac] || 0;

  if (montant === 0) {
    return {
      eligible: false,
      category,
      montant: 0,
      message: `❌ Non éligible : aucune aide pour ${input.typePac} en catégorie ${category}.`,
      details,
    };
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
  };
};
