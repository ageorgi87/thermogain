import type { ProjectData } from "@/types/projectData";
import { calculatePacConsumptionKwh } from "./calculatePacConsumptionKwh";

/**
 * Calcule le coût VARIABLE annuel du chauffage avec PAC (électricité uniquement, sans coûts fixes)
 * @param data Données du projet
 * @returns Coût variable annuel en euros
 */
export const calculatePacVariableCost = (data: ProjectData): number => {
  const pacConsumption = calculatePacConsumptionKwh(data);
  // Utilise le prix électricité PAC si renseigné, sinon le prix électricité actuel
  const prixElec = data.prix_elec_pac || data.prix_elec_kwh || 0;
  return pacConsumption * prixElec;
}
