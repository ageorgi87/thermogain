import { calculateBoilerEfficiency } from "@/lib/heating/calculateBoilerEfficiency";
import type { EtatInstallation } from "@/app/(main)/[projectId]/(step)/chauffage-actuel/types/etatInstallation"

interface AdjustedConsumptionResult {
  adjustedConsumption: number;
  efficiency: number;
}

interface AdjustConsumptionForEfficiencyParams {
  typeChauffage: string
  ageInstallation: number
  etatInstallation: EtatInstallation
  consumptionValue: number
}

/**
 * Calcule le rendement réel de l'installation actuelle et ajuste la consommation
 * Cette fonction prend en compte l'âge et l'état de l'installation pour calculer
 * le rendement réel, puis ajuste la consommation estimée en conséquence
 */
export const adjustConsumptionForEfficiency = ({
  typeChauffage,
  ageInstallation,
  etatInstallation,
  consumptionValue
}: AdjustConsumptionForEfficiencyParams): AdjustedConsumptionResult => {
  // Calculer le rendement réel de la chaudière
  const efficiency = calculateBoilerEfficiency(
    typeChauffage,
    ageInstallation,
    etatInstallation
  );

  // Pour les systèmes à combustion, ajuster la consommation en fonction du rendement
  // La consommation estimée est basée sur une installation "moyenne"
  // On ajuste donc selon le rendement réel vs rendement moyen

  // Rendement moyen de référence utilisé dans l'estimation initiale
  // (correspond à une installation de ~10 ans en état moyen)
  const REFERENCE_EFFICIENCY: Record<string, number> = {
    Gaz: 0.82,
    Fioul: 0.68,
    GPL: 0.82,
    Pellets: 0.8,
    Bois: 0.8,
    Electrique: 1.0,
    "PAC Air/Air": 1.0,
    "PAC Air/Eau": 1.0,
    "PAC Eau/Eau": 1.0,
  };

  const refEfficiency = REFERENCE_EFFICIENCY[typeChauffage] || 0.75;

  // Si le rendement réel est inférieur au rendement de référence,
  // la consommation réelle sera plus élevée (et vice versa)
  const adjustedConsumption = consumptionValue * (refEfficiency / efficiency);

  return {
    adjustedConsumption: Math.round(adjustedConsumption),
    efficiency,
  };
};
