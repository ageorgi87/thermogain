import type { ProjectData } from "@/types/projectData";
import type { EnergyEvolutionModel } from "@/types/energy";
import { calculatePaybackPeriod } from "./calculatePaybackPeriod";

interface CalculatePaybackYearParams {
  data: ProjectData
  maxYears?: number
  currentEnergyModel: EnergyEvolutionModel
  pacEnergyModel: EnergyEvolutionModel
}

/**
 * Calcule l'année calendaire du retour sur investissement
 * @param params.data Données du projet
 * @param params.maxYears Nombre d'années maximum à analyser
 * @param params.currentEnergyModel Modèle d'évolution pour le chauffage actuel
 * @param params.pacEnergyModel Modèle d'évolution pour la PAC
 * @returns Année calendaire du ROI, ou null si pas atteint
 */
export const calculatePaybackYear = async ({
  data,
  maxYears = 30,
  currentEnergyModel,
  pacEnergyModel,
}: CalculatePaybackYearParams): Promise<number | null> => {
  const paybackPeriod = await calculatePaybackPeriod({
    data,
    maxYears,
    currentEnergyModel,
    pacEnergyModel,
  });
  if (!paybackPeriod) return null;

  // Utiliser Math.floor() pour avoir l'année où le ROI commence à être atteint
  // (correspond à l'année où les courbes se croisent visuellement sur le graphique)
  return new Date().getFullYear() + Math.floor(paybackPeriod);
}
