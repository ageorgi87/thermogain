"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { YearlyData } from "../../calculations"

interface CostEvolutionChartProps {
  yearlyData: YearlyData[]
}

export function CostEvolutionChart({ yearlyData }: CostEvolutionChartProps) {
  // Utiliser toutes les années disponibles (durée de vie de la PAC)
  const chartData = yearlyData
  const nbYears = chartData.length

  const chartConfig = {
    coutActuel: {
      label: "Coût actuel",
      color: "hsl(var(--destructive))",
    },
    coutPac: {
      label: "Coût PAC",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Évolution des coûts annuels sur {nbYears} ans</CardTitle>
        <CardDescription>
          Comparaison année par année entre votre chauffage actuel et la PAC
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tickFormatter={(value) => `${value}`}
              />
              <YAxis
                tickFormatter={(value) => `${value}€`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="coutActuel"
                stroke="var(--color-coutActuel)"
                strokeWidth={2}
                name="Chauffage actuel"
              />
              <Line
                type="monotone"
                dataKey="coutPac"
                stroke="var(--color-coutPac)"
                strokeWidth={2}
                name="Avec PAC"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
