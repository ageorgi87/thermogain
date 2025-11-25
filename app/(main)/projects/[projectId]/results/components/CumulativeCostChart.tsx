"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Label } from "recharts"
import { YearlyData } from "../../calculations"
import { calculateMensualite } from "@/lib/loanCalculations"

interface CumulativeCostChartProps {
  yearlyData: YearlyData[]
  investmentCost: number
  paybackYear: number | null
  modeFinancement?: string
  montantCredit?: number
  tauxInteret?: number
  dureeCreditMois?: number
  apportPersonnel?: number
}

export function CumulativeCostChart({
  yearlyData,
  investmentCost,
  paybackYear,
  modeFinancement = "Comptant",
  montantCredit = 0,
  tauxInteret = 0,
  dureeCreditMois = 0,
  apportPersonnel = 0,
}: CumulativeCostChartProps) {
  // Utiliser toutes les années disponibles (durée de vie de la PAC)
  const data = yearlyData
  const nbYears = data.length

  // Calculer le coût de financement par année selon le mode
  const getFinancementCostPerYear = (yearIndex: number): number => {
    const yearNumber = yearIndex + 1 // Année 1, 2, 3...

    if (modeFinancement === "Comptant") {
      // Tout payé en année 1
      return yearNumber === 1 ? investmentCost : 0
    }
    else if (modeFinancement === "Crédit" && montantCredit && dureeCreditMois && tauxInteret !== undefined) {
      // Mensualités réparties sur la durée du crédit
      const dureeCreditAnnees = Math.ceil(dureeCreditMois / 12)

      if (yearNumber <= dureeCreditAnnees) {
        const mensualite = calculateMensualite(montantCredit, tauxInteret, dureeCreditMois)

        // Calculer combien de mois dans cette année
        const moisRestants = dureeCreditMois - (yearNumber - 1) * 12
        const moisCetteAnnee = Math.min(12, moisRestants)

        return mensualite * moisCetteAnnee
      }
      return 0
    }
    else if (modeFinancement === "Mixte" && montantCredit && dureeCreditMois && tauxInteret !== undefined && apportPersonnel) {
      // Apport personnel en année 1 + mensualités du crédit
      const dureeCreditAnnees = Math.ceil(dureeCreditMois / 12)

      if (yearNumber === 1) {
        // Année 1 : apport personnel + première année de mensualités
        const mensualite = calculateMensualite(montantCredit, tauxInteret, dureeCreditMois)
        const moisCetteAnnee = Math.min(12, dureeCreditMois)
        return apportPersonnel + (mensualite * moisCetteAnnee)
      } else if (yearNumber <= dureeCreditAnnees) {
        // Années suivantes : mensualités uniquement
        const mensualite = calculateMensualite(montantCredit, tauxInteret, dureeCreditMois)
        const moisRestants = dureeCreditMois - (yearNumber - 1) * 12
        const moisCetteAnnee = Math.min(12, moisRestants)
        return mensualite * moisCetteAnnee
      }
      return 0
    }

    // Fallback: mode Comptant par défaut
    return yearNumber === 1 ? investmentCost : 0
  }

  // Calculer les coûts cumulés
  const chartData = data.map((year, index) => {
    // Coût cumulé avec chauffage actuel (pas d'investissement initial)
    const coutCumuleActuel = data.slice(0, index + 1).reduce((sum, y) => sum + y.coutActuel, 0)

    // Coût cumulé avec PAC (financement + coûts annuels d'électricité)
    const coutFinancementCumule = data.slice(0, index + 1).reduce((sum, _, i) => sum + getFinancementCostPerYear(i), 0)
    const coutElectriciteCumule = data.slice(0, index + 1).reduce((sum, y) => sum + y.coutPac, 0)
    const coutCumulePac = coutFinancementCumule + coutElectriciteCumule

    return {
      year: year.year,
      coutCumuleActuel: Math.round(coutCumuleActuel),
      coutCumulePac: Math.round(coutCumulePac),
    }
  })

  const chartConfig = {
    coutCumuleActuel: {
      label: "Coût cumulé actuel",
      color: "hsl(var(--destructive))",
    },
    coutCumulePac: {
      label: "Coût cumulé PAC",
      color: "hsl(var(--primary))",
    },
  }

  // Calculer le point exact de croisement des courbes (interpolation linéaire)
  let breakEvenYear: number | null = null

  console.log('=== DEBUG BREAK EVEN ===')
  console.log('Total data points:', chartData.length)
  console.log('First 3 data points:', chartData.slice(0, 3))
  console.log('Last 3 data points:', chartData.slice(-3))

  for (let i = 1; i < chartData.length; i++) {
    const prev = chartData[i - 1]
    const curr = chartData[i]

    const prevDiff = prev.coutCumulePac - prev.coutCumuleActuel
    const currDiff = curr.coutCumulePac - curr.coutCumuleActuel

    // Log tous les points pour debug
    if (i <= 5 || (prevDiff > 0 && currDiff < 0)) {
      console.log(`Year ${curr.year}: prevDiff=${prevDiff}, currDiff=${currDiff}`)
    }

    // Vérifier si les courbes se croisent entre prev et curr
    // Le croisement se produit quand le signe de la différence change
    if (prevDiff > 0 && currDiff <= 0) {
      // Interpolation linéaire pour trouver l'année exacte du croisement
      const diff1 = prevDiff
      const diff2 = -currDiff

      if (diff1 + diff2 !== 0) {
        const fraction = diff1 / (diff1 + diff2)
        breakEvenYear = prev.year + fraction
      } else {
        breakEvenYear = curr.year
      }
      console.log('✅ Break even found at year:', breakEvenYear)
      console.log('  Between years:', prev.year, 'and', curr.year)
      console.log('  Interpolation fraction:', diff1 / (diff1 + diff2))
      break
    }
  }

  console.log('Final breakEvenYear:', breakEvenYear)

  // Description selon le mode de financement
  const getFinancementDescription = () => {
    if (modeFinancement === "Comptant") {
      return `Investissement total payé en année 1 (${investmentCost.toLocaleString()} €)`
    } else if (modeFinancement === "Crédit" && dureeCreditMois) {
      const dureeCreditAnnees = Math.ceil(dureeCreditMois / 12)
      return `Financement par crédit sur ${dureeCreditAnnees} an${dureeCreditAnnees > 1 ? 's' : ''} (mensualités + intérêts inclus)`
    } else if (modeFinancement === "Mixte" && apportPersonnel && dureeCreditMois) {
      const dureeCreditAnnees = Math.ceil(dureeCreditMois / 12)
      return `Financement mixte : ${apportPersonnel.toLocaleString()} € comptant + crédit sur ${dureeCreditAnnees} an${dureeCreditAnnees > 1 ? 's' : ''}`
    }
    return "Comparaison incluant l'investissement initial de la PAC (durée de vie estimée)"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coûts cumulés sur {nbYears} ans</CardTitle>
        <CardDescription>
          {getFinancementDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="year"
                type="number"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => `${value}`}
                className="text-xs"
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
                className="text-xs"
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Année
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {payload[0].payload.year}
                          </span>
                        </div>
                        {payload.map((entry: any, index: number) => (
                          <div key={index} className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              {entry.name}
                            </span>
                            <span className="font-bold" style={{ color: entry.color }}>
                              {entry.value.toLocaleString()} €
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }}
              />

              {/* Ligne verticale au point de croisement */}
              {breakEvenYear && (
                <ReferenceLine
                  x={breakEvenYear}
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                >
                  <Label
                    value={`ROI: ${Math.floor(breakEvenYear)}`}
                    position="top"
                    fill="#22c55e"
                    fontSize={12}
                    fontWeight="bold"
                  />
                </ReferenceLine>
              )}

              <Line
                type="monotone"
                dataKey="coutCumuleActuel"
                stroke="#ef4444"
                strokeWidth={3}
                name="Sans PAC (chauffage actuel)"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="coutCumulePac"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Avec PAC (investissement inclus)"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Légende personnalisée */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-red-500"></div>
            <span className="text-sm text-muted-foreground">Sans PAC (chauffage actuel)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-500"></div>
            <span className="text-sm text-muted-foreground">
              Avec PAC ({modeFinancement === "Crédit" ? "crédit" : modeFinancement === "Mixte" ? "mixte" : "comptant"} + électricité)
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
