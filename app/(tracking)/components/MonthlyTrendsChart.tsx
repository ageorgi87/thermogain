"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsData } from "@/app/(tracking)/actions/getAnalytics";

interface MonthlyTrendsChartProps {
  data: AnalyticsData["monthlyData"];
}

export const MonthlyTrendsChart = ({ data }: MonthlyTrendsChartProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Évolution sur 6 mois</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            label={{ value: "Mois", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            yAxisId="left"
            label={{
              value: "Simulations créées",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Taux de complétion (%)",
              angle: 90,
              position: "insideRight",
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <Card>
                    <CardContent className="p-3">
                      <p className="font-bold">{payload[0].payload.month}</p>
                      <p className="text-sm text-blue-600">
                        Simulations créées: {payload[0].value}
                      </p>
                      <p className="text-sm text-green-600">
                        Taux complétion: {payload[1].value}%
                      </p>
                    </CardContent>
                  </Card>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="projectsCreated"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Simulations créées"
            dot={{ r: 4 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="completionRate"
            stroke="#10b981"
            strokeWidth={2}
            name="Taux de complétion (%)"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);
