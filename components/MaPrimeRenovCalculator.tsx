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
import { Calculator, Check, X } from "lucide-react"
import { calculateMaPrimeRenov } from "@/lib/eligibilityMaPrimeRenov"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MaPrimeRenovCalculatorProps {
  // Données déjà connues depuis les étapes précédentes
  typePac?: string
  anneeConstruction?: number
  codePostal?: string
  // Callback pour remplir l'input
  onUseAmount: (amount: number) => void
}

export function MaPrimeRenovCalculator({
  typePac,
  anneeConstruction,
  codePostal,
  onUseAmount,
}: MaPrimeRenovCalculatorProps) {
  const [open, setOpen] = useState(false)
  const [revenuFiscal, setRevenuFiscal] = useState<string>("")
  const [nombrePersonnes, setNombrePersonnes] = useState<string>("2")
  const [residencePrincipale, setResidencePrincipale] = useState<string>("oui")
  const [result, setResult] = useState<ReturnType<typeof calculateMaPrimeRenov> | null>(null)

  const handleCalculate = () => {
    if (!revenuFiscal || !nombrePersonnes || !typePac || !codePostal || !anneeConstruction) {
      alert("Veuillez remplir tous les champs requis")
      return
    }

    const logementPlusde15ans = new Date().getFullYear() - anneeConstruction >= 15

    const calculationResult = calculateMaPrimeRenov({
      revenuFiscalReference: parseInt(revenuFiscal),
      nombrePersonnes: parseInt(nombrePersonnes),
      codePostal,
      typePac,
      logementPlusde15ans,
      residencePrincipale: residencePrincipale === "oui",
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
          Calculer mon éligibilité MaPrimeRénov'
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <DrawerTitle>Calculateur MaPrimeRénov'</DrawerTitle>
            <DrawerDescription>
              Répondez aux questions ci-dessous pour connaître votre éligibilité et le montant de votre aide.
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0 space-y-6">
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
                Le RFR se trouve en haut de la première page de votre avis d'imposition
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
                    Non (résidence secondaire ou locative)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Informations pré-remplies */}
            <Alert>
              <AlertDescription>
                <strong>Informations déjà connues :</strong>
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• Type de PAC : {typePac || "Non renseigné"}</li>
                  <li>
                    • Âge du logement : {anneeConstruction ? `${new Date().getFullYear() - anneeConstruction} ans` : "Non renseigné"}
                    {anneeConstruction && new Date().getFullYear() - anneeConstruction >= 15 ? " ✅" : " ❌ (doit avoir 15+ ans)"}
                  </li>
                  <li>• Code postal : {codePostal || "Non renseigné"}</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Bouton calculer */}
            <Button onClick={handleCalculate} className="w-full">
              Calculer mon éligibilité
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
