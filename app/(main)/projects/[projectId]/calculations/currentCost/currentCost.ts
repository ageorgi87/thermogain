import { ProjectData } from "../types";
import { getAbonnementElectriciteAnnuel } from "@/lib/subscription/getAbonnementElectriciteAnnuel";
import { getEnergyModelSync } from "@/lib/energy/modelCache/getEnergyModelSync";
import { calculateCostForYear } from "@/lib/energyEvolution/calculateCostForYear";
import { GAS_SUBSCRIPTION } from "@/config/constants";

/**
 * Calcule le coût VARIABLE annuel du chauffage actuel (énergie uniquement, sans coûts fixes)
 * @param data Données du projet
 * @returns Coût variable annuel en euros
 */
export function calculateCurrentVariableCost(data: ProjectData): number {
  switch (data.type_chauffage) {
    case "Fioul":
      return (data.conso_fioul_litres || 0) * (data.prix_fioul_litre || 0);

    case "Gaz":
      return (data.conso_gaz_kwh || 0) * (data.prix_gaz_kwh || 0);

    case "GPL":
      return (data.conso_gpl_kg || 0) * (data.prix_gpl_kg || 0);

    case "Pellets":
      return (data.conso_pellets_kg || 0) * (data.prix_pellets_kg || 0);

    case "Bois":
      return (data.conso_bois_steres || 0) * (data.prix_bois_stere || 0);

    case "Electrique":
      return (data.conso_elec_kwh || 0) * (data.prix_elec_kwh || 0);

    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return (data.conso_pac_kwh || 0) * (data.prix_elec_kwh || 0);

    default:
      return 0;
  }
}

/**
 * Calcule les coûts FIXES annuels du système actuel
 * Inclut: abonnement électricité (si chauffage électrique), abonnement gaz (si applicable), entretien
 *
 * IMPORTANT: Pour isoler le coût du système de chauffage, l'abonnement électricité
 * n'est inclus QUE si le mode de chauffage utilise l'électricité.
 *
 * @param data Données du projet
 * @returns Objet détaillant les coûts fixes
 */
export function calculateCurrentFixedCosts(data: ProjectData): {
  abonnementElec: number;
  abonnementGaz: number;
  entretien: number;
  total: number;
} {
  const puissanceActuelle = data.puissance_souscrite_actuelle || 6;

  // Abonnement électricité: uniquement pour les chauffages électriques ou PAC
  const isElectricHeating = [
    "Electrique",
    "PAC Air/Air",
    "PAC Air/Eau",
    "PAC Eau/Eau",
  ].includes(data.type_chauffage || "");
  const abonnementElec = isElectricHeating
    ? getAbonnementElectriciteAnnuel(puissanceActuelle)
    : 0;

  // Abonnement gaz: uniquement pour chauffage au gaz
  const abonnementGaz =
    data.type_chauffage === "Gaz"
      ? data.abonnement_gaz || GAS_SUBSCRIPTION.ANNUAL_AVERAGE
      : 0;

  // Entretien: utilise la valeur renseignée par l'utilisateur
  const entretien = data.entretien_annuel || 0;

  return {
    abonnementElec,
    abonnementGaz,
    entretien,
    total: abonnementElec + abonnementGaz + entretien,
  };
}

/**
 * Calcule le coût annuel TOTAL du chauffage actuel
 * Inclut les coûts variables (énergie) ET les coûts fixes (abonnements + entretien)
 *
 * @param data Données du projet
 * @returns Coût total annuel en euros
 */
export function calculateCurrentAnnualCost(data: ProjectData): number {
  const variableCost = calculateCurrentVariableCost(data);
  const fixedCosts = calculateCurrentFixedCosts(data);
  return variableCost + fixedCosts.total;
}

/**
 * Obtient le taux d'évolution du prix de l'énergie actuelle
 * @param data Données du projet
 * @returns Taux d'évolution annuel en pourcentage
 */
export function getCurrentEnergyEvolution(data: ProjectData): number {
  switch (data.type_chauffage) {
    case "Fioul":
      return data.evolution_prix_fioul || 0;

    case "Gaz":
      return data.evolution_prix_gaz || 0;

    case "GPL":
      return data.evolution_prix_gpl || 0;

    case "Pellets":
    case "Bois":
      return data.evolution_prix_bois || 0;

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return data.evolution_prix_electricite || 0;

    default:
      return 0;
  }
}

/**
 * Retourne le type d'énergie pour l'API DIDO selon le type de chauffage
 * @param data Données du projet
 * @returns Type d'énergie ('gaz' | 'electricite' | 'fioul' | 'bois')
 */
function getEnergyType(
  data: ProjectData
): "gaz" | "electricite" | "fioul" | "bois" {
  switch (data.type_chauffage) {
    case "Fioul":
    case "GPL":
      return "fioul";

    case "Gaz":
      return "gaz";

    case "Pellets":
    case "Bois":
      return "bois";

    case "Electrique":
    case "PAC Air/Air":
    case "PAC Air/Eau":
    case "PAC Eau/Eau":
      return "electricite";

    default:
      return "gaz"; // Fallback
  }
}

/**
 * Calcule le coût du chauffage actuel pour une année donnée
 *
 * NOUVEAU (Décembre 2024): Utilise le modèle Mean Reversion basé sur l'historique
 * complet de l'API DIDO-SDES (18-42 ans de données selon l'énergie) au lieu d'un
 * taux linéaire constant.
 *
 * Le modèle applique pour chaque type d'énergie:
 * - Gaz: Taux récent 8,7% → Équilibre 3,5% (transition 5 ans)
 * - Électricité: Taux récent 6,9% → Équilibre 2,5% (transition 5 ans)
 * - Fioul: Taux récent 7,2% → Équilibre 2,5% (transition 5 ans)
 * - Bois: Taux récent 3,4% → Équilibre 2,0% (transition 5 ans)
 *
 * IMPORTANT: Seuls les coûts VARIABLES (énergie) évoluent avec le temps.
 * Les coûts FIXES (abonnements, entretien) restent constants en euros constants.
 *
 * @param data Données du projet
 * @param year Année de projection (0 = année actuelle)
 * @returns Coût projeté en euros
 */
export function calculateCurrentCostForYear(
  data: ProjectData,
  year: number
): number {
  // Coûts variables: évoluent avec le modèle Mean Reversion
  const variableCost = calculateCurrentVariableCost(data);
  const fixedCosts = calculateCurrentFixedCosts(data);

  // Récupérer le modèle Mean Reversion selon le type d'énergie
  // Utilise le cache si disponible, sinon valeurs par défaut
  const energyType = getEnergyType(data);
  const model = getEnergyModelSync(energyType);

  // Utiliser la fonction de calcul qui applique le modèle Mean Reversion
  return calculateCostForYear(variableCost, fixedCosts.total, year, model);
}
