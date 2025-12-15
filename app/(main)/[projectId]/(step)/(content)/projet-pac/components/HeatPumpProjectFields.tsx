import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useEffect } from "react";
import { HeatPumpProjectData } from "@/app/(main)/[projectId]/(step)/(content)/projet-pac/actions/heatPumpProjectSchema";
import { getRecommendedHeatPumpSubscribedPower } from "../lib/getRecommendedHeatPumpSubscribedPower";
import { FormField } from "@/app/(main)/[projectId]/(step)/components/FormField";
import { PacType } from "@/types/pacType";
import { TypeChauffageActuel } from "@/types/typeChauffageActuel";
import { EmitterType } from "@/types/emitterType";

interface HeatPumpProjectFieldsProps {
  formData: Partial<HeatPumpProjectData>;
  errors: Partial<Record<keyof HeatPumpProjectData, string>>;
  onChange: (name: keyof HeatPumpProjectData, value: any) => void;
  currentElectricPower?: number; // Current electrical subscription power (kVA)
  defaultElectricityPrice?: number; // Default electricity price (€/kWh)
  currentElectricityPricePerKwh?: number; // Electricity price already set in current heating (if electric type)
  currentHeatingType?: string; // Current heating type
}

// Helper component for price label with tooltip
function PriceLabelWithTooltip({
  label,
  price,
  unit,
}: {
  label: string;
  price?: number;
  unit: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span>{label}</span>
      {price && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[300px]">
              <p className="text-sm">
                Ce mois-ci, le prix moyen national est de{" "}
                <span className="font-semibold">
                  {price.toFixed(3)}&nbsp;{unit}
                </span>
                .
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function HeatPumpProjectFields({
  formData,
  errors,
  onChange,
  currentElectricPower = 6,
  defaultElectricityPrice,
  currentElectricityPricePerKwh,
  currentHeatingType,
}: HeatPumpProjectFieldsProps) {
  const heatPumpType = formData.type_pac;
  const isWaterBased =
    heatPumpType === PacType.AIR_EAU || heatPumpType === PacType.EAU_EAU;
  const isAirToAir = heatPumpType === PacType.AIR_AIR;
  const heatPumpPowerKw = formData.puissance_pac_kw;
  const currentSubscribedPower = formData.puissance_souscrite_actuelle;

  const handleNumberChange =
    (name: keyof HeatPumpProjectData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === "") {
        onChange(name, undefined);
      } else {
        const num = parseFloat(value);
        onChange(name, isNaN(num) ? undefined : num);
      }
    };

  // If electricity price is already set in current heating AND type is electric,
  // we hide the prix_elec_kwh field
  const isElectricHeating =
    currentHeatingType === TypeChauffageActuel.ELECTRIQUE ||
    currentHeatingType === TypeChauffageActuel.PAC_AIR_AIR ||
    currentHeatingType === TypeChauffageActuel.PAC_AIR_EAU ||
    currentHeatingType === TypeChauffageActuel.PAC_EAU_EAU;
  const shouldHideElectricityPrice =
    isElectricHeating && currentElectricityPricePerKwh && currentElectricityPricePerKwh > 0;

  // Automatically set emetteurs to "Ventilo-convecteurs" for Air/Air PACs
  useEffect(() => {
    if (isAirToAir && formData.emetteurs !== EmitterType.VENTILO_CONVECTEURS) {
      onChange("emetteurs", EmitterType.VENTILO_CONVECTEURS);
    }
  }, [isAirToAir, formData.emetteurs, onChange]);

  // Auto-fill prix_elec_kwh if already provided in current heating (for electric heating types)
  useEffect(() => {
    if (
      currentElectricityPricePerKwh &&
      currentElectricityPricePerKwh > 0 &&
      formData.prix_elec_kwh === undefined
    ) {
      onChange("prix_elec_kwh", currentElectricityPricePerKwh);
    }
  }, [currentElectricityPricePerKwh, formData.prix_elec_kwh, onChange]);

  return (
    <div className="space-y-6">
      {/* Section 1: Caractéristiques de la PAC */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Caractéristiques de la PAC
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Puissance de la PAC (kW)"
            required
            error={errors.puissance_pac_kw}
          >
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="ex: 8"
              value={formData.puissance_pac_kw ?? ""}
              onChange={handleNumberChange("puissance_pac_kw")}
            />
          </FormField>

          <FormField
            label={
              <div className="flex items-center gap-2">
                <span>COP estimé</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold">
                      Indiquez le COP fabricant (fiche technique)
                    </p>
                    <p className="mt-2 text-xs">
                      Des ajustements seront automatiquement appliqués selon :
                    </p>
                    <ul className="mt-1 text-xs list-disc list-inside space-y-0.5">
                      <li>Votre zone climatique (H1/H2/H3)</li>
                      {isWaterBased && (
                        <>
                          <li>La température de départ</li>
                          <li>Le type d&apos;émetteurs</li>
                        </>
                      )}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>
            }
            required
            error={errors.cop_estime}
          >
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="ex: 3.5"
              value={formData.cop_estime ?? ""}
              onChange={handleNumberChange("cop_estime")}
            />
          </FormField>
        </div>

        <FormField
          label="Durée de vie estimée (années)"
          required
          error={errors.duree_vie_pac}
        >
          <Input
            type="number"
            min="0"
            placeholder="ex: 17"
            value={formData.duree_vie_pac ?? ""}
            onChange={handleNumberChange("duree_vie_pac")}
          />
        </FormField>
      </div>

      {/* Section 3: Configuration du système (only for water-based) */}
      {isWaterBased && (
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Configuration du système
          </h3>

          <FormField
            label="Type d'émetteurs"
            required
            error={errors.emetteurs}
          >
            <Select
              onValueChange={(value) =>
                onChange("emetteurs", value as HeatPumpProjectData["emetteurs"])
              }
              value={formData.emetteurs ?? ""}
              defaultValue=""
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type d'émetteurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EmitterType.PLANCHER_CHAUFFANT}>
                  Plancher chauffant (35°C)
                </SelectItem>
                <SelectItem value={EmitterType.VENTILO_CONVECTEURS}>
                  Ventilo-convecteurs (45°C)
                </SelectItem>
                <SelectItem value={EmitterType.RADIATEURS_BASSE_TEMP}>
                  Radiateurs basse température (45°C)
                </SelectItem>
                <SelectItem value={EmitterType.RADIATEURS_MOYENNE_TEMP}>
                  Radiateurs moyenne température (55°C)
                </SelectItem>
                <SelectItem value={EmitterType.RADIATEURS_HAUTE_TEMP}>
                  Radiateurs haute température (65°C)
                </SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      )}

      {/* Section 4: Électricité et abonnements */}
      {(!shouldHideElectricityPrice ||
        (heatPumpPowerKw && heatPumpPowerKw > 0)) && (
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Électricité et abonnements
          </h3>

          {!shouldHideElectricityPrice && (
            <FormField
              label={
                <PriceLabelWithTooltip
                  label="Prix de l'électricité (€/kWh)"
                  price={defaultElectricityPrice}
                  unit="€/kWh"
                />
              }
              required
              error={errors.prix_elec_kwh}
            >
              <Input
                type="number"
                step="0.001"
                min="0"
                placeholder="ex: 0.23"
                value={formData.prix_elec_kwh ?? ""}
                onChange={handleNumberChange("prix_elec_kwh")}
              />
            </FormField>
          )}

          {heatPumpPowerKw && heatPumpPowerKw > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={
                  <div className="flex items-center gap-2">
                    <span>Abonnement actuel (kVA)</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[300px]">
                          <p className="text-sm">
                            Puissance de votre abonnement électrique actuel
                            (visible sur votre facture).
                            <br />
                            <br />
                            <span className="font-semibold">
                              Valeur moyenne : 6 kVA
                            </span>
                            <br />
                            <br />
                            Puissances courantes : 3, 6, 9, 12, 15, 18 kVA
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                }
                required
                error={errors.puissance_souscrite_actuelle}
              >
                <Select
                  onValueChange={(value) =>
                    onChange("puissance_souscrite_actuelle", Number(value))
                  }
                  value={formData.puissance_souscrite_actuelle?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez la puissance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 kVA</SelectItem>
                    <SelectItem value="6">6 kVA (standard)</SelectItem>
                    <SelectItem value="9">9 kVA</SelectItem>
                    <SelectItem value="12">12 kVA</SelectItem>
                    <SelectItem value="15">15 kVA</SelectItem>
                    <SelectItem value="18">18 kVA</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              {(() => {
                // Use current subscribed power from form if available, otherwise default value
                const currentPower =
                  currentSubscribedPower ?? currentElectricPower;
                const recommendedPower = heatPumpPowerKw
                  ? getRecommendedHeatPumpSubscribedPower(
                      heatPumpPowerKw,
                      currentPower
                    )
                  : 9;

                return (
                  <FormField
                    label={
                      <div className="flex items-center gap-2">
                        <span>Abonnement avec PAC (kVA)</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="max-w-[300px]"
                            >
                              <p className="text-sm">
                                Puissance électrique recommandée pour alimenter
                                la PAC et vos équipements existants.
                                <br />
                                <br />
                                <span className="font-semibold">
                                  Recommandation : {recommendedPower} kVA
                                </span>
                                <br />
                                <br />
                                Calculée selon la formule : Puissance actuelle (
                                {currentPower} kVA) + Puissance PAC (
                                {heatPumpPowerKw || 0} kW)
                                <br />
                                <br />
                                Le coefficient de foisonnement est pris en
                                compte (tous vos appareils ne fonctionnent pas
                                simultanément au maximum).
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    }
                    required
                    error={errors.puissance_souscrite_pac}
                  >
                    <Select
                      onValueChange={(value) =>
                        onChange("puissance_souscrite_pac", Number(value))
                      }
                      value={formData.puissance_souscrite_pac?.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la puissance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">
                          3 kVA{recommendedPower === 3 ? " (recommandé)" : ""}
                        </SelectItem>
                        <SelectItem value="6">
                          6 kVA{recommendedPower === 6 ? " (recommandé)" : ""}
                        </SelectItem>
                        <SelectItem value="9">
                          9 kVA{recommendedPower === 9 ? " (recommandé)" : ""}
                        </SelectItem>
                        <SelectItem value="12">
                          12 kVA{recommendedPower === 12 ? " (recommandé)" : ""}
                        </SelectItem>
                        <SelectItem value="15">
                          15 kVA{recommendedPower === 15 ? " (recommandé)" : ""}
                        </SelectItem>
                        <SelectItem value="18">
                          18 kVA{recommendedPower === 18 ? " (recommandé)" : ""}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Section 5: Coûts d'exploitation */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Coûts d'exploitation
        </h3>

        <FormField
          label={
            <div className="flex items-center gap-2">
              <span>Entretien annuel (€/an)</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px]">
                    <p className="text-sm">
                      Coût annuel de l&apos;entretien de votre future PAC.
                      <br />
                      <br />
                      <span className="font-semibold">
                        Valeur moyenne : 120 €/an
                      </span>
                      <br />
                      <br />
                      <span className="text-xs">
                        ⚠️ L&apos;entretien des PAC est obligatoire tous les 2
                        ans (Décret n°2020-912). Un entretien annuel est
                        fortement recommandé pour maintenir les performances.
                      </span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          }
          required
          error={errors.entretien_pac_annuel}
        >
          <Input
            type="number"
            step="1"
            min="0"
            placeholder="ex: 120"
            value={formData.entretien_pac_annuel ?? ""}
            onChange={handleNumberChange("entretien_pac_annuel")}
          />
        </FormField>
      </div>
    </div>
  );
}
