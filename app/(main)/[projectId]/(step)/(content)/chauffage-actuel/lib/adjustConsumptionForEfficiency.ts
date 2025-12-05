import { calculateBoilerEfficiency } from "./calculateBoilerEfficiency";
import { REFERENCE_EFFICIENCY } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/config/heatingEfficiencyData";
import type { EtatInstallation } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/etatInstallation"

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

  // Ajuster la consommation en fonction du rendement réel vs rendement de référence
  // Si le rendement réel est inférieur au rendement de référence,
  // la consommation réelle sera plus élevée (et vice versa)
  const refEfficiency = REFERENCE_EFFICIENCY[typeChauffage] || 0.75;
  const adjustedConsumption = consumptionValue * (refEfficiency / efficiency);

  return {
    adjustedConsumption: Math.round(adjustedConsumption),
    efficiency,
  };
};
