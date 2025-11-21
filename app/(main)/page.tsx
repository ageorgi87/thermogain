import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Home() {
  const session = await auth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Welcome to ThermoGain</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Hello, {session?.user?.email}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>Vue d'ensemble de vos données thermiques</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Visualisez vos métriques en temps réel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rapports</CardTitle>
            <CardDescription>Analyses et statistiques détaillées</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Consultez l'historique de vos données</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paramètres</CardTitle>
            <CardDescription>Configuration de votre système</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Gérez vos préférences</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
