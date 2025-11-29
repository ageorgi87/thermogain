import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PiggyBank } from "lucide-react"

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
  economiesAnnuelles,
  coutTotalActuelLifetime,
  coutTotalPacLifetime,
  dureeVie,
}: ConsumptionCardProps) {
  const totalSavings = coutTotalActuelLifetime - coutTotalPacLifetime
  const isNegative = totalSavings < 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PiggyBank className="h-5 w-5 text-brand-teal-600" />
          Économies
        </CardTitle>
        <CardDescription className="mt-1.5">Gains annuels et sur durée de vie</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Économies annuelles - Métrique hero */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Économies annuelles moyennes (hors investissement)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-brand-teal-600">
              {economiesAnnuelles.toLocaleString("fr-FR")} €
            </span>
            <span className="text-xl text-muted-foreground">/an</span>
          </div>
        </div>

        <Separator />

        {/* Économies totales sur durée de vie */}
        <div className={`rounded-lg p-4 ${isNegative ? "bg-red-50 dark:bg-red-950" : "bg-brand-teal-50 dark:bg-brand-teal-950"}`}>
          <p className="text-sm text-muted-foreground mb-2">Économies totales sur {dureeVie} ans</p>
          <div className={`text-4xl font-bold ${isNegative ? "text-red-600" : "text-brand-teal-600"}`}>
            {totalSavings.toLocaleString("fr-FR")} €
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
