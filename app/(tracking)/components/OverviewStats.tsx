import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsData } from "@/app/(tracking)/actions/getAnalytics";

interface OverviewStatsProps {
  data: AnalyticsData["overview"];
}

export const OverviewStats = ({ data }: OverviewStatsProps) => {
  const stats = [
    {
      label: "Total simulations",
      value: data.totalProjects.toLocaleString("fr-FR"),
      icon: "📊",
    },
    {
      label: "Simulations ce mois",
      value: data.projectsThisMonth.toLocaleString("fr-FR"),
      icon: "📈",
    },
    {
      label: "Taux de complétion",
      value: `${data.completionRate}%`,
      icon: "✅",
    },
    {
      label: "Utilisateurs inscrits",
      value: data.registeredUsers.toLocaleString("fr-FR"),
      icon: "👥",
    },
    {
      label: "Simulations anonymes",
      value: data.anonymousProjects.toLocaleString("fr-FR"),
      icon: "🔓",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-6">
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} text-white text-2xl mb-4`}
            >
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
