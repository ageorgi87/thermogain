import type { YearlyData } from "@/types/yearlyData"

export interface CalculationResults {
  // Coûts année 1
  coutAnnuelActuel: number
  coutAnnuelPac: number
  economiesAnnuelles: number
  consommationPacKwh: number // Consommation électrique annuelle de la PAC (kWh/an)

  // Projections
  yearlyData: YearlyData[]

  // ROI
  paybackPeriod: number | null // En années
  paybackYear: number | null   // Année calendaire

  // Gains totaux sur durée de vie PAC
  totalSavingsLifetime: number
  netBenefitLifetime: number
  tauxRentabilite: number | null // Taux de rentabilité annuel moyen en %

  // Coûts totaux sur durée de vie
  coutTotalActuelLifetime: number  // Coût total chauffage actuel sur durée de vie PAC
  coutTotalPacLifetime: number     // Coût total PAC (investissement + électricité) sur durée de vie

  // Coûts mensuels
  coutMensuelActuel: number
  coutMensuelPac: number
  economieMensuelle: number

  // Financement
  mensualiteCredit?: number
  coutTotalCredit?: number
  investissementReel: number // Investissement réel incluant les intérêts du crédit
}
