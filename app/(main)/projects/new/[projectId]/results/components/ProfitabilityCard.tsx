import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "lucide-react"

interface ProfitabilityCardProps {
  paybackPeriod: number | null
  paybackYear: number | null
  totalSavingsLifetime: number
  resteACharge: number
  netBenefit: number
  dureeVie: number
  currentEnergyEvolution: number
  electricityEvolution: number
  tauxRentabilite: number | null
}

export function ProfitabilityCard({
  paybackPeriod,
  paybackYear,
  totalSavingsLifetime,
  resteACharge,
  netBenefit,
  dureeVie,
  currentEnergyEvolution,
  electricityEvolution,
  tauxRentabilite,
}: ProfitabilityCardProps) {
  // Convertir la période de retour en années et mois
  const formatPaybackPeriod = (period: number | null) => {
    if (!period) return null

    const years = Math.floor(period)
    const months = Math.round((period - years) * 12)

    if (months === 0) {
      return `${years} an${years > 1 ? 's' : ''}`
    }

    return `${years} an${years > 1 ? 's' : ''} et ${months} mois`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Rentabilité
        </CardTitle>
        <CardDescription>Analyse sur {dureeVie} ans</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {paybackPeriod && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Retour sur investissement</div>
            <div className="text-3xl font-bold text-green-600">{formatPaybackPeriod(paybackPeriod)}</div>
            {paybackYear && (
              <div className="text-sm text-muted-foreground mt-1">En {paybackYear}</div>
            )}
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Économies totales sur la période</span>
          <span className="font-semibold text-green-600">
            {totalSavingsLifetime.toLocaleString()} €
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-muted-foreground">Investissement (reste à charge)</span>
          <span className="font-semibold text-red-600">
            -{resteACharge.toLocaleString()} €
          </span>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Bénéfice net</span>
          <span className={`text-2xl font-bold ${netBenefit > 0 ? "text-green-600" : "text-orange-600"}`}>
            {netBenefit > 0 ? "+" : ""}{netBenefit.toLocaleString()} €
          </span>
        </div>

        <Separator className="my-3" />

        <div>
          <div className="text-sm text-muted-foreground mb-2">Taux de rentabilité annuel (moyenne)</div>
          <div className="text-3xl font-bold text-purple-600 mb-3">
            {tauxRentabilite !== null ? `${tauxRentabilite}%` : "N/A"}
          </div>
        </div>

        <Separator className="my-3" />

        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Évolution prix énergie actuelle</span>
            <span>+{currentEnergyEvolution}% /an</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Évolution prix électricité</span>
            <span>+{electricityEvolution}% /an</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
