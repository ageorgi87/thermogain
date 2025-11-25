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
import { Calculator, Check, X } from "lucide-react"
import { calculateCEE } from "@/lib/eligibilityCEE"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getClimateZoneFromPostalCode } from "@/lib/climateZones"

interface CEECalculatorProps {
  // Données déjà connues depuis les étapes précédentes
  typePac?: string
  anneeConstruction?: number
  codePostal?: string
  surfaceHabitable?: number
  // Callback pour remplir l'input
  onUseAmount: (amount: number) => void
}

export function CEECalculator({
  typePac,
  anneeConstruction,
  codePostal,
  surfaceHabitable,
  onUseAmount,
}: CEECalculatorProps) {
  const [open, setOpen] = useState(false)
  const [revenuFiscal, setRevenuFiscal] = useState<string>("")
  const [nombrePersonnes, setNombrePersonnes] = useState<string>("2")
  const [result, setResult] = useState<ReturnType<typeof calculateCEE> | null>(null)

  const handleCalculate = () => {
    if (!revenuFiscal || !nombrePersonnes || !typePac || !codePostal || !anneeConstruction || !surfaceHabitable) {
      alert("Veuillez remplir tous les champs requis")
      return
    }

    const logementPlusde2ans = new Date().getFullYear() - anneeConstruction >= 2
    const zoneClimatique = getClimateZoneFromPostalCode(codePostal)

    const calculationResult = calculateCEE({
      revenuFiscalReference: parseInt(revenuFiscal),
      nombrePersonnes: parseInt(nombrePersonnes),
      codePostal,
      typePac,
      surfaceHabitable,
      zoneClimatique,
      logementPlusde2ans,
    })

    setResult(calculationResult)
  }

  const handleUseAmount = () => {
    if (result?.montant) {
      onUseAmount(result.montant)
      setOpen(false)
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Calculator className="mr-2 h-4 w-4" />
          Calculer mon éligibilité CEE
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Calculateur CEE (Certificats d'Économies d'Énergie)</DrawerTitle>
            <DrawerDescription>
              Les CEE sont cumulables avec MaPrimeRénov'. Vérifiez votre éligibilité et le montant estimé.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-6">
            {/* Revenu Fiscal de Référence */}
            <div className="space-y-2">
              <Label htmlFor="revenu-cee">
                Revenu fiscal de référence (RFR)
                <span className="text-sm text-muted-foreground ml-2">
                  (figurant sur votre avis d'imposition 2023)
                </span>
              </Label>
              <Input
                id="revenu-cee"
                type="number"
                placeholder="Ex: 35000"
                value={revenuFiscal}
                onChange={(e) => setRevenuFiscal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Le RFR détermine si vous êtes éligible aux bonifications "précarité énergétique"
              </p>
            </div>

            {/* Nombre de personnes */}
            <div className="space-y-2">
              <Label htmlFor="personnes-cee">Nombre de personnes dans le foyer</Label>
              <Input
                id="personnes-cee"
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

            {/* Informations pré-remplies */}
            <Alert>
              <AlertDescription>
                <strong>Informations déjà connues :</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Type de PAC : {typePac || "Non renseigné"}</li>
                  <li>
                    • Âge du logement : {anneeConstruction ? `${new Date().getFullYear() - anneeConstruction} ans` : "Non renseigné"}
                    {anneeConstruction && new Date().getFullYear() - anneeConstruction >= 2 ? " ✅" : " ❌ (doit avoir 2+ ans)"}
                  </li>
                  <li>• Surface habitable : {surfaceHabitable ? `${surfaceHabitable} m²` : "Non renseigné"}</li>
                  <li>
                    • Zone climatique : {codePostal ? getClimateZoneFromPostalCode(codePostal) : "Non renseigné"}
                  </li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Bouton calculer */}
            <Button onClick={handleCalculate} className="w-full">
              Calculer mon éligibilité CEE
            </Button>

            {/* Résultat */}
            {result && (
              <Alert variant={result.eligible ? "default" : "destructive"}>
                <div className="flex items-start gap-2">
                  {result.eligible ? (
                    <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{result.message}</p>
                    {result.details && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {result.details.map((detail, index) => (
                          <li key={index}>• {detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Alert>
            )}

            {/* Information sur les obligés CEE */}
            {result?.eligible && (
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>💡 Astuce :</strong> Comparez les offres de plusieurs fournisseurs d'énergie (EDF, Engie, TotalEnergies, etc.) pour obtenir le meilleur montant CEE. Les montants peuvent varier de 20 à 50% selon les obligés.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DrawerFooter>
            {result?.eligible && result.montant > 0 ? (
              <Button onClick={handleUseAmount} className="w-full">
                Utiliser ce montant ({result.montant.toLocaleString("fr-FR")} €)
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
