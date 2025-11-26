"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Label } from "recharts"
import { YearlyData } from "../../calculations"
import { Info } from "lucide-react"

interface CumulativeCostChartProps {
  yearlyData: YearlyData[]
  investmentCost: number  // Investissement réel incluant intérêts du crédit
  paybackYear: number | null
  paybackPeriod: number | null  // Période de retour en années (avec fraction)
  modeFinancement?: string
  montantCredit?: number
  dureeCreditMois?: number
  apportPersonnel?: number
}

export function CumulativeCostChart({
  yearlyData,
  investmentCost,
  paybackYear,
  paybackPeriod,
  modeFinancement = "Comptant",
  montantCredit = 0,
  dureeCreditMois = 0,
  apportPersonnel = 0,
}: CumulativeCostChartProps) {
  // Utiliser toutes les années disponibles (durée de vie de la PAC)
  const data = yearlyData
  const nbYears = data.length

  // investmentCost contient déjà l'investissement réel (incluant intérêts du crédit)
  // calculé par calculateAllResults()
  const investissementReel = investmentCost

  // Calculer les coûts cumulés
  const chartData = data.map((year, index) => {
    // Coût cumulé avec chauffage actuel (pas d'investissement initial)
    const coutCumuleActuel = data.slice(0, index + 1).reduce((sum, y) => sum + y.coutActuel, 0)

    // Coût cumulé avec PAC (investissement réel en année 1 + coûts annuels d'électricité)
    const coutElectriciteCumule = data.slice(0, index + 1).reduce((sum, y) => sum + y.coutPac, 0)
    const coutCumulePac = investissementReel + coutElectriciteCumule

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

  // Calculer l'année exacte du break-even avec la fraction
  // pour placer la ligne verticale exactement au croisement des courbes
  const currentYear = new Date().getFullYear()
  const breakEvenYear = paybackPeriod ? currentYear + paybackPeriod : paybackYear

  // Debug
  console.log('=== DEBUG CHART ROI ===')
  console.log('paybackYear:', paybackYear)
  console.log('paybackPeriod:', paybackPeriod)
  console.log('breakEvenYear (avec fraction):', breakEvenYear)
  console.log('investissementReel:', investissementReel)
  console.log('Data range:', chartData[0]?.year, 'to', chartData[chartData.length - 1]?.year)

  // Description selon le mode de financement
  const getFinancementDescription = () => {
    if (modeFinancement === "Comptant") {
      return `Investissement total en année 1 : ${investissementReel.toLocaleString("fr-FR")} €`
    } else if (modeFinancement === "Crédit" && dureeCreditMois) {
      const dureeCreditAnnees = Math.ceil(dureeCreditMois / 12)
      return `Investissement total (crédit ${dureeCreditAnnees} an${dureeCreditAnnees > 1 ? 's' : ''} + intérêts) en année 1 : ${investissementReel.toLocaleString("fr-FR")} €`
    } else if (modeFinancement === "Mixte" && apportPersonnel && dureeCreditMois) {
      const dureeCreditAnnees = Math.ceil(dureeCreditMois / 12)
      return `Investissement total (apport + crédit ${dureeCreditAnnees} an${dureeCreditAnnees > 1 ? 's' : ''} + intérêts) en année 1 : ${investissementReel.toLocaleString("fr-FR")} €`
    }
    return `Investissement total en année 1 : ${investissementReel.toLocaleString("fr-FR")} €`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Coûts cumulés sur {nbYears} ans
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>L'investissement total (incluant les intérêts) est placé en année 1 pour conserver la pertinence du seuil de rentabilité économique.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
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
                              {entry.value.toLocaleString("fr-FR")} €
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }}
              />

              {/* Ligne verticale au point de croisement */}
              {breakEvenYear && paybackYear && (
                <ReferenceLine
                  x={breakEvenYear}
                  stroke="#22c55e"
                  strokeDasharray="3 3"
                  strokeWidth={2}
                >
                  <Label
                    value={`ROI: ${paybackYear}`}
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
