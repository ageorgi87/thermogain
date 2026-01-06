import { z } from "zod";

/**
 * Schéma Zod pour les données annuelles (YearlyData)
 */
export const yearlyDataSchema = z.object({
  year: z.number().int().positive(),
  currentCost: z.number(),
  heatPumpCost: z.number(),
  savings: z.number(),
  cumulativeSavings: z.number(),
});

/**
 * Schéma Zod pour la validation des résultats de calcul
 */
export const calculationResultsSchema = z.object({
  // Coûts année 1
  currentAnnualCost: z.number().nonnegative(),
  heatPumpAnnualCost: z.number().nonnegative(),
  annualSavings: z.number(),

  // Coûts mensuels
  currentMonthlyCost: z.number().nonnegative(),
  heatPumpMonthlyCost: z.number().nonnegative(),
  monthlySavings: z.number(),

  // ROI
  paybackPeriod: z.number().nullable(),
  paybackYear: z.number().int().nullable(),

  // Gains totaux sur durée de vie PAC
  totalSavingsLifetime: z.number(),
  netBenefitLifetime: z.number(),
  profitabilityRate: z.number().nullable(),

  // Coûts totaux sur durée de vie
  totalCurrentCostLifetime: z.number().nonnegative(),
  totalHeatPumpCostLifetime: z.number().nonnegative(),

  // Financement
  monthlyLoanPayment: z.number().nonnegative().optional(),
  totalLoanCost: z.number().nonnegative().optional(),
  actualInvestment: z.number().nonnegative(),

  // Projections annuelles
  yearlyData: z.array(yearlyDataSchema).min(1),
  consommationPacKwh: z.number().nonnegative(),
});

/**
 * Schéma Zod pour les paramètres de saveProjectResults
 */
export const saveProjectResultsParamsSchema = z.object({
  projectId: z.string().cuid(),
  results: calculationResultsSchema,
});

export type SaveProjectResultsParams = z.infer<
  typeof saveProjectResultsParamsSchema
>;
