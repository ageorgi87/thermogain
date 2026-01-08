"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AnalyticsData } from "@/app/(tracking)/actions/getAnalytics"

interface AbandonmentFunnelProps {
  data: AnalyticsData["funnelData"]
}

export const AbandonmentFunnel = ({ data }: AbandonmentFunnelProps) => {
  // Trouver l'étape avec le plus grand taux d'abandon
  const maxDropoff = Math.max(...data.map(d => d.dropoffRate))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel de conversion par étape</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tableau des statistiques */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Étape</TableHead>
                <TableHead className="text-right">Utilisateurs</TableHead>
                <TableHead className="text-right">Taux d'abandon</TableHead>
                <TableHead className="text-right">Conversion depuis début</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((step) => (
                <TableRow
                  key={step.step}
                  className={step.dropoffRate === maxDropoff && step.dropoffRate > 0 ? 'bg-red-50' : ''}
                >
                  <TableCell className="font-medium">
                    {step.step}. {step.stepName}
                    {step.dropoffRate === maxDropoff && step.dropoffRate > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        Plus d'abandons
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{step.count.toLocaleString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    {step.dropoffRate > 0 && (
                      <span className={`${step.dropoffRate > 30 ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                        -{step.dropoffRate.toFixed(1)}%
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {step.conversionFromStart.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Graphique de conversion */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="step"
              label={{ value: 'Étapes', position: 'insideBottom', offset: -5 }}
            />
            <YAxis label={{ value: '% Conversion', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <Card>
                      <CardContent className="p-3">
                        <p className="font-bold">{data.stepName}</p>
                        <p className="text-sm text-gray-600">{data.count} utilisateurs</p>
                        <p className="text-sm text-green-600">{data.conversionFromStart.toFixed(1)}% depuis le début</p>
                        {data.dropoffRate > 0 && (
                          <p className="text-sm text-red-600">-{data.dropoffRate.toFixed(1)}% d'abandon</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Bar dataKey="conversionFromStart" name="Taux de conversion (%)" fill="#10b981">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.dropoffRate === maxDropoff && entry.dropoffRate > 0 ? '#ef4444' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
