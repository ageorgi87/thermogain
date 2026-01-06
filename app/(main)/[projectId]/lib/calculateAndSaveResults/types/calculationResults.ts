import type { YearlyData } from "@/types/yearlyData"

export interface CalculationResults {
  // Coûts année 1
  currentAnnualCost: number
  heatPumpAnnualCost: number
  annualSavings: number
  consommationPacKwh: number // Consommation électrique annuelle de la PAC (kWh/an)

  // Projections
  yearlyData: YearlyData[]

  // ROI
  paybackPeriod: number | null // En années
  paybackYear: number | null   // Année calendaire

  // Gains totaux sur durée de vie PAC
  totalSavingsLifetime: number
  netBenefitLifetime: number
  profitabilityRate: number | null // Taux de rentabilité annuel moyen en %

  // Coûts totaux sur durée de vie
  totalCurrentCostLifetime: number  // Coût total chauffage actuel sur durée de vie PAC
  totalHeatPumpCostLifetime: number // Coût total PAC (investissement + électricité) sur durée de vie

  // Coûts mensuels
  currentMonthlyCost: number
  heatPumpMonthlyCost: number
  monthlySavings: number

  // Financement
  monthlyLoanPayment?: number
  totalLoanCost?: number
  actualInvestment: number // Investissement réel incluant les intérêts du crédit
}
