import type { ProjectData } from "@/types/projectData";
import { calculatePaybackPeriod } from "./calculatePaybackPeriod";

interface CalculatePaybackYearParams {
  data: ProjectData
  maxYears?: number
}

/**
 * Calcule l'année calendaire du retour sur investissement
 * @param params.data Données du projet
 * @param params.maxYears Nombre d'années maximum à analyser
 * @returns Année calendaire du ROI, ou null si pas atteint
 */
export const calculatePaybackYear = async ({
  data,
  maxYears = 30,
}: CalculatePaybackYearParams): Promise<number | null> => {
  const paybackPeriod = await calculatePaybackPeriod({ data, maxYears });
  if (!paybackPeriod) return null;

  // Utiliser Math.floor() pour avoir l'année où le ROI commence à être atteint
  // (correspond à l'année où les courbes se croisent visuellement sur le graphique)
  return new Date().getFullYear() + Math.floor(paybackPeriod);
}
