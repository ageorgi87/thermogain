import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Zap, TrendingDown, TrendingUp } from "lucide-react"

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
  typePac,
  copEstime,
  coutAnnuelActuel,
  coutAnnuelPac,
  economiesAnnuelles,
  pacConsumptionKwh,
  coutTotalActuelLifetime,
  coutTotalPacLifetime,
  dureeVie,
}: ConsumptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Consommation
        </CardTitle>
        <CardDescription>Comparaison actuel vs PAC</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Chauffage actuel</span>
            <Badge>{typeChauffage}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Coût annuel actuel</span>
            <span className="text-2xl font-bold text-red-600">
              {coutAnnuelActuel.toLocaleString()} €
            </span>
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">PAC {typePac || "Air/Eau"}</span>
            <Badge variant="secondary">COP {copEstime}</Badge>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">Consommation</span>
            <span className="text-sm font-medium">{pacConsumptionKwh.toLocaleString()} kWh/an</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Coût annuel PAC</span>
            <span className="text-2xl font-bold text-green-600">
              {coutAnnuelPac.toLocaleString()} €
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-center">
          <span className="font-semibold">Économies annuelles</span>
          <div className="flex items-center gap-2">
            {economiesAnnuelles > 0 ? (
              <TrendingDown className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingUp className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-2xl font-bold ${economiesAnnuelles > 0 ? "text-green-600" : "text-red-600"}`}>
              {economiesAnnuelles.toLocaleString()} €
            </span>
          </div>
        </div>

        <Separator />

        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-2">Coûts totaux sur {dureeVie} ans</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Chauffage actuel</span>
              <span className="font-bold text-red-600">
                {coutTotalActuelLifetime.toLocaleString()} €
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Avec PAC</span>
              <span className="font-bold text-blue-600">
                {coutTotalPacLifetime.toLocaleString()} €
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
