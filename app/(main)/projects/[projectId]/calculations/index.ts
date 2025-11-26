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

  // Calculer l'investissement réel selon le mode de financement
  // Mode Comptant : reste_a_charge
  // Mode Crédit : reste_a_charge + intérêts du crédit
  // Mode Mixte : apport_personnel + montant_credit + intérêts
  let investissementReel = data.reste_a_charge

  if (data.mode_financement === "Crédit" && data.montant_credit && data.taux_interet !== undefined && data.duree_credit_mois) {
    const coutTotalCredit = calculateTotalCreditCost(data.montant_credit, data.taux_interet, data.duree_credit_mois)
    investissementReel = coutTotalCredit
  } else if (data.mode_financement === "Mixte" && data.montant_credit && data.taux_interet !== undefined && data.duree_credit_mois && data.apport_personnel) {
    const coutTotalCredit = calculateTotalCreditCost(data.montant_credit, data.taux_interet, data.duree_credit_mois)
    investissementReel = data.apport_personnel + coutTotalCredit
  }

  // Créer un objet ProjectData ajusté pour le calcul du ROI avec l'investissement réel
  const dataAjusteeROI: ProjectData = {
    ...data,
    reste_a_charge: investissementReel
  }

  // ROI avec investissement réel (incluant intérêts du crédit)
  const paybackPeriod = calculatePaybackPeriod(dataAjusteeROI)
  const paybackYear = calculatePaybackYear(dataAjusteeROI)

  // Gains totaux sur la durée de vie de la PAC
  const totalSavingsLifetime = calculateTotalSavings(data, data.duree_vie_pac)
  const netBenefitLifetime = calculateNetBenefit(dataAjusteeROI, data.duree_vie_pac)

  // Coûts totaux sur durée de vie (utiliser investissement réel)
  const coutTotalActuelLifetime = yearlyData.reduce((sum, y) => sum + y.coutActuel, 0)
  const coutTotalPacLifetime = investissementReel + yearlyData.reduce((sum, y) => sum + y.coutPac, 0)

  // Taux de rentabilité annuel moyen (utiliser investissement réel)
  // Formule: ((Valeur finale / Investissement initial)^(1/nombre d'années) - 1) * 100
  // Valeur finale = Investissement + Gain net
  let tauxRentabilite: number | null = null
  if (investissementReel > 0 && data.duree_vie_pac > 0) {
    const valeurFinale = investissementReel + netBenefitLifetime
    if (valeurFinale > 0) {
      tauxRentabilite = (Math.pow(valeurFinale / investissementReel, 1 / data.duree_vie_pac) - 1) * 100
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
    investissementReel: Math.round(investissementReel),
  }
}
