import type { ProjectData } from "@/types/projectData";
import { calculateYearlyData } from "./calculateYearlyData";

interface CalculateTotalSavingsParams {
  data: ProjectData
  years: number
}

/**
 * Calcule les économies totales sur une période donnée
 * @param params.data Données du projet
 * @param params.years Nombre d'années
 * @returns Économies totales en euros
 */
export const calculateTotalSavings = async ({
  data,
  years,
}: CalculateTotalSavingsParams): Promise<number> => {
  const yearlyData = await calculateYearlyData({ data, years });
  return yearlyData[yearlyData.length - 1]?.economiesCumulees || 0;
}
