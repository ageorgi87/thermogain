"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, Check, X, Loader2, AlertCircle } from "lucide-react";
import { saveCriteriaAndCalculate } from "@/app/(main)/[projectId]/(step)/(content)/aides/actions/saveCriteriaAndCalculate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TypeLogement } from "@/app/(main)/[projectId]/(step)/(content)/logement/types/logement";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface SavedCriteria {
  type_logement?: string;
  surface_logement?: number;
  revenu_fiscal_reference?: number;
  residence_principale?: boolean;
  remplacement_complet?: boolean;
}

interface AidCalculatorProps {
  // ID du projet (nécessaire pour l'API)
  projectId: string;
  // Callback pour remplir les inputs
  onUseAmounts: (maPrimeRenov: number, cee: number) => void;
  // Critères sauvegardés depuis la base de données
  savedCriteria?: SavedCriteria;
}

interface AidResult {
  ma_prime_renov: number;
  cee: number;
  total_aides: number;
  eligible_ma_prime_renov: boolean;
  eligible_cee: boolean;
  raisons_ineligibilite?: string[];
}

export const AidCalculator = ({
  projectId,
  onUseAmounts,
  savedCriteria,
}: AidCalculatorProps) => {
  const [open, setOpen] = useState(false);
  const [typeLogement, setTypeLogement] = useState<string>("");
  const [surfaceLogement, setSurfaceLogement] = useState<string>("");
  const [revenuFiscal, setRevenuFiscal] = useState<string>("");
  const [residencePrincipale, setResidencePrincipale] = useState<string>("oui");
  const [remplacementComplet, setRemplacementComplet] = useState<string>("oui");

  const [result, setResult] = useState<AidResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Charger les critères sauvegardés quand le drawer s'ouvre
  useEffect(() => {
    if (open && savedCriteria) {
      if (savedCriteria.type_logement) {
        setTypeLogement(savedCriteria.type_logement);
      }
      if (savedCriteria.surface_logement !== undefined) {
        setSurfaceLogement(savedCriteria.surface_logement.toString());
      }
      if (savedCriteria.revenu_fiscal_reference !== undefined) {
        setRevenuFiscal(savedCriteria.revenu_fiscal_reference.toString());
      }
      if (savedCriteria.residence_principale !== undefined) {
        setResidencePrincipale(savedCriteria.residence_principale ? "oui" : "non");
      }
      if (savedCriteria.remplacement_complet !== undefined) {
        setRemplacementComplet(savedCriteria.remplacement_complet ? "oui" : "non");
      }
    }
  }, [open, savedCriteria]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);

    // Validation
    if (!typeLogement) {
      setError("Veuillez sélectionner le type de logement");
      setIsCalculating(false);
      return;
    }

    if (!surfaceLogement || parseFloat(surfaceLogement) <= 0) {
      setError("Veuillez saisir une surface valide");
      setIsCalculating(false);
      return;
    }

    if (!revenuFiscal || parseFloat(revenuFiscal) < 0) {
      setError("Veuillez saisir un revenu fiscal de référence valide");
      setIsCalculating(false);
      return;
    }

    try {
      const response = await saveCriteriaAndCalculate({
        projectId,
        type_logement: typeLogement,
        revenu_fiscal_reference: parseFloat(revenuFiscal),
        residence_principale: residencePrincipale === "oui",
        remplacement_complet: remplacementComplet === "oui",
      });

      if (response.success && response.data) {
        setResult(response.data);
        setHasCalculated(true);
      } else {
        setError(
          response.error ||
            "Une erreur est survenue lors du calcul des aides"
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur inconnue lors du calcul"
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleUseAmounts = () => {
    if (result) {
      onUseAmounts(result.ma_prime_renov, result.cee);
      setOpen(false);
    }
  };

  const handleReset = () => {
    setHasCalculated(false);
    setResult(null);
    setError(null);
  };

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
              Vérifiez votre éligibilité à MaPrimeRénov' et aux CEE via l'API officielle Mes Aides Réno.
              Ces aides sont cumulables.
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0 space-y-6">
            {!hasCalculated ? (
              /* Formulaire */
              <div className="space-y-4">
                {/* Type de logement */}
                <div className="space-y-2">
                  <Label htmlFor="type-logement">Type de logement</Label>
                  <Select value={typeLogement} onValueChange={setTypeLogement}>
                    <SelectTrigger id="type-logement">
                      <SelectValue placeholder="Sélectionnez le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TypeLogement.MAISON}>Maison</SelectItem>
                      <SelectItem value={TypeLogement.APPARTEMENT}>Appartement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Surface du logement */}
                <div className="space-y-2">
                  <Label htmlFor="surface">Surface habitable (m²)</Label>
                  <Input
                    id="surface"
                    type="number"
                    placeholder="Ex: 100"
                    value={surfaceLogement}
                    onChange={(e) => setSurfaceLogement(e.target.value)}
                  />
                </div>

                {/* Revenu Fiscal de Référence */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="revenu">
                      Revenu fiscal de référence (RFR)
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p className="text-sm">
                            Figurant sur votre avis d'imposition 2023. Le RFR
                            détermine votre catégorie pour les deux aides
                            (MaPrimeRénov' et CEE).
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
                    <Label>
                      Le logement est-il votre résidence principale ?
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p className="text-sm">
                            Résidence principale = occupée au moins 8 mois par
                            an. Requis pour MaPrimeRénov' uniquement.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <RadioGroup
                    value={residencePrincipale}
                    onValueChange={setResidencePrincipale}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oui" id="res-oui" />
                      <Label
                        htmlFor="res-oui"
                        className="font-normal cursor-pointer"
                      >
                        Oui
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non" id="res-non" />
                      <Label
                        htmlFor="res-non"
                        className="font-normal cursor-pointer"
                      >
                        Non
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Remplacement complet */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>
                      Souhaitez-vous remplacer complètement votre système de
                      chauffage actuel ?
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p className="text-sm">
                            Le remplacement complet est requis pour bénéficier
                            des aides MaPrimeRénov' et CEE. Une installation en
                            complément n'est pas éligible.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <RadioGroup
                    value={remplacementComplet}
                    onValueChange={setRemplacementComplet}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="oui" id="remp-oui" />
                      <Label
                        htmlFor="remp-oui"
                        className="font-normal cursor-pointer"
                      >
                        Oui
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="non" id="remp-non" />
                      <Label
                        htmlFor="remp-non"
                        className="font-normal cursor-pointer"
                      >
                        Non
                      </Label>
                    </div>
                  </RadioGroup>
                  {remplacementComplet === "non" && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertDescription>
                        <strong>⚠️ Attention :</strong> Une installation en
                        complément ne vous rendra pas éligible aux aides
                        MaPrimeRénov&apos; et CEE.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Erreur API */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Bouton calculer */}
                <Button
                  onClick={handleCalculate}
                  className="w-full"
                  size="lg"
                  disabled={isCalculating}
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calcul en cours...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculer mes aides
                    </>
                  )}
                </Button>
              </div>
            ) : (
              /* Résultats */
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Résultats</h3>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    ← Retour
                  </Button>
                </div>

                {result && (
                  <>
                    {/* MaPrimeRénov' */}
                    <div
                      className={`p-4 rounded-lg border-2 ${result.eligible_ma_prime_renov ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.eligible_ma_prime_renov ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                        <p className="font-semibold">MaPrimeRénov'</p>
                      </div>
                      {result.eligible_ma_prime_renov ? (
                        <p className="text-2xl font-bold text-green-700">
                          {result.ma_prime_renov.toLocaleString("fr-FR")} €
                        </p>
                      ) : (
                        <p className="text-sm text-red-700">
                          Non éligible à cette aide
                        </p>
                      )}
                    </div>

                    {/* CEE */}
                    <div
                      className={`p-4 rounded-lg border-2 ${result.eligible_cee ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {result.eligible_cee ? (
                          <Check className="h-5 w-5 text-green-600" />
                        ) : (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                        <p className="font-semibold">CEE (Certificats d'Économies d'Énergie)</p>
                      </div>
                      {result.eligible_cee ? (
                        <p className="text-2xl font-bold text-green-700">
                          {result.cee.toLocaleString("fr-FR")} €
                        </p>
                      ) : (
                        <p className="text-sm text-red-700">
                          Non éligible à cette aide
                        </p>
                      )}
                    </div>

                    {/* Raisons d'inéligibilité */}
                    {result.raisons_ineligibilite &&
                      result.raisons_ineligibilite.length > 0 && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Raisons d'inéligibilité :</strong>
                            <ul className="list-disc list-inside mt-2">
                              {result.raisons_ineligibilite.map((raison, index) => (
                                <li key={index}>{raison}</li>
                              ))}
                            </ul>
                          </AlertDescription>
                        </Alert>
                      )}
                  </>
                )}
              </div>
            )}
          </div>

          <DrawerFooter>
            {hasCalculated && result && (result.eligible_ma_prime_renov || result.eligible_cee) && (
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
  );
};
