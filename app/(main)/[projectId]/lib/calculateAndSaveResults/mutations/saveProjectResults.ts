"use server";

import { prisma } from "@/lib/prisma";
import type { CalculationResults } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/types/calculationResults";
import type { Prisma } from "@prisma/client";
import { saveProjectResultsParamsSchema } from "@/app/(main)/[projectId]/lib/calculateAndSaveResults/mutations/saveProjectResultsSchema";

/**
 * Sauvegarde les résultats calculés dans la base de données
 * Crée ou met à jour l'entrée ProjectResults pour le projet donné
 *
 * @param projectId - ID du projet
 * @param results - Résultats calculés à sauvegarder
 */
export const saveProjectResults = async (
  projectId: string,
  results: CalculationResults
): Promise<void> => {
  // Validation des paramètres
  const validation = saveProjectResultsParamsSchema.safeParse({
    projectId,
    results,
  });

  if (!validation.success) {
    console.error(
      "[saveProjectResults] Validation error:",
      validation.error.issues
    );
    throw new Error(
      `Données de résultats invalides: ${validation.error.issues.map((e) => e.message).join(", ")}`
    );
  }

  try {
    await prisma.projectResults.upsert({
      where: { projectId },
      update: {
        // Year 1 costs
        currentAnnualCost: results.currentAnnualCost,
        heatPumpAnnualCost: results.heatPumpAnnualCost,
        annualSavings: results.annualSavings,
        consommationPacKwh: results.consommationPacKwh,

        // Monthly costs
        currentMonthlyCost: results.currentMonthlyCost,
        heatPumpMonthlyCost: results.heatPumpMonthlyCost,
        monthlySavings: results.monthlySavings,

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
        monthlyLoanPayment: results.monthlyLoanPayment ?? null,
        totalLoanCost: results.totalLoanCost ?? null,
        actualInvestment: results.actualInvestment,

        // Yearly data (stored as JSON)
        yearlyData: results.yearlyData as unknown as Prisma.InputJsonValue,

        updatedAt: new Date(),
      },
      create: {
        projectId,
        // Year 1 costs
        currentAnnualCost: results.currentAnnualCost,
        heatPumpAnnualCost: results.heatPumpAnnualCost,
        annualSavings: results.annualSavings,
        consommationPacKwh: results.consommationPacKwh,

        // Monthly costs
        currentMonthlyCost: results.currentMonthlyCost,
        heatPumpMonthlyCost: results.heatPumpMonthlyCost,
        monthlySavings: results.monthlySavings,

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
        monthlyLoanPayment: results.monthlyLoanPayment ?? null,
        totalLoanCost: results.totalLoanCost ?? null,
        actualInvestment: results.actualInvestment,

        // Yearly data (stored as JSON)
        yearlyData: results.yearlyData as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.error(
      `❌ Erreur lors de la sauvegarde des résultats pour le projet ${projectId}:`,
      error
    );
    throw new Error("Impossible de sauvegarder les résultats");
  }
};
