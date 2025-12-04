"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import type { YearlyData } from "@/types/yearlyData"

interface SavingsChartProps {
  yearlyData: YearlyData[]
}

export function SavingsChart({ yearlyData }: SavingsChartProps) {
  // Utiliser toutes les années disponibles (durée de vie de la PAC)
  const chartData = yearlyData
  const nbYears = chartData.length

  // Déterminer si le bilan final est positif ou négatif
  const finalBalance = chartData[chartData.length - 1]?.economiesCumulees || 0
  const isPositive = finalBalance >= 0

  const chartConfig = {
    economiesCumulees: {
      label: isPositive ? "Économies cumulées" : "Surcoût cumulé",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isPositive ? "Économies cumulées" : "Surcoût cumulé"} sur {nbYears} ans
        </CardTitle>
        <CardDescription>
          {isPositive
            ? "Progression des économies réalisées avec la PAC"
            : "Évolution du surcoût par rapport au système actuel"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tickFormatter={(value) => `${value}`}
              />
              <YAxis
                tickFormatter={(value) => `${value}€`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="economiesCumulees"
                stroke="var(--color-economiesCumulees)"
                fill="var(--color-economiesCumulees)"
                fillOpacity={0.3}
                strokeWidth={2}
                name={isPositive ? "Économies cumulées" : "Surcoût cumulé"}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
