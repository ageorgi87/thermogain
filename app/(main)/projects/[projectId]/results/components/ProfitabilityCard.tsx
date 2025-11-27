import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LineChart } from "lucide-react"

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
  netBenefit,
  dureeVie,
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

  const isRentable = netBenefit > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LineChart className="h-5 w-5 text-brand-teal-600" />
          Rentabilité
        </CardTitle>
        <CardDescription className="mt-1.5">Analyse sur {dureeVie} ans</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payback Period - Métrique LEAD */}
        {paybackPeriod && paybackYear ? (
          <div className="bg-brand-teal-50 dark:bg-brand-teal-950 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Retour sur investissement</p>
            <div className="text-4xl font-bold text-brand-teal-600 mb-1">
              {formatPaybackPeriod(paybackPeriod)}
            </div>
            <p className="text-sm text-muted-foreground">En {paybackYear}</p>
          </div>
        ) : (
          <div className="bg-orange-50 dark:bg-orange-950 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Retour sur investissement</p>
            <div className="text-2xl font-bold text-orange-600">
              Non rentabilisé
            </div>
            <p className="text-sm text-muted-foreground">Sur {dureeVie} ans</p>
          </div>
        )}

        <Separator />

        {/* Taux de rentabilité annuel */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Taux de rentabilité annuel</p>
          <div className="text-4xl font-bold text-brand-teal-600">
            {tauxRentabilite !== null ? `${tauxRentabilite}%` : "N/A"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
