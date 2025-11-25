import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Euro } from "lucide-react"

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
  coutPac,
  coutInstallation,
  coutTravauxAnnexes,
  coutTotal,
  maPrimeRenov,
  cee,
  autresAides,
  totalAides,
  resteACharge,
  modeFinancement,
  mensualite,
}: FinancialSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="h-5 w-5" />
          Financement
        </CardTitle>
        <CardDescription>Coûts et aides</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Coût PAC</span>
          <span className="font-medium">{coutPac.toLocaleString()} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Installation</span>
          <span className="font-medium">{coutInstallation.toLocaleString()} €</span>
        </div>
        {coutTravauxAnnexes && coutTravauxAnnexes > 0 && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Travaux annexes</span>
            <span className="font-medium">{coutTravauxAnnexes.toLocaleString()} €</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between">
          <span className="font-semibold">Coût total</span>
          <span className="font-bold">{coutTotal.toLocaleString()} €</span>
        </div>

        <Separator className="my-3" />

        {maPrimeRenov && maPrimeRenov > 0 && (
          <div className="flex justify-between text-green-600">
            <span>MaPrimeRénov'</span>
            <span className="font-medium">-{maPrimeRenov.toLocaleString()} €</span>
          </div>
        )}
        {cee && cee > 0 && (
          <div className="flex justify-between text-green-600">
            <span>CEE</span>
            <span className="font-medium">-{cee.toLocaleString()} €</span>
          </div>
        )}
        {autresAides && autresAides > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Autres aides</span>
            <span className="font-medium">-{autresAides.toLocaleString()} €</span>
          </div>
        )}
        <Separator />
        <div className="flex justify-between">
          <span className="font-semibold">Total des aides</span>
          <span className="font-bold text-green-600">-{totalAides.toLocaleString()} €</span>
        </div>

        <Separator className="my-3" />

        <div className="flex justify-between">
          <span className="text-lg font-semibold">Reste à charge</span>
          <span className="text-2xl font-bold">{resteACharge.toLocaleString()} €</span>
        </div>

        {modeFinancement && modeFinancement !== "Comptant" && mensualite && (
          <>
            <Separator className="my-3" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mensualité ({modeFinancement})</span>
              <span className="font-semibold">{mensualite.toLocaleString()} €/mois</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
