import type { ProjectData } from "@/types/projectData";
import { ECS_ESTIMATION } from "@/config/constants";
import { getCurrentConsumptionKwh, getCurrentEnergyPrice } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/helpers/energyDataExtractors";

/**
 * Résultat du calcul des coûts ECS
 */
export interface DhwCostCalculation {
  /** Coût ECS actuel annuel (€/an) */
  currentDhwCost: number;

  /** Coût ECS futur annuel avec PAC (€/an) - 0 si PAC sans gestion ECS */
  futureDhwCost: number;

  /** Économies ECS annuelles (€/an) */
  dhwEconomiesAnnuelles: number;

  /** Consommation ECS estimée ou réelle (kWh/an) */
  dhwConsumptionKwh: number;

  /** Flag indiquant si la consommation ECS est estimée (ADEME) */
  isEstimated: boolean;

  /** Scénario détecté (A, B, C, D) pour debugging/logs */
  scenario: "A" | "B" | "C" | "D";
}

/**
 * Calcule les coûts ECS (Eau Chaude Sanitaire) selon 4 scénarios possibles:
 *
 * - Scénario A: ECS intégrée → PAC sans ECS
 *   → Pas de changement ECS (inclus dans chauffage)
 *
 * - Scénario B: ECS intégrée → PAC avec ECS
 *   → Estimation ADEME pour séparer chauffage/ECS
 *
 * - Scénario C: ECS séparée → PAC sans ECS
 *   → ECS conservé (même coût avant/après)
 *
 * - Scénario D: ECS séparée → PAC avec ECS
 *   → Calcul complet ECS actuel vs futur
 *
 * @param data Données complètes du projet
 * @returns Détails des coûts ECS et économies
 */
export const calculateDhwCosts = (data: ProjectData): DhwCostCalculation => {
  const ecsIntegrated = data.ecs_integrated ?? false;
  const withEcsManagement = data.with_ecs_management ?? false;

  // ============================================================================
  // SCÉNARIO A : ECS intégrée + PAC sans gestion ECS
  // ============================================================================
  // L'ECS reste intégrée au système de chauffage actuel
  // Pas de changement côté ECS
  if (ecsIntegrated && !withEcsManagement) {
    return {
      currentDhwCost: 0,
      futureDhwCost: 0,
      dhwEconomiesAnnuelles: 0,
      dhwConsumptionKwh: 0,
      isEstimated: false,
      scenario: "A",
    };
  }

  // ============================================================================
  // SCÉNARIO B : ECS intégrée + PAC avec gestion ECS
  // ============================================================================
  // Problème : On ne connaît PAS la répartition chauffage/ECS
  // Solution : Estimation ADEME (800 kWh/personne/an)
  if (ecsIntegrated && withEcsManagement) {
    // Besoins énergétiques totaux (chauffage + ECS)
    const besoinsTotaux = getCurrentConsumptionKwh(data, true);

    // Estimation besoins ECS (ADEME)
    const nombreOccupants = data.nombre_occupants || 4; // Default 4 personnes
    let besoinsDhw = nombreOccupants * ECS_ESTIMATION.KWH_PER_PERSON_PER_YEAR;
    let besoinsChauffage = besoinsTotaux - besoinsDhw;

    // Validation : Si estimation ECS > total, utiliser ratio 80/20 (fallback)
    if (besoinsChauffage < 0 || besoinsDhw > besoinsTotaux) {
      besoinsChauffage = besoinsTotaux * ECS_ESTIMATION.HEATING_TO_TOTAL_RATIO;
      besoinsDhw = besoinsTotaux * ECS_ESTIMATION.DHW_TO_TOTAL_RATIO;
    }

    // Coût ECS actuel (estimation basée sur prix actuel)
    const prixEnergie = getCurrentEnergyPrice(data);
    const currentDhwCost = besoinsDhw * prixEnergie;

    // Coût ECS futur (PAC avec COP ECS)
    const copDhw = data.cop_ecs || data.cop_ajuste * ECS_ESTIMATION.COP_REDUCTION_FACTOR;
    const prixElecPac = data.prix_elec_pac || data.prix_elec_kwh || 0;
    const consoDhwPac = besoinsDhw / copDhw;
    const futureDhwCost = consoDhwPac * prixElecPac;

    return {
      currentDhwCost,
      futureDhwCost,
      dhwEconomiesAnnuelles: currentDhwCost - futureDhwCost,
      dhwConsumptionKwh: besoinsDhw,
      isEstimated: true,
      scenario: "B",
    };
  }

  // ============================================================================
  // SCÉNARIO C : ECS séparée + PAC sans gestion ECS
  // ============================================================================
  // Le système ECS actuel est conservé → même coût avant/après
  if (!ecsIntegrated && !withEcsManagement) {
    const consoDhw = data.conso_ecs_kwh || 0;
    const prixDhw = data.prix_ecs_kwh || 0;
    const entretienDhw = data.entretien_ecs || 0;

    const dhwCost = consoDhw * prixDhw + entretienDhw;

    return {
      currentDhwCost: dhwCost,
      futureDhwCost: dhwCost, // Même coût (système conservé)
      dhwEconomiesAnnuelles: 0, // Pas d'économies
      dhwConsumptionKwh: consoDhw,
      isEstimated: false,
      scenario: "C",
    };
  }

  // ============================================================================
  // SCÉNARIO D : ECS séparée + PAC avec gestion ECS
  // ============================================================================
  // Calcul complet : ECS actuel séparé vs PAC avec ECS intégrée
  if (!ecsIntegrated && withEcsManagement) {
    const consoDhw = data.conso_ecs_kwh || 0;
    const prixDhw = data.prix_ecs_kwh || 0;
    const entretienDhw = data.entretien_ecs || 0;

    // Coût ECS actuel
    const currentDhwCost = consoDhw * prixDhw + entretienDhw;

    // Coût ECS futur (PAC avec COP ECS)
    const copDhw = data.cop_ecs || data.cop_ajuste * ECS_ESTIMATION.COP_REDUCTION_FACTOR;
    const prixElecPac = data.prix_elec_pac || data.prix_elec_kwh || 0;
    const consoDhwPac = consoDhw / copDhw;
    const futureDhwCost = consoDhwPac * prixElecPac;
    // Note: Pas d'entretien séparé (inclus dans entretien_pac)

    return {
      currentDhwCost,
      futureDhwCost,
      dhwEconomiesAnnuelles: currentDhwCost - futureDhwCost,
      dhwConsumptionKwh: consoDhw,
      isEstimated: false,
      scenario: "D",
    };
  }

  // Fallback (ne devrait jamais arriver)
  return {
    currentDhwCost: 0,
    futureDhwCost: 0,
    dhwEconomiesAnnuelles: 0,
    dhwConsumptionKwh: 0,
    isEstimated: false,
    scenario: "A",
  };
};
