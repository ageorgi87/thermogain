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
import { Calculator, Check, X, ArrowRight } from "lucide-react"
import { calculateMaPrimeRenov } from "@/lib/eligibilityMaPrimeRenov"
import { calculateCEE } from "@/lib/eligibilityCEE"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getClimateZoneFromPostalCode } from "@/lib/climateZones"
import { Separator } from "@/components/ui/separator"

interface AidCalculatorProps {
  // Données déjà connues depuis les étapes précédentes
  typePac?: string
  anneeConstruction?: number
  codePostal?: string
  surfaceHabitable?: number
  // Callback pour remplir les inputs
  onUseAmounts: (maPrimeRenov: number, cee: number) => void
}

export function AidCalculator({
  typePac,
  anneeConstruction,
  codePostal,
  surfaceHabitable,
  onUseAmounts,
}: AidCalculatorProps) {
  const [open, setOpen] = useState(false)
  const [revenuFiscal, setRevenuFiscal] = useState<string>("")
  const [nombrePersonnes, setNombrePersonnes] = useState<string>("2")
  const [residencePrincipale, setResidencePrincipale] = useState<string>("oui")

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
          Calculer mes aides (MaPrimeRénov' + CEE)
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
            {/* Informations pré-remplies */}
            <Alert>
              <AlertDescription>
                <strong>Informations déjà connues :</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Type de PAC : {typePac || "Non renseigné"}</li>
                  <li>
                    • Âge du logement : {anneeConstruction ? `${new Date().getFullYear() - anneeConstruction} ans` : "Non renseigné"}
                  </li>
                  <li>• Code postal : {codePostal || "Non renseigné"}</li>
                  <li>• Surface habitable : {surfaceHabitable ? `${surfaceHabitable} m²` : "Non renseigné"}</li>
                  <li>
                    • Zone climatique : {codePostal ? getClimateZoneFromPostalCode(codePostal) : "Non renseigné"}
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Formulaire commun */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations complémentaires nécessaires</h3>

              {/* Revenu Fiscal de Référence */}
              <div className="space-y-2">
                <Label htmlFor="revenu">
                  Revenu fiscal de référence (RFR)
                  <span className="text-sm text-muted-foreground ml-2">
                    (figurant sur votre avis d'imposition 2023)
                  </span>
                </Label>
                <Input
                  id="revenu"
                  type="number"
                  placeholder="Ex: 35000"
                  value={revenuFiscal}
                  onChange={(e) => setRevenuFiscal(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Le RFR détermine votre catégorie pour les deux aides (MPR et CEE)
                </p>
              </div>

              {/* Nombre de personnes */}
              <div className="space-y-2">
                <Label htmlFor="personnes">Nombre de personnes dans le foyer</Label>
                <Input
                  id="personnes"
                  type="number"
                  min="1"
                  max="20"
                  value={nombrePersonnes}
                  onChange={(e) => setNombrePersonnes(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Vous + les personnes à charge (indiquées sur l'avis d'imposition)
                </p>
              </div>

              {/* Résidence principale */}
              <div className="space-y-2">
                <Label>Le logement est-il votre résidence principale ?</Label>
                <RadioGroup value={residencePrincipale} onValueChange={setResidencePrincipale}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oui" id="res-oui" />
                    <Label htmlFor="res-oui" className="font-normal cursor-pointer">
                      Oui (occupée au moins 8 mois/an)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non" id="res-non" />
                    <Label htmlFor="res-non" className="font-normal cursor-pointer">
                      Non (résidence secondaire)
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Requis pour MaPrimeRénov' uniquement
                </p>
              </div>

              {/* Bouton calculer */}
              <Button onClick={handleCalculate} className="w-full" size="lg">
                <Calculator className="mr-2 h-4 w-4" />
                Calculer mes aides
              </Button>
            </div>

            {/* Résultats */}
            {hasCalculated && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Résultats</h3>

                  {/* MaPrimeRénov' */}
                  {mprResult && (
                    <Alert variant={mprResult.eligible ? "default" : "destructive"}>
                      <div className="flex items-start gap-2">
                        {mprResult.eligible ? (
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">MaPrimeRénov'</p>
                          <p className="text-sm mt-1">{mprResult.message}</p>
                          {mprResult.details && (
                            <ul className="mt-2 space-y-1 text-xs">
                              {mprResult.details.map((detail, index) => (
                                <li key={index}>• {detail}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* CEE */}
                  {ceeResult && (
                    <Alert variant={ceeResult.eligible ? "default" : "destructive"}>
                      <div className="flex items-start gap-2">
                        {ceeResult.eligible ? (
                          <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">CEE (Certificats d'Économies d'Énergie)</p>
                          <p className="text-sm mt-1">{ceeResult.message}</p>
                          {ceeResult.details && (
                            <ul className="mt-2 space-y-1 text-xs">
                              {ceeResult.details.map((detail, index) => (
                                <li key={index}>• {detail}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </Alert>
                  )}

                  {/* Total */}
                  {(mprResult?.eligible || ceeResult?.eligible) && (
                    <div className="flex justify-between items-center py-4 px-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Total des aides cumulées</p>
                        <p className="text-2xl font-bold text-green-700">
                          {totalAides.toLocaleString("fr-FR")} €
                        </p>
                      </div>
                      <ArrowRight className="h-6 w-6 text-green-600" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DrawerFooter>
            {hasCalculated && (mprResult?.eligible || ceeResult?.eligible) ? (
              <Button onClick={handleUseAmounts} className="w-full" size="lg">
                Compléter le formulaire avec ces aides
              </Button>
            ) : null}
            <DrawerClose asChild>
              <Button variant="outline">Fermer</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
