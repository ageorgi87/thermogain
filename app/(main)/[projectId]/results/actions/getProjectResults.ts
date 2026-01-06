"use server";

import { prisma } from "@/lib/prisma";
import type { CalculationResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/types/calculationResults";
import type { YearlyData } from "@/types/yearlyData";

/**
 * Récupère les résultats calculés depuis la base de données
 * Retourne null si aucun résultat n'existe pour ce projet
 *
 * @param projectId - ID du projet
 * @returns Résultats calculés ou null
 */
export const getProjectResults = async (
  projectId: string
): Promise<CalculationResults | null> => {
  try {
    const results = await prisma.projectResults.findUnique({
      where: { projectId },
    });

    if (!results) {
      return null;
    }

    // Convert DB data to CalculationResults type
    return {
      // Year 1 costs
      currentAnnualCost: results.currentAnnualCost,
      heatPumpAnnualCost: results.heatPumpAnnualCost,
      annualSavings: results.annualSavings,
      consommationPacKwh: results.consommationPacKwh,

      // Monthly costs
      currentMonthlyCost: results.currentMonthlyCost,
      heatPumpMonthlyCost: results.heatPumpMonthlyCost,
      monthlySavings: results.monthlySavings,

      // Projections (parse JSON back to YearlyData[])
      yearlyData: results.yearlyData as unknown as YearlyData[],

      // ROI
      paybackPeriod: results.paybackPeriod,
      paybackYear: results.paybackYear,

      // Total lifetime gains
      totalSavingsLifetime: results.totalSavingsLifetime,
      netBenefitLifetime: results.netBenefitLifetime,
      profitabilityRate: results.profitabilityRate,

      // Total lifetime costs
      totalCurrentCostLifetime: results.totalCurrentCostLifetime,
      totalHeatPumpCostLifetime: results.totalHeatPumpCostLifetime,

      // Financing
      monthlyLoanPayment: results.monthlyLoanPayment ?? undefined,
      totalLoanCost: results.totalLoanCost ?? undefined,
      actualInvestment: results.actualInvestment,
    };
  } catch (error) {
    console.error(
      `❌ Erreur lors de la récupération des résultats pour le projet ${projectId}:`,
      error
    );
    return null;
  }
};
