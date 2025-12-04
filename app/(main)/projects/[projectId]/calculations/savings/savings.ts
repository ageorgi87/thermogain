import type { ProjectData } from "@/types/projectData";
import type { YearlyData } from "@/types/yearlyData";
import { calculateCurrentCostForYear } from "../currentCost/currentCost";
import { calculatePacCostForYear } from "../pacCost/pacCost";

/**
 * Calcule les données année par année sur une période donnée
 * @param data Données du projet
 * @param years Nombre d'années de projection
 * @returns Tableau des données annuelles
 */
export async function calculateYearlyData(
  data: ProjectData,
  years: number
): Promise<YearlyData[]> {
  const yearlyData: YearlyData[] = [];
  let economiesCumulees = 0;
  const currentYear = new Date().getFullYear();

  for (let i = 0; i < years; i++) {
    const coutActuel = await calculateCurrentCostForYear(data, i);
    const coutPac = await calculatePacCostForYear(data, i);
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
}

/**
 * Calcule les économies totales sur une période donnée
 * @param data Données du projet
 * @param years Nombre d'années
 * @returns Économies totales en euros
 */
export async function calculateTotalSavings(
  data: ProjectData,
  years: number
): Promise<number> {
  const yearlyData = await calculateYearlyData(data, years);
  return yearlyData[yearlyData.length - 1]?.economiesCumulees || 0;
}

/**
 * Calcule le bénéfice net = différence entre coût total chauffage actuel et coût total avec PAC
 * @param data Données du projet
 * @param years Nombre d'années
 * @returns Bénéfice net en euros (économies réalisées sur toute la période)
 */
export async function calculateNetBenefit(data: ProjectData, years: number): Promise<number> {
  const yearlyData = await calculateYearlyData(data, years);

  // Coût total avec chauffage actuel sur toute la période
  const coutTotalActuel = yearlyData.reduce((sum, y) => sum + y.coutActuel, 0);

  // Coût total avec PAC (investissement + coûts annuels)
  const coutTotalPac =
    data.reste_a_charge + yearlyData.reduce((sum, y) => sum + y.coutPac, 0);

  // La différence = ce qu'on économise
  return coutTotalActuel - coutTotalPac;
}

/**
 * Calcule les gains nets réalisés uniquement APRÈS le point de rentabilité
 * @param data Données du projet
 * @param years Nombre d'années
 * @returns Gains nets après ROI en euros
 */
export async function calculateGainsAfterROI(
  data: ProjectData,
  years: number
): Promise<number> {
  const yearlyData = await calculateYearlyData(data, years);
  const investment = data.reste_a_charge;

  console.log("=== DEBUG GAINS AFTER ROI ===");
  console.log("Investment (reste_a_charge):", investment);
  console.log("Total years:", years);

  // Trouver l'année où le ROI est atteint
  let roiYearIndex = -1;
  for (let i = 0; i < yearlyData.length; i++) {
    if (yearlyData[i].economiesCumulees >= investment) {
      roiYearIndex = i;
      console.log(`ROI atteint à l'index ${i} (année ${yearlyData[i].year})`);
      console.log(`  Économies cumulées: ${yearlyData[i].economiesCumulees}`);
      break;
    }
  }

  // Si le ROI n'est pas atteint, retourner 0
  if (roiYearIndex === -1) {
    console.log("ROI non atteint");
    return 0;
  }

  // Calculer les économies APRÈS le ROI (uniquement les années suivantes)
  let gainsAfterROI = 0;
  for (let i = roiYearIndex + 1; i < yearlyData.length; i++) {
    gainsAfterROI += yearlyData[i].economie;
  }
  console.log(
    `Total économies après ROI (de l'année ${roiYearIndex + 1} à ${yearlyData.length - 1}):`,
    gainsAfterROI
  );
  console.log(
    `Années prises en compte: ${yearlyData[roiYearIndex + 1]?.year || "N/A"} à ${yearlyData[yearlyData.length - 1]?.year || "N/A"}`
  );

  console.log("Gains nets après ROI:", gainsAfterROI);
  console.log("=== FIN DEBUG ===");

  return gainsAfterROI;
}
