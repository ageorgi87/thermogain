"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calculator, Check, X, ArrowRight, XIcon } from "lucide-react"
import { calculateMaPrimeRenov } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/maPrimeRenov/calculateMaPrimeRenov"
import { calculateCEE } from "@/app/(main)/[projectId]/(step)/(content)/aides/lib/cee/calculateCEE"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getClimateZoneFromPostalCode } from "@/app/(main)/[projectId]/lib/getClimateZoneFromPostalCode"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"

interface AidCalculatorProps {
  // Données déjà connues depuis les étapes précédentes
  typePac?: string
  anneeConstruction?: number
  codePostal?: string
  surfaceHabitable?: number
  nombreOccupants?: number
  // Callback pour remplir les inputs
  onUseAmounts: (maPrimeRenov: number, cee: number) => void
}

export function AidCalculator({
  typePac,
  anneeConstruction,
  codePostal,
  surfaceHabitable,
  nombreOccupants,
  onUseAmounts,
}: AidCalculatorProps) {
  const [open, setOpen] = useState(false)
  const [revenuFiscal, setRevenuFiscal] = useState<string>("")
  const [nombrePersonnes, setNombrePersonnes] = useState<string>(nombreOccupants?.toString() || "2")
  const [residencePrincipale, setResidencePrincipale] = useState<string>("oui")
  const [remplacementComplet, setRemplacementComplet] = useState<string>("oui")

  const [mprResult, setMprResult] = useState<ReturnType<typeof calculateMaPrimeRenov> | null>(null)
  const [ceeResult, setCeeResult] = useState<ReturnType<typeof calculateCEE> | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  const handleCalculate = () => {
    if (!revenuFiscal || !nombrePersonnes || !typePac || !codePostal || !anneeConstruction || !surfaceHabitable) {
      alert("Veuillez remplir tous les champs requis")
      return
    }

    const rfr = parseInt(revenuFiscal)
    const nbPersonnes = parseInt(nombrePersonnes)

    // Calculer MaPrimeRénov'
    const logementPlusde15ans = new Date().getFullYear() - anneeConstruction >= 15
    const mprCalculation = calculateMaPrimeRenov({
      revenuFiscalReference: rfr,
      nombrePersonnes: nbPersonnes,
      codePostal,
      typePac,
      logementPlusde15ans,
      residencePrincipale: residencePrincipale === "oui",
      remplacementComplet: remplacementComplet === "oui",
    })

    // Calculer CEE
    const logementPlusde2ans = new Date().getFullYear() - anneeConstruction >= 2
    const zoneClimatique = getClimateZoneFromPostalCode(codePostal)
    const ceeCalculation = calculateCEE({
      revenuFiscalReference: rfr,
      nombrePersonnes: nbPersonnes,
      codePostal,
      typePac,
      surfaceHabitable,
      zoneClimatique,
      logementPlusde2ans,
      remplacementComplet: remplacementComplet === "oui",
    })

    setMprResult(mprCalculation)
    setCeeResult(ceeCalculation)
    setHasCalculated(true)
  }

  const handleUseAmounts = () => {
    const mprAmount = mprResult?.montant || 0
    const ceeAmount = ceeResult?.montant || 0
    onUseAmounts(mprAmount, ceeAmount)
    setOpen(false)
  }

  const totalAides = (mprResult?.montant || 0) + (ceeResult?.montant || 0)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Calculator className="mr-2 h-4 w-4" />
          Calculer mes aides
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Calculateur d'aides financières</DrawerTitle>
            <DrawerDescription>
              Vérifiez votre éligibilité à MaPrimeRénov' et aux CEE en une seule fois. Ces aides sont cumulables.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0 space-y-6">
            {!hasCalculated ? (
              /* Formulaire */
              <div className="space-y-4">
                {/* Revenu Fiscal de Référence */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="revenu">Revenu fiscal de référence (RFR)</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[300px]">
                        <p className="text-sm">
                          Figurant sur votre avis d'imposition 2023. Le RFR détermine votre catégorie pour les deux aides (MaPrimeRénov' et CEE).
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="revenu"
                  type="number"
                  placeholder="Ex: 35000"
                  value={revenuFiscal}
                  onChange={(e) => setRevenuFiscal(e.target.value)}
                />
              </div>

              {/* Résidence principale */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Le logement est-il votre résidence principale ?</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[300px]">
                        <p className="text-sm">
                          Résidence principale = occupée au moins 8 mois par an. Requis pour MaPrimeRénov' uniquement.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <RadioGroup value={residencePrincipale} onValueChange={setResidencePrincipale}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oui" id="res-oui" />
                    <Label htmlFor="res-oui" className="font-normal cursor-pointer">
                      Oui
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non" id="res-non" />
                    <Label htmlFor="res-non" className="font-normal cursor-pointer">
                      Non
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Remplacement complet */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Souhaitez-vous remplacer complètement votre système de chauffage actuel ?</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[300px]">
                        <p className="text-sm">
                          Le remplacement complet est requis pour bénéficier des aides MaPrimeRénov' et CEE. Une installation en complément n'est pas éligible.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <RadioGroup value={remplacementComplet} onValueChange={setRemplacementComplet}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oui" id="remp-oui" />
                    <Label htmlFor="remp-oui" className="font-normal cursor-pointer">
                      Oui
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non" id="remp-non" />
                    <Label htmlFor="remp-non" className="font-normal cursor-pointer">
                      Non
                    </Label>
                  </div>
                </RadioGroup>
                {remplacementComplet === "non" && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      <strong>⚠️ Attention :</strong> Une installation en complément ne vous rendra pas éligible aux aides MaPrimeRénov&apos; et CEE.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Bouton calculer */}
              <Button onClick={handleCalculate} className="w-full" size="lg">
                <Calculator className="mr-2 h-4 w-4" />
                Calculer mes aides
              </Button>
              </div>
            ) : (
              /* Résultats */
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Résultats</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHasCalculated(false)}
                  >
                    ← Retour
                  </Button>
                </div>

                {/* MaPrimeRénov' */}
                {mprResult && (
                  <div className={`p-4 rounded-lg border-2 ${mprResult.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {mprResult.eligible ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <p className="font-semibold">MaPrimeRénov'</p>
                    </div>
                    {mprResult.eligible ? (
                      <p className="text-2xl font-bold text-green-700">
                        {mprResult.montant.toLocaleString("fr-FR")} €
                      </p>
                    ) : (
                      <p className="text-sm text-red-700">{mprResult.message.replace(/❌ Non éligible : /g, '')}</p>
                    )}
                  </div>
                )}

                {/* CEE */}
                {ceeResult && (
                  <div className={`p-4 rounded-lg border-2 ${ceeResult.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {ceeResult.eligible ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-red-600" />
                      )}
                      <p className="font-semibold">CEE</p>
                    </div>
                    {ceeResult.eligible ? (
                      <p className="text-2xl font-bold text-green-700">
                        {ceeResult.montant.toLocaleString("fr-FR")} €
                      </p>
                    ) : (
                      <p className="text-sm text-red-700">{ceeResult.message.replace(/❌ Non éligible : /g, '')}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DrawerFooter>
            {hasCalculated && (mprResult?.eligible || ceeResult?.eligible) && (
              <Button onClick={handleUseAmounts} className="w-full" size="lg">
                Compléter le formulaire avec ces aides
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline">Fermer</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
