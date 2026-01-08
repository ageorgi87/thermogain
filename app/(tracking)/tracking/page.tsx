import type { Metadata } from "next"
import { getAnalytics } from "@/app/(tracking)/actions/getAnalytics"
import { OverviewStats } from "@/app/(tracking)/components/OverviewStats"
import { AbandonmentFunnel } from "@/app/(tracking)/components/AbandonmentFunnel"
import { EngagementStats } from "@/app/(tracking)/components/EngagementStats"
import { MonthlyTrendsChart } from "@/app/(tracking)/components/MonthlyTrendsChart"
import { TopUsersTable } from "@/app/(tracking)/components/TopUsersTable"

/**
 * Métadonnées de la page
 * - noindex: empêche l'indexation par les moteurs de recherche
 * - nofollow: empêche le suivi des liens sur cette page
 */
export const metadata: Metadata = {
  title: "Analytics - ThermoGain",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false
    }
  }
}

/**
 * Page de tracking des analytics ThermoGain
 * Protégée par HTTP Basic Authentication (voir middleware.ts)
 * Credentials: bayroyd / Julierie1!
 * Non indexée par les moteurs de recherche
 */
export default async function TrackingPage() {
  // L'authentification est gérée par le middleware
  // Si on arrive ici, l'utilisateur est authentifié
  const analyticsResult = await getAnalytics()

  // Si erreur lors de la récupération des données
  if ("error" in analyticsResult) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{analyticsResult.error}</p>
        </div>
      </div>
    )
  }

  const analytics = analyticsResult

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold">ThermoGain Analytics</h1>
          <p className="text-blue-100 mt-2">
            Dashboard de suivi des performances et engagement utilisateur
          </p>
          <p className="text-xs text-blue-200 mt-4">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* Vue d'ensemble */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Vue d'ensemble</h2>
          <OverviewStats data={analytics.overview} />
        </section>

        {/* Engagement utilisateur */}
        <section>
          <EngagementStats data={analytics.engagement} />
        </section>

        {/* Évolution temporelle */}
        <section>
          <MonthlyTrendsChart data={analytics.monthlyData} />
        </section>

        {/* Funnel d'abandon */}
        <section>
          <AbandonmentFunnel data={analytics.funnelData} />
        </section>

        {/* Top utilisateurs */}
        <section>
          <TopUsersTable data={analytics.topUsers} />
        </section>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4">
          <p>ThermoGain Analytics Dashboard © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
