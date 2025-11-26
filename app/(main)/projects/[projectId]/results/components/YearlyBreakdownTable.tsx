"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { YearlyData, ProjectData } from "../../calculations"
import { calculateMensualite } from "@/lib/loanCalculations"
import { Info } from "lucide-react"

interface YearlyBreakdownTableProps {
  yearlyData: YearlyData[]
  projectData: ProjectData
  modeFinancement?: string
  montantCredit?: number
  tauxInteret?: number
  dureeCreditMois?: number
  apportPersonnel?: number
}

export function YearlyBreakdownTable({
  yearlyData,
  projectData,
  modeFinancement = "Comptant",
  montantCredit = 0,
  tauxInteret = 0,
  dureeCreditMois = 0,
  apportPersonnel = 0,
}: YearlyBreakdownTableProps) {

  // Calculer le prix de l'énergie actuelle pour chaque année
  const getCurrentEnergyPrice = (yearIndex: number): number => {
    let basePrice = 0
    let evolution = 0

    switch (projectData.type_chauffage) {
      case "Fioul":
        basePrice = projectData.prix_fioul_litre || 0
        evolution = projectData.evolution_prix_fioul || 0
        break
      case "Gaz":
        basePrice = projectData.prix_gaz_kwh || 0
        evolution = projectData.evolution_prix_gaz || 0
        break
      case "GPL":
        basePrice = projectData.prix_gpl_kg || 0
        evolution = projectData.evolution_prix_gpl || 0
        break
      case "Pellets":
      case "Bois":
        basePrice = projectData.prix_pellets_kg || projectData.prix_bois_stere || 0
        evolution = projectData.evolution_prix_bois || 0
        break
      case "Electrique":
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        basePrice = projectData.prix_elec_kwh || 0
        evolution = projectData.evolution_prix_electricite || 0
        break
    }

    return basePrice * Math.pow(1 + evolution / 100, yearIndex)
  }

  // Calculer le prix de l'électricité pour la PAC pour chaque année
  const getPacElectricityPrice = (yearIndex: number): number => {
    const basePrice = projectData.prix_elec_kwh || 0
    const evolution = projectData.evolution_prix_electricite || 0
    return basePrice * Math.pow(1 + evolution / 100, yearIndex)
  }

  // Calculer les coûts de financement pour une année donnée
  const getFinancingCosts = (yearIndex: number): { comptant: number; mensualites: number } => {
    const yearNumber = yearIndex + 1

    if (modeFinancement === "Comptant") {
      return {
        comptant: yearNumber === 1 ? projectData.reste_a_charge : 0,
        mensualites: 0
      }
    }
    else if (modeFinancement === "Crédit" && montantCredit && dureeCreditMois && tauxInteret !== undefined) {
      const dureeCreditAnnees = Math.ceil(dureeCreditMois / 12)

      if (yearNumber <= dureeCreditAnnees) {
        const mensualite = calculateMensualite(montantCredit, tauxInteret, dureeCreditMois)
        const moisRestants = dureeCreditMois - (yearNumber - 1) * 12
        const moisCetteAnnee = Math.min(12, moisRestants)

        return {
          comptant: 0,
          mensualites: mensualite * moisCetteAnnee
        }
      }
      return { comptant: 0, mensualites: 0 }
    }
    else if (modeFinancement === "Mixte" && montantCredit && dureeCreditMois && tauxInteret !== undefined && apportPersonnel) {
      const dureeCreditAnnees = Math.ceil(dureeCreditMois / 12)

      if (yearNumber === 1) {
        const mensualite = calculateMensualite(montantCredit, tauxInteret, dureeCreditMois)
        const moisCetteAnnee = Math.min(12, dureeCreditMois)

        return {
          comptant: apportPersonnel,
          mensualites: mensualite * moisCetteAnnee
        }
      } else if (yearNumber <= dureeCreditAnnees) {
        const mensualite = calculateMensualite(montantCredit, tauxInteret, dureeCreditMois)
        const moisRestants = dureeCreditMois - (yearNumber - 1) * 12
        const moisCetteAnnee = Math.min(12, moisRestants)

        return {
          comptant: 0,
          mensualites: mensualite * moisCetteAnnee
        }
      }
      return { comptant: 0, mensualites: 0 }
    }

    return {
      comptant: yearNumber === 1 ? projectData.reste_a_charge : 0,
      mensualites: 0
    }
  }

  // Obtenir l'unité de l'énergie actuelle
  const getCurrentEnergyUnit = (): string => {
    switch (projectData.type_chauffage) {
      case "Fioul":
        return "€/L"
      case "Gaz":
        return "€/kWh"
      case "GPL":
        return "€/kg"
      case "Pellets":
        return "€/kg"
      case "Bois":
        return "€/stère"
      case "Electrique":
      case "PAC Air/Air":
      case "PAC Air/Eau":
      case "PAC Eau/Eau":
        return "€/kWh"
      default:
        return "€"
    }
  }

  // Calculer les totaux
  const totals = yearlyData.reduce(
    (acc, year, index) => {
      const financingCosts = getFinancingCosts(index)
      const totalAnnuel = year.coutPac + financingCosts.comptant + financingCosts.mensualites
      return {
        coutActuelTotal: acc.coutActuelTotal + year.coutActuel,
        coutPacTotal: acc.coutPacTotal + year.coutPac,
        comptantTotal: acc.comptantTotal + financingCosts.comptant,
        mensualitesTotal: acc.mensualitesTotal + financingCosts.mensualites,
        totalAnnuelTotal: acc.totalAnnuelTotal + totalAnnuel,
      }
    },
    { coutActuelTotal: 0, coutPacTotal: 0, comptantTotal: 0, mensualitesTotal: 0, totalAnnuelTotal: 0 }
  )

  // Calculer les totaux globaux par cas
  const totalSansPac = totals.coutActuelTotal
  const totalAvecPac = totals.totalAnnuelTotal

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Détail année par année
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Les montants affichés sont arrondis à l'euro près pour faciliter la lecture. Les totaux sont calculés à partir des valeurs exactes, ce qui peut entraîner de légères différences dues aux arrondis intermédiaires.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Comparaison des coûts de chauffage actuels et avec la PAC sur {yearlyData.length} ans
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] border-r font-bold">Année</TableHead>
                <TableHead className="text-center bg-red-50 border-r font-bold" colSpan={2}>Sans changement (chauffage actuel)</TableHead>
                <TableHead className="text-center bg-blue-50 font-bold" colSpan={5}>Avec PAC</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="border-r"></TableHead>
                <TableHead className="text-right bg-red-50 font-bold">Prix énergie</TableHead>
                <TableHead className="text-right bg-red-50 border-r font-bold">Coût annuel</TableHead>
                <TableHead className="text-right bg-blue-50 font-bold">Prix élec.</TableHead>
                <TableHead className="text-right bg-blue-50 font-bold">Coût annuel</TableHead>
                <TableHead className="text-right bg-blue-50 font-bold">Payé comptant</TableHead>
                <TableHead className="text-right bg-blue-50 font-bold">Mensualités</TableHead>
                <TableHead className="text-right bg-blue-50 font-bold">Total annuel</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearlyData.map((year, index) => {
                const currentEnergyPrice = getCurrentEnergyPrice(index)
                const pacElectricityPrice = getPacElectricityPrice(index)
                const financingCosts = getFinancingCosts(index)
                // Garder la valeur précise pour le calcul du total
                const totalAnnuel = year.coutPac + financingCosts.comptant + financingCosts.mensualites

                return (
                  <TableRow key={year.year}>
                    <TableCell className="font-medium border-r">{year.year}</TableCell>

                    {/* Chauffage actuel */}
                    <TableCell className="text-right text-sm bg-red-50/50">
                      {currentEnergyPrice.toFixed(3)} {getCurrentEnergyUnit()}
                    </TableCell>
                    <TableCell className="text-right font-medium bg-red-50/50 border-r">
                      {Math.round(year.coutActuel).toLocaleString("fr-FR")} €
                    </TableCell>

                    {/* PAC */}
                    <TableCell className="text-right text-sm bg-blue-50/50">
                      {pacElectricityPrice.toFixed(3)} €/kWh
                    </TableCell>
                    <TableCell className="text-right font-medium bg-blue-50/50">
                      {Math.round(year.coutPac).toLocaleString("fr-FR")} €
                    </TableCell>
                    <TableCell className="text-right text-sm bg-blue-50/50">
                      {financingCosts.comptant > 0 ? `${Math.round(financingCosts.comptant).toLocaleString("fr-FR")} €` : "-"}
                    </TableCell>
                    <TableCell className="text-right text-sm bg-blue-50/50">
                      {financingCosts.mensualites > 0 ? `${Math.round(financingCosts.mensualites).toLocaleString("fr-FR")} €` : "-"}
                    </TableCell>
                    <TableCell className="text-right font-bold bg-blue-50/50">
                      {Math.round(totalAnnuel).toLocaleString("fr-FR")} €
                    </TableCell>
                  </TableRow>
                )
              })}

              {/* Ligne de totaux par colonne */}
              <TableRow className="border-t-2 font-bold">
                <TableCell className="border-r">TOTAL</TableCell>
                <TableCell className="bg-red-50/50"></TableCell>
                <TableCell className="text-right bg-red-50/50 border-r">
                  {Math.round(totals.coutActuelTotal).toLocaleString("fr-FR")} €
                </TableCell>
                <TableCell className="bg-blue-50/50"></TableCell>
                <TableCell className="text-right bg-blue-50/50">
                  {Math.round(totals.coutPacTotal).toLocaleString("fr-FR")} €
                </TableCell>
                <TableCell className="text-right bg-blue-50/50">
                  {totals.comptantTotal > 0 ? `${Math.round(totals.comptantTotal).toLocaleString("fr-FR")} €` : "-"}
                </TableCell>
                <TableCell className="text-right bg-blue-50/50">
                  {totals.mensualitesTotal > 0 ? `${Math.round(totals.mensualitesTotal).toLocaleString("fr-FR")} €` : "-"}
                </TableCell>
                <TableCell className="text-right bg-blue-50/50">
                  {Math.round(totals.totalAnnuelTotal).toLocaleString("fr-FR")} €
                </TableCell>
              </TableRow>

              {/* Ligne de total global par cas */}
              <TableRow className="border-t-2 font-bold bg-muted">
                <TableCell className="border-r">TOTAL GLOBAL</TableCell>
                <TableCell className="text-center bg-red-100 border-r" colSpan={2}>
                  <span className="text-lg">{Math.round(totalSansPac).toLocaleString("fr-FR")} €</span>
                </TableCell>
                <TableCell className="text-center bg-blue-100" colSpan={5}>
                  <span className="text-lg">{Math.round(totalAvecPac).toLocaleString("fr-FR")} €</span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
