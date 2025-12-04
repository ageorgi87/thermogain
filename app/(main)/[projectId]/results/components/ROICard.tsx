import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPaybackPeriod } from "@/app/(main)/[projectId]/results/lib/formatPaybackPeriod"

interface ROICardProps {
  paybackPeriod: number | null
  paybackYear: number | null
  resteACharge: number
  dureeViePac: number
}

export function ROICard({ paybackPeriod, paybackYear, resteACharge, dureeViePac }: ROICardProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Retour sur investissement
        </CardTitle>
        <CardDescription>Période d'amortissement de votre projet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Investissement</p>
            <p className="text-lg font-semibold">
              {resteACharge.toLocaleString("fr-FR")} €
            </p>
          </div>

          {paybackPeriod !== null ? (
            <>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-1">ROI atteint en</p>
                <p className="text-3xl font-bold text-primary">
                  {formatPaybackPeriod(paybackPeriod)}
                </p>
              </div>

              {paybackYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Amorti en {paybackYear}
                  </p>
                </div>
              )}

              {paybackPeriod <= 10 && (
                <Badge variant="default" className="w-full justify-center">
                  Excellent retour sur investissement
                </Badge>
              )}
            </>
          ) : (
            <div className="pt-4 border-t">
              <Badge variant="outline" className="w-full justify-center">
                ROI non atteint sur {dureeViePac} ans
              </Badge>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                L'investissement ne sera pas amorti sur la durée de vie estimée de la PAC
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
