import { z } from "zod";

/**
 * Schéma Zod pour les données annuelles (YearlyData)
 */
export const yearlyDataSchema = z.object({
  year: z.number().int().positive(),
  coutActuel: z.number(),
  coutPac: z.number(),
  economie: z.number(),
  economiesCumulees: z.number(),
});

/**
 * Schéma Zod pour la validation des résultats de calcul
 */
export const calculationResultsSchema = z.object({
  // Coûts année 1
  coutAnnuelActuel: z.number().nonnegative(),
  coutAnnuelPac: z.number().nonnegative(),
  economiesAnnuelles: z.number(),

  // Coûts mensuels
  coutMensuelActuel: z.number().nonnegative(),
  coutMensuelPac: z.number().nonnegative(),
  economieMensuelle: z.number(),

  // ROI
  paybackPeriod: z.number().nullable(),
  paybackYear: z.number().int().nullable(),

  // Gains totaux sur durée de vie PAC
  totalSavingsLifetime: z.number(),
  netBenefitLifetime: z.number(),
  tauxRentabilite: z.number().nullable(),

  // Coûts totaux sur durée de vie
  coutTotalActuelLifetime: z.number().nonnegative(),
  coutTotalPacLifetime: z.number().nonnegative(),

  // Financement
  mensualiteCredit: z.number().nonnegative().optional(),
  coutTotalCredit: z.number().nonnegative().optional(),
  investissementReel: z.number().nonnegative(),

  // Projections annuelles
  yearlyData: z.array(yearlyDataSchema).min(1),
});

/**
 * Schéma Zod pour les paramètres de saveProjectResults
 */
export const saveProjectResultsParamsSchema = z.object({
  projectId: z.string().uuid(),
  results: calculationResultsSchema,
});

export type SaveProjectResultsParams = z.infer<
  typeof saveProjectResultsParamsSchema
>;
