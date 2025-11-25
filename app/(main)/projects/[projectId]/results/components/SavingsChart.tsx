"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { YearlyData } from "../../calculations"

interface SavingsChartProps {
  yearlyData: YearlyData[]
}

export function SavingsChart({ yearlyData }: SavingsChartProps) {
  // Utiliser toutes les années disponibles (durée de vie de la PAC)
  const chartData = yearlyData
  const nbYears = chartData.length

  const chartConfig = {
    economiesCumulees: {
      label: "Économies cumulées",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Économies cumulées sur {nbYears} ans</CardTitle>
        <CardDescription>
          Progression des économies réalisées avec la PAC
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
                name="Économies cumulées"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
