"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Calculator, Info } from "lucide-react"
import { YearlyData, ProjectData } from "../../calculations"

interface YearlyBreakdownTableProps {
  yearlyData: YearlyData[]
  projectData: ProjectData
  investissementReel: number
  modeFinancement?: string
  montantCredit?: number
  tauxInteret?: number
  dureeCreditMois?: number
  apportPersonnel?: number
}

export function YearlyBreakdownTable({
  yearlyData,
  projectData,
  investissementReel,
  modeFinancement = "Comptant",
  montantCredit = 0,
  tauxInteret = 0,
  dureeCreditMois = 0,
  apportPersonnel = 0,
}: YearlyBreakdownTableProps) {
  // Calcul de la mensualité si crédit
  const mensualiteCredit =
    modeFinancement && modeFinancement !== "Comptant" && montantCredit && tauxInteret && dureeCreditMois
      ? (montantCredit * (tauxInteret / 100 / 12) * Math.pow(1 + tauxInteret / 100 / 12, dureeCreditMois)) /
        (Math.pow(1 + tauxInteret / 100 / 12, dureeCreditMois) - 1)
      : 0

  const isCredit = modeFinancement && modeFinancement !== "Comptant" && mensualiteCredit > 0

  // Calcul des positions cumulées pour chaque année
  type YearlyDataWithCumulative = YearlyData & {
    positionCumulee: number
  }

  const yearlyDataWithCumulative: YearlyDataWithCumulative[] = []

  yearlyData.forEach((yearData, index) => {
    // Position cumulée = somme des économies - investissement réel (année 1)
    // investissementReel inclut déjà le coût total du crédit si applicable
    const investissement = index === 0 ? investissementReel : 0
    const cumulePrecedent = index > 0 ? yearlyDataWithCumulative[index - 1].positionCumulee : 0
    const positionCumulee = cumulePrecedent + yearData.economie - investissement

    yearlyDataWithCumulative.push({
      ...yearData,
      positionCumulee,
    })
  })

  // Trouver l'année de retour sur investissement (si elle existe)
  const paybackYearIndex = yearlyDataWithCumulative.findIndex((year) => year.positionCumulee >= 0)

  // Calcul des totaux
  const totalCoutActuel = yearlyData.reduce((sum, year) => sum + year.coutActuel, 0)
  const totalCoutPac = yearlyData.reduce((sum, year) => sum + year.coutPac, 0)
  const totalEconomies = yearlyDataWithCumulative.reduce((sum, year) => sum + year.economie, 0)
  const positionFinale = yearlyDataWithCumulative[yearlyDataWithCumulative.length - 1].positionCumulee

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calculator className="h-5 w-5 text-brand-teal-600" />
              Détail année par année
            </CardTitle>
            <CardDescription className="mt-1.5">
              Évolution des coûts et économies sur {projectData.duree_vie_pac} ans
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help mt-1" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-semibold">Évolution des prix de l'énergie</p>
                  <p className="text-sm">
                    Les projections utilisent un modèle de <strong>retour à la moyenne</strong> qui tient compte :
                  </p>
                  <ul className="text-sm list-disc pl-4 space-y-1">
                    <li>Des hausses récentes liées aux crises énergétiques</li>
                    <li>D'un retour progressif vers des taux d'évolution historiques sur 5 ans</li>
                  </ul>
                  <p className="text-sm text-muted-foreground">
                    Source : Ministère de la Transition Écologique - 18 à 42 ans de données historiques selon l'énergie
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-center font-semibold w-20 sticky left-0 bg-muted/30">
                  Année
                </TableHead>
                <TableHead className="text-right font-semibold min-w-[140px]">
                  Coût actuel
                </TableHead>
                <TableHead className="text-right font-semibold min-w-[140px]">
                  Coût PAC
                </TableHead>
                <TableHead className="text-right font-semibold min-w-[140px]">
                  Économies
                </TableHead>
                <TableHead className="text-right font-semibold min-w-[140px]">
                  Position cumulée
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearlyDataWithCumulative.map((year, index) => {
                const isPaybackYear = index === paybackYearIndex
                const isPositive = year.positionCumulee >= 0

                return (
                  <TableRow
                    key={year.year}
                    className={`
                      ${index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                      ${isPaybackYear ? "border-l-4 border-l-brand-teal-500" : ""}
                      hover:bg-muted/40 transition-colors
                    `}
                  >
                    {/* Année */}
                    <TableCell className="text-center font-medium sticky left-0 bg-inherit">
                      {year.year}
                      {isPaybackYear && (
                        <span className="ml-2 text-xs text-brand-teal-600 font-semibold">ROI</span>
                      )}
                    </TableCell>

                    {/* Coût actuel */}
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {year.coutActuel.toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} €
                    </TableCell>

                    {/* Coût PAC (énergie annuelle) */}
                    <TableCell className="text-right tabular-nums bg-brand-teal-50/30 dark:bg-brand-teal-950/30">
                      {year.coutPac.toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} €
                    </TableCell>

                    {/* Économies */}
                    <TableCell className="text-right tabular-nums font-medium text-brand-teal-600">
                      {year.economie > 0 ? "+" : ""}
                      {year.economie.toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} €
                    </TableCell>

                    {/* Position cumulée */}
                    <TableCell
                      className={`text-right tabular-nums font-semibold ${
                        isPositive
                          ? "text-brand-teal-600 bg-brand-teal-50/50 dark:bg-brand-teal-950/50"
                          : "text-orange-600 bg-orange-50/50 dark:bg-orange-950/50"
                      }`}
                    >
                      {year.positionCumulee > 0 ? "+" : ""}
                      {year.positionCumulee.toLocaleString("fr-FR", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} €
                    </TableCell>
                  </TableRow>
                )
              })}

              {/* Ligne de totaux */}
              <TableRow className="bg-muted/50 font-bold border-t-2 border-border hover:bg-muted/50">
                <TableCell className="text-center sticky left-0 bg-muted/50">Total</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {totalCoutActuel.toLocaleString("fr-FR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })} €
                </TableCell>
                <TableCell className="text-right tabular-nums bg-brand-teal-50/30 dark:bg-brand-teal-950/30">
                  {(totalCoutPac + investissementReel).toLocaleString("fr-FR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })} €
                </TableCell>
                <TableCell className="text-right tabular-nums text-brand-teal-600">
                  +{totalEconomies.toLocaleString("fr-FR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })} €
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${
                    positionFinale >= 0
                      ? "text-brand-teal-600 bg-brand-teal-100 dark:bg-brand-teal-900"
                      : "text-orange-600 bg-orange-100 dark:bg-orange-900"
                  }`}
                >
                  {positionFinale > 0 ? "+" : ""}
                  {positionFinale.toLocaleString("fr-FR", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })} €
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Légende */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-brand-teal-50 dark:bg-brand-teal-950 border border-brand-teal-200 dark:border-brand-teal-800"></div>
            <span>Coûts avec PAC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-brand-teal-100 dark:bg-brand-teal-900 border border-brand-teal-300 dark:border-brand-teal-700"></div>
            <span>Position positive (bénéfices)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700"></div>
            <span>Position négative (investissement non amorti)</span>
          </div>
          {paybackYearIndex >= 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-background border-l-4 border-l-brand-teal-500"></div>
              <span>Année de retour sur investissement (ROI)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
