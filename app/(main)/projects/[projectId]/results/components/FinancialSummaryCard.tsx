import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Wallet } from "lucide-react"

interface FinancialSummaryCardProps {
  coutPac: number
  coutInstallation: number
  coutTravauxAnnexes?: number
  coutTotal: number
  maPrimeRenov?: number
  cee?: number
  autresAides?: number
  totalAides: number
  resteACharge: number
  modeFinancement?: string
  mensualite?: number
}

export function FinancialSummaryCard({
  resteACharge,
  modeFinancement,
  mensualite,
}: FinancialSummaryCardProps) {
  const isCredit = modeFinancement && modeFinancement !== "Comptant" && mensualite

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-brand-orange-600" />
          Investissement
        </CardTitle>
        <CardDescription className="mt-1.5">Votre financement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reste à charge - Métrique hero */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {isCredit ? "Montant à financer" : "Montant total"}
          </p>
          <div className="text-4xl font-bold text-foreground">
            {resteACharge.toLocaleString("fr-FR")} €
          </div>
        </div>

        {/* Mensualité si crédit */}
        {isCredit && (
          <>
            <Separator />
            <div className="bg-brand-orange-50 dark:bg-brand-orange-950 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Mensualité sur {modeFinancement}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-brand-orange-600">
                  {mensualite.toLocaleString("fr-FR")} €
                </span>
                <span className="text-lg text-muted-foreground">/mois</span>
              </div>
            </div>
          </>
        )}

        {/* Mode de paiement */}
        {!isCredit && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mode de paiement</span>
              <span className="font-medium">Comptant</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
