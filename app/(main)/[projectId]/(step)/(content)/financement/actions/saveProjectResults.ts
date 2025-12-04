"use server";

import { prisma } from "@/lib/prisma";
import type { CalculationResults } from "@/types/calculationResults";
import type { Prisma } from "@prisma/client";

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
  try {
    await prisma.projectResults.upsert({
      where: { projectId },
      update: {
        // Year 1 costs
        coutAnnuelActuel: results.coutAnnuelActuel,
        coutAnnuelPac: results.coutAnnuelPac,
        economiesAnnuelles: results.economiesAnnuelles,

        // Monthly costs
        coutMensuelActuel: results.coutMensuelActuel,
        coutMensuelPac: results.coutMensuelPac,
        economieMensuelle: results.economieMensuelle,

        // ROI
        paybackPeriod: results.paybackPeriod,
        paybackYear: results.paybackYear,

        // Total lifetime gains
        totalSavingsLifetime: results.totalSavingsLifetime,
        netBenefitLifetime: results.netBenefitLifetime,
        tauxRentabilite: results.tauxRentabilite,

        // Total lifetime costs
        coutTotalActuelLifetime: results.coutTotalActuelLifetime,
        coutTotalPacLifetime: results.coutTotalPacLifetime,

        // Financing
        mensualiteCredit: results.mensualiteCredit ?? null,
        coutTotalCredit: results.coutTotalCredit ?? null,
        investissementReel: results.investissementReel,

        // Yearly data (stored as JSON)
        yearlyData: results.yearlyData as unknown as Prisma.InputJsonValue,

        updatedAt: new Date(),
      },
      create: {
        projectId,
        // Year 1 costs
        coutAnnuelActuel: results.coutAnnuelActuel,
        coutAnnuelPac: results.coutAnnuelPac,
        economiesAnnuelles: results.economiesAnnuelles,

        // Monthly costs
        coutMensuelActuel: results.coutMensuelActuel,
        coutMensuelPac: results.coutMensuelPac,
        economieMensuelle: results.economieMensuelle,

        // ROI
        paybackPeriod: results.paybackPeriod,
        paybackYear: results.paybackYear,

        // Total lifetime gains
        totalSavingsLifetime: results.totalSavingsLifetime,
        netBenefitLifetime: results.netBenefitLifetime,
        tauxRentabilite: results.tauxRentabilite,

        // Total lifetime costs
        coutTotalActuelLifetime: results.coutTotalActuelLifetime,
        coutTotalPacLifetime: results.coutTotalPacLifetime,

        // Financing
        mensualiteCredit: results.mensualiteCredit ?? null,
        coutTotalCredit: results.coutTotalCredit ?? null,
        investissementReel: results.investissementReel,

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
