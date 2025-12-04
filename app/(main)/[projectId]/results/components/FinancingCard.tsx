import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard } from "lucide-react"

interface FinancingCardProps {
  mensualite: number
  coutTotal: number
  montantCredit: number
  dureeMois: number
}

export function FinancingCard({
  mensualite,
  coutTotal,
  montantCredit,
  dureeMois,
}: FinancingCardProps) {
  const interets = coutTotal - montantCredit

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Financement
        </CardTitle>
        <CardDescription>Détails de votre crédit</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Mensualité</p>
            <p className="text-3xl font-bold text-primary">
              {mensualite.toLocaleString("fr-FR")} €
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Sur {dureeMois} mois ({Math.floor(dureeMois / 12)} ans)
            </p>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant emprunté</span>
              <span className="font-medium">{montantCredit.toLocaleString("fr-FR")} €</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Intérêts</span>
              <span className="font-medium">{interets.toLocaleString("fr-FR")} €</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t">
              <span>Coût total</span>
              <span>{coutTotal.toLocaleString("fr-FR")} €</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
