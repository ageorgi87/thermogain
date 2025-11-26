import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, Clock, PiggyBank, Zap, Percent } from "lucide-react"
import { CalculationResults } from "../../calculations"

interface KeyMetricsCardsProps {
  results: CalculationResults
  investissement: number
  dureeVie: number
}

export function KeyMetricsCards({ results, investissement, dureeVie }: KeyMetricsCardsProps) {
  // Convertir la période de retour en années et mois
  const formatPaybackPeriod = (period: number | null) => {
    if (!period) return "N/A"

    const years = Math.floor(period)
    const months = Math.round((period - years) * 12)

    if (months === 0) {
      return `${years} an${years > 1 ? 's' : ''}`
    }

    return `${years} an${years > 1 ? 's' : ''} et ${months} mois`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Durée avant rentabilité */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Durée avant rentabilité</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatPaybackPeriod(results.paybackPeriod)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {results.paybackYear ? `En ${results.paybackYear}` : "Non atteint"}
          </p>
        </CardContent>
      </Card>

      {/* Gain net */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gain net</CardTitle>
          <PiggyBank className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {results.netBenefitLifetime.toLocaleString("fr-FR")} €
          </div>
          <p className="text-xs text-muted-foreground mb-3">Sur toute la durée de vie</p>
          <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
            <div className="flex justify-between">
              <span>Coûts sans PAC:</span>
              <span className="font-medium">{results.coutTotalActuelLifetime.toLocaleString("fr-FR")} €</span>
            </div>
            <div className="flex justify-between">
              <span>Coûts avec PAC:</span>
              <span className="font-medium text-blue-600">{results.coutTotalPacLifetime.toLocaleString("fr-FR")} €</span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="font-medium">Gain net:</span>
              <span className="font-medium text-green-600">{results.netBenefitLifetime.toLocaleString("fr-FR")} €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coûts énergétiques totaux */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coûts énergétiques totaux</CardTitle>
          <Zap className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Chauffage actuel</p>
              <div className="text-lg font-bold text-red-600">
                {results.coutTotalActuelLifetime.toLocaleString("fr-FR")} €
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avec PAC</p>
              <div className="text-lg font-bold text-blue-600">
                {results.coutTotalPacLifetime.toLocaleString("fr-FR")} €
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taux de rentabilité */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de rentabilité annuel</CardTitle>
          <Percent className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {results.tauxRentabilite !== null ? `${results.tauxRentabilite}%` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground mb-3">par an (moyenne)</p>
          <div className="space-y-1 text-xs text-muted-foreground border-t pt-2">
            <div className="flex justify-between">
              <span>Investissement:</span>
              <span className="font-medium">{investissement.toLocaleString("fr-FR")} €</span>
            </div>
            <div className="flex justify-between">
              <span>Gain:</span>
              <span className="font-medium text-green-600">+{results.netBenefitLifetime.toLocaleString("fr-FR")} €</span>
            </div>
            <div className="flex justify-between">
              <span>Durée:</span>
              <span className="font-medium">{dureeVie} ans</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
