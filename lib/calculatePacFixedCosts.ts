import type { ProjectData } from "@/types/projectData";
import { getAbonnementElectriciteAnnuel } from "@/lib/getAbonnementElectriciteAnnuel";

/**
 * Calcule les coûts FIXES annuels de la PAC
 * Inclut:
 * - Abonnement électricité (puissance nécessaire pour la PAC)
 * - Entretien annuel PAC
 *
 * Note: L'abonnement gaz est supprimé (économie comptabilisée dans la comparaison)
 *
 * @param data Données du projet
 * @returns Objet détaillant les coûts fixes de la PAC
 */
export const calculatePacFixedCosts = (data: ProjectData): {
  abonnementElec: number;
  entretien: number;
  total: number;
} => {
  const puissancePac = data.puissance_souscrite_pac || 9;

  // Abonnement électricité avec PAC (puissance augmentée)
  const abonnementElec = getAbonnementElectriciteAnnuel(puissancePac);

  // Entretien PAC
  const entretien = data.entretien_pac_annuel || 120;

  return {
    abonnementElec,
    entretien,
    total: abonnementElec + entretien,
  };
}
