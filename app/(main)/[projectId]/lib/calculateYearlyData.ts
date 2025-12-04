import type { ProjectData } from "@/types/projectData";
import type { YearlyData } from "@/types/yearlyData";
import { calculateCurrentCostForYear } from "@/app/(main)/[projectId]/lib/calculateCurrentCostForYear";
import { calculatePacCostForYear } from "@/app/(main)/[projectId]/lib/calculatePacCostForYear";

interface CalculateYearlyDataParams {
  data: ProjectData;
  years: number;
}

/**
 * Calcule les données année par année sur une période donnée
 * @param params.data Données du projet
 * @param params.years Nombre d'années de projection
 * @returns Tableau des données annuelles
 */
export const calculateYearlyData = async ({
  data,
  years,
}: CalculateYearlyDataParams): Promise<YearlyData[]> => {
  const yearlyData: YearlyData[] = [];
  let economiesCumulees = 0;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < years; i++) {
    const coutActuel = await calculateCurrentCostForYear({ data, year: i });
    const coutPac = await calculatePacCostForYear({ data, year: i });
    const economie = coutActuel - coutPac;
    economiesCumulees += economie;

    yearlyData.push({
      year: currentYear + i,
      coutActuel: coutActuel,
      coutPac: coutPac,
      economie: economie,
      economiesCumulees: economiesCumulees,
    });
  }

  return yearlyData;
};
