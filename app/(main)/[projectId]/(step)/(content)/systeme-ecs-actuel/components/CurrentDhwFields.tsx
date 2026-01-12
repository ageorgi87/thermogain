"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { CurrentDhwData } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/actions/currentDhwSchema";
import { TypeEcs } from "@/types/typeEcs";
import { FormField } from "@/app/(main)/[projectId]/(step)/components/FormField";
import { getDhwEnergyType } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/lib/getDhwEnergyType";
import { estimateDhwConsumption } from "@/app/(main)/[projectId]/(step)/(content)/systeme-ecs-actuel/lib/estimateDhwConsumption";
import { ECS_ESTIMATION } from "@/config/constants";
import { EnergyType } from "@/types/energyType";

interface CurrentDhwFieldsProps {
  formData: Partial<CurrentDhwData>;
  errors: Partial<Record<keyof CurrentDhwData, string>>;
  onChange: (name: keyof CurrentDhwData, value: unknown) => void;
  onNumberChange: (
    name: keyof CurrentDhwData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  nombreOccupants: number | null;
  defaultPrices: {
    electricite: number;
    gaz: number;
  };
}

const LabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) => {
  return (
    <div className="flex items-center gap-1">
      {label}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[300px]">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const CurrentDhwFields = ({
  formData,
  errors,
  onChange,
  onNumberChange,
  nombreOccupants,
  defaultPrices,
}: CurrentDhwFieldsProps) => {
  // Déterminer le type d'énergie selon le type d'ECS
  const energyType = formData.dhwSystemType
    ? getDhwEnergyType(formData.dhwSystemType as TypeEcs)
    : EnergyType.ELECTRICITE;

  // Calculer le prix par défaut selon le type d'énergie
  const getDefaultPrice = (): number => {
    return energyType === EnergyType.ELECTRICITE
      ? defaultPrices.electricite
      : defaultPrices.gaz;
  };

  // Labels selon le type d'énergie
  const getPriceLabel = (): string => {
    return energyType === EnergyType.ELECTRICITE
      ? "Prix de l'électricité"
      : "Prix du gaz";
  };

  const getPriceUnit = (): string => {
    return "€/kWh";
  };

  // Calculer l'estimation de consommation
  const estimatedConsumption =
    nombreOccupants && nombreOccupants > 0
      ? estimateDhwConsumption(nombreOccupants)
      : null;

  return (
    <div className="space-y-6">
      {/* Section 1: Type d'ECS */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Type de système
        </h3>

        <div className="space-y-2">
          <Label htmlFor="dhwSystemType">
            Système d'eau chaude sanitaire{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.dhwSystemType || ""}
            onValueChange={(value) => onChange("dhwSystemType", value as TypeEcs)}
          >
            <SelectTrigger
              id="dhwSystemType"
              className={errors.dhwSystemType ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Sélectionnez le type d'ECS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TypeEcs.BALLON_ELECTRIQUE}>
                {TypeEcs.BALLON_ELECTRIQUE}
              </SelectItem>
              <SelectItem value={TypeEcs.THERMODYNAMIQUE}>
                {TypeEcs.THERMODYNAMIQUE}
              </SelectItem>
              <SelectItem value={TypeEcs.CHAUFFE_EAU_GAZ}>
                {TypeEcs.CHAUFFE_EAU_GAZ}
              </SelectItem>
              <SelectItem value={TypeEcs.SOLAIRE}>{TypeEcs.SOLAIRE}</SelectItem>
            </SelectContent>
          </Select>
          {errors.dhwSystemType && (
            <p className="text-sm text-red-500">{errors.dhwSystemType}</p>
          )}
        </div>
      </div>

      {/* Section 2: Consommation */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Consommation
        </h3>

        {/* Question: Connaissez-vous votre consommation ? */}
        <div className="space-y-2">
          <Label>
            Connaissez-vous votre consommation annuelle d'ECS ?{" "}
            <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={
              formData.dhwConsumptionKnown === undefined
                ? undefined
                : formData.dhwConsumptionKnown.toString()
            }
            onValueChange={(value) =>
              onChange("dhwConsumptionKnown", value === "true")
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="dhwConsumptionKnown_yes" />
              <Label htmlFor="dhwConsumptionKnown_yes" className="font-normal">
                Oui, je connais ma consommation
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="dhwConsumptionKnown_no" />
              <Label htmlFor="dhwConsumptionKnown_no" className="font-normal">
                Non, estimez-la pour moi
              </Label>
            </div>
          </RadioGroup>
          {errors.dhwConsumptionKnown && (
            <p className="text-sm text-red-500">{errors.dhwConsumptionKnown}</p>
          )}
        </div>

        {/* Champ consommation (si connue) */}
        {formData.dhwConsumptionKnown === true && (
          <FormField
            label={
              <LabelWithTooltip
                label="Consommation annuelle d'ECS"
                tooltip="La consommation annuelle d'eau chaude sanitaire de votre installation actuelle"
              />
            }
            error={errors.dhwConsumptionKwh}
            required
          >
            <div className="relative">
              <Input
                id="dhwConsumptionKwh"
                type="number"
                min="0"
                max="50000"
                step="1"
                placeholder="ex: 2400"
                value={formData.dhwConsumptionKwh ?? ""}
                onChange={onNumberChange("dhwConsumptionKwh")}
                className={errors.dhwConsumptionKwh ? "border-red-500" : ""}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                kWh/an
              </span>
            </div>
          </FormField>
        )}

        {/* Message d'estimation (si non connue) */}
        {formData.dhwConsumptionKnown === false && estimatedConsumption && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex gap-3">
              <div className="shrink-0">
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground mb-1">
                  Consommation estimée
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Basé sur {nombreOccupants} occupant
                  {nombreOccupants && nombreOccupants > 1 ? "s" : ""}, nous
                  estimons votre consommation à{" "}
                  <strong>{estimatedConsumption} kWh/an</strong>.
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <HelpCircle className="h-3 w-3" />
                        Comment est calculée cette estimation ?
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">
                        Estimation basée sur{" "}
                        {ECS_ESTIMATION.KWH_PER_PERSON_PER_YEAR} kWh/personne/an
                        (source : ADEME). Cette valeur peut varier selon vos
                        habitudes de consommation d'eau chaude.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Coûts */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Coûts
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Prix de l'énergie */}
          <FormField
            label={
              <LabelWithTooltip
                label={getPriceLabel()}
                tooltip={`Prix moyen conseillé : ${getDefaultPrice().toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ${getPriceUnit()} (source : données gouvernementales, mise à jour mensuelle)`}
              />
            }
            error={errors.dhwEnergyPricePerKwh}
            required
          >
            <div className="relative">
              <Input
                id="dhwEnergyPricePerKwh"
                type="number"
                min="0"
                max="2"
                step="0.001"
                placeholder={getDefaultPrice() > 0 ? `ex: ${getDefaultPrice().toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}` : "ex: 0,252"}
                value={formData.dhwEnergyPricePerKwh ?? ""}
                onChange={onNumberChange("dhwEnergyPricePerKwh")}
                className={errors.dhwEnergyPricePerKwh ? "border-red-500" : ""}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {getPriceUnit()}
              </span>
            </div>
          </FormField>

          {/* Entretien annuel */}
          <FormField
            label={
              <LabelWithTooltip
                label="Entretien annuel"
                tooltip="Coût de l'entretien annuel de votre système ECS actuel (€/an)"
              />
            }
            error={errors.dhwAnnualMaintenance}
            required
          >
            <div className="relative">
              <Input
                id="dhwAnnualMaintenance"
                type="number"
                min="0"
                max="500"
                step="1"
                placeholder="ex: 0"
                value={formData.dhwAnnualMaintenance ?? ""}
                onChange={onNumberChange("dhwAnnualMaintenance")}
                className={errors.dhwAnnualMaintenance ? "border-red-500" : ""}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                €/an
              </span>
            </div>
          </FormField>
        </div>
      </div>
    </div>
  );
};
