// Export all calculation functions
export * from "./types"
export * from "./currentCost/currentCost"
export * from "./pacCost/pacCost"
export * from "./savings/savings"
export * from "./roi/roi"

// Main calculation function that orchestrates all calculations
import { ProjectData, CalculationResults } from "./types"
import { calculateCurrentAnnualCost } from "./currentCost/currentCost"
import { calculatePacAnnualCost } from "./pacCost/pacCost"
import { calculateYearlyData, calculateTotalSavings, calculateNetBenefit } from "./savings/savings"
import {
  calculatePaybackPeriod,
  calculatePaybackYear,
  calculateMonthlyPayment,
  calculateTotalCreditCost,
} from "./roi/roi"

/**
 * Fonction principale qui calcule tous les résultats du projet
 * @param data Données du projet
 * @returns Tous les résultats calculés
 */
export function calculateAllResults(data: ProjectData): CalculationResults {
  // Coûts année 1
  const coutAnnuelActuel = calculateCurrentAnnualCost(data)
  const coutAnnuelPac = calculatePacAnnualCost(data)
  const economiesAnnuelles = coutAnnuelActuel - coutAnnuelPac

  // Projections sur la durée de vie de la PAC
  const yearlyData = calculateYearlyData(data, data.duree_vie_pac)

  // ROI
  const paybackPeriod = calculatePaybackPeriod(data)
  const paybackYear = calculatePaybackYear(data)

  // Gains totaux sur la durée de vie de la PAC
  const totalSavingsLifetime = calculateTotalSavings(data, data.duree_vie_pac)
  const netBenefitLifetime = calculateNetBenefit(data, data.duree_vie_pac)

  // Coûts totaux sur durée de vie
  const coutTotalActuelLifetime = yearlyData.reduce((sum, y) => sum + y.coutActuel, 0)
  const coutTotalPacLifetime = data.reste_a_charge + yearlyData.reduce((sum, y) => sum + y.coutPac, 0)

  // Taux de rentabilité annuel moyen
  // Formule: ((Valeur finale / Investissement initial)^(1/nombre d'années) - 1) * 100
  // Valeur finale = Investissement + Gain net
  let tauxRentabilite: number | null = null
  if (data.reste_a_charge > 0 && data.duree_vie_pac > 0) {
    const valeurFinale = data.reste_a_charge + netBenefitLifetime
    if (valeurFinale > 0) {
      tauxRentabilite = (Math.pow(valeurFinale / data.reste_a_charge, 1 / data.duree_vie_pac) - 1) * 100
    }
  }

  // Coûts mensuels
  const coutMensuelActuel = coutAnnuelActuel / 12
  const coutMensuelPac = coutAnnuelPac / 12
  const economieMensuelle = economiesAnnuelles / 12

  // Financement
  let mensualiteCredit: number | undefined
  let coutTotalCredit: number | undefined

  if (
    data.mode_financement === "Crédit" &&
    data.montant_credit &&
    data.taux_interet &&
    data.duree_credit_mois
  ) {
    mensualiteCredit = calculateMonthlyPayment(
      data.montant_credit,
      data.taux_interet,
      data.duree_credit_mois
    )
    coutTotalCredit = calculateTotalCreditCost(
      data.montant_credit,
      data.taux_interet,
      data.duree_credit_mois
    )
  }

  return {
    coutAnnuelActuel: Math.round(coutAnnuelActuel),
    coutAnnuelPac: Math.round(coutAnnuelPac),
    economiesAnnuelles: Math.round(economiesAnnuelles),
    yearlyData,
    paybackPeriod,
    paybackYear,
    totalSavingsLifetime: Math.round(totalSavingsLifetime),
    netBenefitLifetime: Math.round(netBenefitLifetime),
    tauxRentabilite: tauxRentabilite ? Math.round(tauxRentabilite * 10) / 10 : null,
    coutTotalActuelLifetime: Math.round(coutTotalActuelLifetime),
    coutTotalPacLifetime: Math.round(coutTotalPacLifetime),
    coutMensuelActuel: Math.round(coutMensuelActuel),
    coutMensuelPac: Math.round(coutMensuelPac),
    economieMensuelle: Math.round(economieMensuelle),
    mensualiteCredit: mensualiteCredit ? Math.round(mensualiteCredit) : undefined,
    coutTotalCredit: coutTotalCredit ? Math.round(coutTotalCredit) : undefined,
  }
}
