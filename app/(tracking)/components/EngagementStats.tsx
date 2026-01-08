import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AnalyticsData } from "@/app/(tracking)/actions/getAnalytics"

interface EngagementStatsProps {
  data: AnalyticsData["engagement"]
}

export const EngagementStats = ({ data }: EngagementStatsProps) => {
  const stats = [
    {
      label: "Projets moyens par utilisateur",
      value: data.avgProjectsPerUser.toFixed(1),
      description: "Nombre moyen de simulations créées par utilisateur inscrit",
      icon: "📊"
    },
    {
      label: "Projets complétés par utilisateur actif",
      value: data.avgCompletedPerActiveUser.toFixed(1),
      description: "Nombre moyen de simulations terminées par utilisateur ayant au moins 1 projet",
      icon: "✅"
    },
    {
      label: "Utilisateurs actifs ce mois",
      value: data.activeUsersThisMonth.toString(),
      description: "Utilisateurs ayant créé au moins 1 simulation ce mois",
      icon: "👤"
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement utilisateur</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-4xl font-bold text-blue-700">{stat.value}</p>
              <p className="text-sm font-medium text-blue-900 mt-2">{stat.label}</p>
              <p className="text-xs text-blue-600 mt-1">{stat.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
