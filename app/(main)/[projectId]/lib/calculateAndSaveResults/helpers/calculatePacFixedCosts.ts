import type { ProjectData } from "@/types/projectData";
import { ELECTRICITY_SUBSCRIPTION_ANNUAL } from "@/config/constants";

/**
 * Calcule les coûts FIXES annuels de la PAC
 * Inclut:
 * - SURCOÛT d'abonnement électricité (différence entre puissance PAC et puissance actuelle)
 * - Entretien annuel PAC
 *
 * Note: L'abonnement gaz est supprimé (économie comptabilisée dans la comparaison)
 * Note: On ne compte que le SURCOÛT d'abonnement électrique, pas l'abonnement complet
 *
 * @param data Données du projet
 * @returns Objet détaillant les coûts fixes de la PAC
 */
export const calculatePacFixedCosts = (data: ProjectData): {
  abonnementElec: number;
  entretien: number;
  total: number;
} => {
  const puissancePac = data.heatPumpSubscribedPowerKva || 9;
  const puissanceActuelle = data.currentSubscribedPowerKva || 6;

  // SURCOÛT d'abonnement électricité (différence entre PAC et actuel)
  const abonnementPac =
    ELECTRICITY_SUBSCRIPTION_ANNUAL[
      puissancePac as keyof typeof ELECTRICITY_SUBSCRIPTION_ANNUAL
    ] || 0;

  const abonnementActuel =
    ELECTRICITY_SUBSCRIPTION_ANNUAL[
      puissanceActuelle as keyof typeof ELECTRICITY_SUBSCRIPTION_ANNUAL
    ] || 0;

  // On ne prend que le SURCOÛT d'abonnement
  const abonnementElec = abonnementPac - abonnementActuel;

  // Entretien PAC
  const entretien = data.annualMaintenanceCost || 120;

  return {
    abonnementElec,
    entretien,
    total: abonnementElec + entretien,
  };
}
