import type { ProjectData } from "@/types/projectData";
import { calculateCurrentConsumptionKwh } from "./calculateCurrentConsumptionKwh";

/**
 * Calcule la consommation électrique annuelle de la PAC
 * Formule: Consommation PAC = Besoins énergétiques / COP ajusté
 * @param data Données du projet (avec cop_ajuste déjà calculé)
 * @returns Consommation PAC en kWh
 */
export const calculatePacConsumptionKwh = (data: ProjectData): number => {
  const currentConsumptionKwh = calculateCurrentConsumptionKwh(data);
  return currentConsumptionKwh / data.cop_ajuste;
}
