import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface MonthlyCostComparisonProps {
  coutMensuelActuel: number
  coutMensuelPac: number
  economieMensuelle: number
}

export function MonthlyCostComparison({
  coutMensuelActuel,
  coutMensuelPac,
  economieMensuelle,
}: MonthlyCostComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coûts mensuels</CardTitle>
        <CardDescription>Comparaison des dépenses mensuelles</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Chauffage actuel</p>
              <p className="text-2xl font-bold text-destructive">
                {coutMensuelActuel.toLocaleString()} €
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Avec PAC</p>
              <p className="text-2xl font-bold text-primary">
                {coutMensuelPac.toLocaleString()} €
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-medium">Économie mensuelle</p>
              <p className="text-xl font-bold text-green-600">
                - {economieMensuelle.toLocaleString()} €
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soit {((economieMensuelle / coutMensuelActuel) * 100).toFixed(0)}% d'économies
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
