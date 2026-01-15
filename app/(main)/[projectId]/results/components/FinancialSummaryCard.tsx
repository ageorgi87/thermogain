import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Wallet } from "lucide-react";
import { FinancingMode } from "@/types/financingMode";

interface FinancialSummaryCardProps {
  resteACharge: number;
  modeFinancement?: string;
  mensualite?: number;
  dureeCreditMois?: number;
  apportPersonnel?: number;
  coutInstallation: number;
  totalAides: number;
  interetsCredit?: number;
  investissementReel: number;
}

export function FinancialSummaryCard({
  resteACharge,
  modeFinancement,
  mensualite,
  dureeCreditMois,
  apportPersonnel,
  coutInstallation,
  totalAides,
  interetsCredit,
  investissementReel,
}: FinancialSummaryCardProps) {
  const isCredit =
    modeFinancement && modeFinancement !== FinancingMode.COMPTANT && mensualite;
  const isMixte =
    modeFinancement === FinancingMode.MIXTE && mensualite && apportPersonnel;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-brand-orange-600" />
          Investissement
        </CardTitle>
        <CardDescription className="mt-1.5">
          Détail de votre investissement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Détail de l'investissement */}
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Coût total</span>
            <span className="font-medium">
              {coutInstallation.toLocaleString("fr-FR")} €
            </span>
          </div>

          <div className="flex items-center justify-between text-green-600 dark:text-green-400">
            <span>Aides déduites</span>
            <span className="font-medium">
              - {totalAides.toLocaleString("fr-FR")} €
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between font-medium">
            <span>Reste à charge</span>
            <span>{resteACharge.toLocaleString("fr-FR")} €</span>
          </div>

          {interetsCredit && interetsCredit > 0 && (
            <>
              <div className="flex items-center justify-between text-brand-orange-600">
                <span>Intérêts du crédit</span>
                <span className="font-medium">
                  + {interetsCredit.toLocaleString("fr-FR")} €
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between font-semibold text-base">
                <span>Investissement réel</span>
                <span className="text-brand-orange-600">
                  {investissementReel.toLocaleString("fr-FR")} €
                </span>
              </div>
            </>
          )}
        </div>

        {/* Apport personnel si mixte */}
        {isMixte && (
          <>
            <Separator />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Apport personnel</span>
              <span className="font-medium">
                {apportPersonnel!.toLocaleString("fr-FR")} €
              </span>
            </div>
          </>
        )}

        {/* Mensualité si crédit ou mixte */}
        {isCredit && (
          <>
            <Separator />
            <div className="bg-brand-orange-50 dark:bg-brand-orange-950 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">
                {isMixte ? "Mensualité crédit" : "Mensualité sur Crédit"}
              </p>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-brand-orange-600">
                  {mensualite.toLocaleString("fr-FR")} €
                </span>
                <span className="text-lg text-muted-foreground">/mois</span>
              </div>
              {dureeCreditMois && (
                <div className="text-sm font-medium text-foreground">
                  sur {dureeCreditMois} mois ({Math.round(dureeCreditMois / 12)}{" "}
                  an{Math.round(dureeCreditMois / 12) > 1 ? "s" : ""})
                </div>
              )}
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
  );
}
