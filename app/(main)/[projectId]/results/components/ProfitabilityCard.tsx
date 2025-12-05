import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LineChart } from "lucide-react"
import { formatPaybackPeriod } from "@/app/(main)/[projectId]/results/lib/formatPaybackPeriod"

interface ProfitabilityCardProps {
  paybackPeriod: number | null
  paybackYear: number | null
  netBenefit: number
  dureeVie: number
  tauxRentabilite: number | null
}

export function ProfitabilityCard({
  paybackPeriod,
  paybackYear,
  netBenefit,
  dureeVie,
  tauxRentabilite,
}: ProfitabilityCardProps) {

  const isRentable = netBenefit > 0
  // Check if payback period exceeds lifespan
  const exceedsLifespan = paybackPeriod !== null && paybackPeriod > dureeVie

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <LineChart className={`h-5 w-5 ${exceedsLifespan || !isRentable ? "text-red-600" : "text-brand-teal-600"}`} />
          Rentabilité
        </CardTitle>
        <CardDescription className="mt-1.5">Analyse sur {dureeVie} ans</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payback Period - Métrique LEAD */}
        {paybackPeriod && paybackYear ? (
          <div className={`rounded-lg p-4 ${exceedsLifespan ? "bg-red-50 dark:bg-red-950" : "bg-brand-teal-50 dark:bg-brand-teal-950"}`}>
            <p className="text-sm text-muted-foreground mb-1">Retour sur investissement</p>
            <div className={`text-4xl font-bold mb-1 ${exceedsLifespan ? "text-red-600" : "text-brand-teal-600"}`}>
              {formatPaybackPeriod(paybackPeriod)}
            </div>
            <p className="text-sm text-muted-foreground">En {paybackYear}</p>
          </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Retour sur investissement</p>
            <div className="text-2xl font-bold text-red-600">
              Non rentabilisé
            </div>
            <p className="text-sm text-muted-foreground">Sur {dureeVie} ans</p>
          </div>
        )}

        <Separator />

        {/* Taux de rentabilité annuel */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Taux de rentabilité annuel</p>
          <div className={`text-4xl font-bold ${exceedsLifespan || !isRentable ? "text-red-600" : "text-brand-teal-600"}`}>
            {tauxRentabilite !== null ? `${tauxRentabilite}%` : "N/A"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
