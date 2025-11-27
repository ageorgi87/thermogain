import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TrendingDown } from "lucide-react"

interface ConsumptionCardProps {
  typeChauffage: string
  typePac: string | null
  copEstime: number
  coutAnnuelActuel: number
  coutAnnuelPac: number
  economiesAnnuelles: number
  pacConsumptionKwh: number
  coutTotalActuelLifetime: number
  coutTotalPacLifetime: number
  dureeVie: number
}

export function ConsumptionCard({
  typeChauffage,
  coutAnnuelActuel,
  coutAnnuelPac,
  economiesAnnuelles,
  coutTotalActuelLifetime,
  coutTotalPacLifetime,
  dureeVie,
}: ConsumptionCardProps) {
  const totalSavings = coutTotalActuelLifetime - coutTotalPacLifetime

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-brand-teal-600" />
          Économies
        </CardTitle>
        <CardDescription>Comparaison des coûts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coûts annuels - Section principale */}
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">{typeChauffage}</span>
            <span className="text-lg font-semibold">
              {coutAnnuelActuel.toLocaleString("fr-FR")} €<span className="text-sm text-muted-foreground">/an</span>
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Avec PAC</span>
            <span className="text-lg font-semibold text-brand-teal-600">
              {coutAnnuelPac.toLocaleString("fr-FR")} €<span className="text-sm text-muted-foreground">/an</span>
            </span>
          </div>

          <Separator />

          {/* Économies annuelles - Métrique hero */}
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-2">Économies annuelles</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-brand-teal-600">
                {economiesAnnuelles.toLocaleString("fr-FR")} €
              </span>
              <span className="text-lg text-muted-foreground">/an</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Économies totales sur durée de vie */}
        <div className="bg-brand-teal-50 dark:bg-brand-teal-950 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Économies totales sur {dureeVie} ans</p>
          <div className="text-3xl font-bold text-brand-teal-600">
            {totalSavings.toLocaleString("fr-FR")} €
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
