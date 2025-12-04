"use server"

import { prisma } from "@/lib/prisma"
import type { CalculationResults } from "@/types/calculationResults"
import type { YearlyData } from "@/types/yearlyData"

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
      where: { projectId }
    })

    if (!results) {
      return null
    }

    // Convert DB data to CalculationResults type
    return {
      // Year 1 costs
      coutAnnuelActuel: results.coutAnnuelActuel,
      coutAnnuelPac: results.coutAnnuelPac,
      economiesAnnuelles: results.economiesAnnuelles,
      consommationPacKwh: results.consommationPacKwh,

      // Monthly costs
      coutMensuelActuel: results.coutMensuelActuel,
      coutMensuelPac: results.coutMensuelPac,
      economieMensuelle: results.economieMensuelle,

      // Projections (parse JSON back to YearlyData[])
      yearlyData: results.yearlyData as unknown as YearlyData[],

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
      mensualiteCredit: results.mensualiteCredit ?? undefined,
      coutTotalCredit: results.coutTotalCredit ?? undefined,
      investissementReel: results.investissementReel
    }
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des résultats pour le projet ${projectId}:`, error)
    return null
  }
}
