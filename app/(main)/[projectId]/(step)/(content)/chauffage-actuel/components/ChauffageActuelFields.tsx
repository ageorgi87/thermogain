import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/app/(main)/[projectId]/(step)/components/FormField";
import { CurrentHeatingData } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/actions/currentHeatingSchema";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MAINTENANCE_COSTS_ANNUAL } from "@/config/constants";
import { PriceLabelWithTooltip } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/components/PriceLabelWithTooltip";
import type { DefaultEnergyPrices } from "@/app/(main)/[projectId]/(step)/(content)/chauffage-actuel/types/defaultEnergyPrices";
import { TypeChauffageActuel } from "@/types/typeChauffageActuel";

// Mapping pour afficher les coûts d'entretien moyens
const MAINTENANCE_DISPLAY: Record<TypeChauffageActuel, number> = {
  [TypeChauffageActuel.GAZ]: MAINTENANCE_COSTS_ANNUAL.GAZ,
  [TypeChauffageActuel.FIOUL]: MAINTENANCE_COSTS_ANNUAL.FIOUL,
  [TypeChauffageActuel.GPL]: MAINTENANCE_COSTS_ANNUAL.GPL,
  [TypeChauffageActuel.PELLETS]: MAINTENANCE_COSTS_ANNUAL.PELLETS,
  [TypeChauffageActuel.BOIS]: MAINTENANCE_COSTS_ANNUAL.BOIS,
  [TypeChauffageActuel.ELECTRIQUE]: MAINTENANCE_COSTS_ANNUAL.ELECTRIQUE,
  [TypeChauffageActuel.PAC_AIR_AIR]: MAINTENANCE_COSTS_ANNUAL.PAC,
  [TypeChauffageActuel.PAC_AIR_EAU]: MAINTENANCE_COSTS_ANNUAL.PAC,
  [TypeChauffageActuel.PAC_EAU_EAU]: MAINTENANCE_COSTS_ANNUAL.PAC,
};

interface ChauffageActuelFieldsProps {
  formData: Partial<CurrentHeatingData>;
  errors: Partial<Record<keyof CurrentHeatingData, string>>;
  onChange: (name: keyof CurrentHeatingData, value: any) => void;
  onNumberChange: (
    name: keyof CurrentHeatingData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultPrices?: DefaultEnergyPrices;
  shouldAskEcsIntegrated: boolean;
}

export const ChauffageActuelFields = ({
  formData,
  errors,
  onChange,
  onNumberChange,
  defaultPrices,
  shouldAskEcsIntegrated,
}: ChauffageActuelFieldsProps) => {
  const typeChauffage = formData.type_chauffage;

  return (
    <div className="space-y-6">
      <FormField
        label="Type de chauffage"
        required
        error={errors.type_chauffage}
      >
        <Select
          onValueChange={(value) =>
            onChange(
              "type_chauffage",
              value as CurrentHeatingData["type_chauffage"]
            )
          }
          value={formData.type_chauffage}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TypeChauffageActuel.FIOUL}>Fioul</SelectItem>
            <SelectItem value={TypeChauffageActuel.GAZ}>Gaz</SelectItem>
            <SelectItem value={TypeChauffageActuel.GPL}>GPL</SelectItem>
            <SelectItem value={TypeChauffageActuel.PELLETS}>Pellets</SelectItem>
            <SelectItem value={TypeChauffageActuel.BOIS}>Bois</SelectItem>
            <SelectItem value={TypeChauffageActuel.ELECTRIQUE}>
              Électrique
            </SelectItem>
            <SelectItem value={TypeChauffageActuel.PAC_AIR_AIR}>
              PAC Air/Air
            </SelectItem>
            <SelectItem value={TypeChauffageActuel.PAC_AIR_EAU}>
              PAC Air/Eau
            </SelectItem>
            <SelectItem value={TypeChauffageActuel.PAC_EAU_EAU}>
              PAC Eau/Eau
            </SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Âge de l'installation (années)"
          required
          error={errors.age_installation}
        >
          <Input
            type="number"
            min="0"
            placeholder="ex: 10"
            value={formData.age_installation ?? ""}
            onChange={onNumberChange("age_installation")}
          />
        </FormField>

        <FormField
          label="État de l'installation"
          required
          error={errors.etat_installation}
        >
          <Select
            onValueChange={(value) =>
              onChange(
                "etat_installation",
                value as CurrentHeatingData["etat_installation"]
              )
            }
            value={formData.etat_installation}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez l'état" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bon">Bon</SelectItem>
              <SelectItem value="Moyen">Moyen</SelectItem>
              <SelectItem value="Mauvais">Mauvais</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* ECS Integration - Only if future PAC will manage DHW */}
      {shouldAskEcsIntegrated && (
        <FormField
          label="Votre système de chauffage actuel gère-t-il l'eau chaude sanitaire ?"
          required
          error={errors.ecs_integrated}
        >
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ecs_integrated"
                checked={formData.ecs_integrated === true}
                onChange={() => onChange("ecs_integrated", true)}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Oui</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ecs_integrated"
                checked={formData.ecs_integrated === false}
                onChange={() => onChange("ecs_integrated", false)}
                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm">Non</span>
            </label>
          </div>
        </FormField>
      )}

      {/* Information message about consumption - only if ECS question was asked */}
      {shouldAskEcsIntegrated && formData.ecs_integrated !== undefined && (
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
                Consommation à renseigner
              </h3>
              {formData.ecs_integrated === true ? (
                <p className="text-sm text-muted-foreground">
                  Votre système actuel gère le chauffage ET l'eau chaude
                  sanitaire. Renseignez la <strong>consommation totale</strong>{" "}
                  (chauffage + ECS).
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Votre système actuel gère uniquement le chauffage (ECS
                  séparé). Renseignez uniquement la{" "}
                  <strong>consommation pour le chauffage</strong>.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Consumption fields - conditional based on type_chauffage */}
      {typeChauffage === TypeChauffageActuel.FIOUL && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Consommation (litres/an)"
            required
            error={errors.conso_fioul_litres}
          >
            <Input
              type="number"
              min="0"
              placeholder="ex: 2000"
              value={formData.conso_fioul_litres ?? ""}
              onChange={onNumberChange("conso_fioul_litres")}
            />
          </FormField>

          <FormField
            label={
              <PriceLabelWithTooltip
                label="Prix (€/litre)"
                price={defaultPrices?.fioul}
                unit="€/L"
              />
            }
            required
            error={errors.prix_fioul_litre}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="ex: 1.20"
              value={formData.prix_fioul_litre ?? ""}
              onChange={onNumberChange("prix_fioul_litre")}
            />
          </FormField>
        </div>
      )}

      {typeChauffage === TypeChauffageActuel.GAZ && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Consommation (kWh/an)"
            required
            error={errors.conso_gaz_kwh}
          >
            <Input
              type="number"
              min="0"
              placeholder="ex: 15000"
              value={formData.conso_gaz_kwh ?? ""}
              onChange={onNumberChange("conso_gaz_kwh")}
            />
          </FormField>

          <FormField
            label={
              <PriceLabelWithTooltip
                label="Prix (€/kWh)"
                price={defaultPrices?.gaz}
                unit="€/kWh"
              />
            }
            required
            error={errors.prix_gaz_kwh}
          >
            <Input
              type="number"
              step="0.001"
              min="0"
              placeholder="ex: 0.10"
              value={formData.prix_gaz_kwh ?? ""}
              onChange={onNumberChange("prix_gaz_kwh")}
            />
          </FormField>

          <FormField
            label="Abonnement gaz (€/an)"
            required
            error={errors.abonnement_gaz}
            className="col-span-2"
          >
            <Input
              type="number"
              min="0"
              placeholder="ex: 120"
              value={formData.abonnement_gaz ?? ""}
              onChange={onNumberChange("abonnement_gaz")}
            />
          </FormField>
        </div>
      )}

      {typeChauffage === TypeChauffageActuel.GPL && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Consommation (kg/an)"
            required
            error={errors.conso_gpl_kg}
          >
            <Input
              type="number"
              min="0"
              placeholder="ex: 1500"
              value={formData.conso_gpl_kg ?? ""}
              onChange={onNumberChange("conso_gpl_kg")}
            />
          </FormField>

          <FormField
            label={
              <PriceLabelWithTooltip
                label="Prix (€/kg)"
                price={defaultPrices?.gpl}
                unit="€/kg"
              />
            }
            required
            error={errors.prix_gpl_kg}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="ex: 2.50"
              value={formData.prix_gpl_kg ?? ""}
              onChange={onNumberChange("prix_gpl_kg")}
            />
          </FormField>
        </div>
      )}

      {typeChauffage === TypeChauffageActuel.PELLETS && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Consommation (kg/an)"
            required
            error={errors.conso_pellets_kg}
          >
            <Input
              type="number"
              min="0"
              placeholder="ex: 3000"
              value={formData.conso_pellets_kg ?? ""}
              onChange={onNumberChange("conso_pellets_kg")}
            />
          </FormField>

          <FormField
            label={
              <PriceLabelWithTooltip
                label="Prix (€/kg)"
                price={defaultPrices?.bois}
                unit="€/kg"
              />
            }
            required
            error={errors.prix_pellets_kg}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="ex: 0.35"
              value={formData.prix_pellets_kg ?? ""}
              onChange={onNumberChange("prix_pellets_kg")}
            />
          </FormField>
        </div>
      )}

      {typeChauffage === TypeChauffageActuel.BOIS && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Consommation (stères/an)"
            required
            error={errors.conso_bois_steres}
          >
            <Input
              type="number"
              min="0"
              placeholder="ex: 8"
              value={formData.conso_bois_steres ?? ""}
              onChange={onNumberChange("conso_bois_steres")}
            />
          </FormField>

          <FormField
            label={
              <PriceLabelWithTooltip
                label="Prix (€/stère)"
                price={defaultPrices?.bois}
                unit="€/stère"
              />
            }
            required
            error={errors.prix_bois_stere}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="ex: 80"
              value={formData.prix_bois_stere ?? ""}
              onChange={onNumberChange("prix_bois_stere")}
            />
          </FormField>
        </div>
      )}

      {typeChauffage === TypeChauffageActuel.ELECTRIQUE && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Consommation (kWh/an)"
            required
            error={errors.conso_elec_kwh}
          >
            <Input
              type="number"
              min="0"
              placeholder="ex: 8000"
              value={formData.conso_elec_kwh ?? ""}
              onChange={onNumberChange("conso_elec_kwh")}
            />
          </FormField>

          <FormField
            label={
              <PriceLabelWithTooltip
                label="Prix (€/kWh)"
                price={defaultPrices?.electricite}
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
              placeholder="ex: 0.17"
              value={formData.prix_elec_kwh ?? ""}
              onChange={onNumberChange("prix_elec_kwh")}
            />
          </FormField>
        </div>
      )}

      {(typeChauffage === TypeChauffageActuel.PAC_AIR_AIR ||
        typeChauffage === TypeChauffageActuel.PAC_AIR_EAU ||
        typeChauffage === TypeChauffageActuel.PAC_EAU_EAU) && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="COP actuel"
            required
            error={errors.cop_actuel}
            description="Coefficient de Performance de votre PAC actuelle"
          >
            <Input
              type="number"
              step="0.1"
              min="1"
              max="10"
              placeholder="ex: 3.5"
              value={formData.cop_actuel ?? ""}
              onChange={onNumberChange("cop_actuel")}
            />
          </FormField>

          <FormField
            label="Consommation électrique (kWh/an)"
            required
            error={errors.conso_pac_kwh}
          >
            <Input
              type="number"
              min="0"
              placeholder="ex: 4000"
              value={formData.conso_pac_kwh ?? ""}
              onChange={onNumberChange("conso_pac_kwh")}
            />
          </FormField>

          <FormField
            label={
              <PriceLabelWithTooltip
                label="Prix électricité (€/kWh)"
                price={defaultPrices?.electricite}
                unit="€/kWh"
              />
            }
            required
            error={errors.prix_elec_kwh}
            className="col-span-2"
          >
            <Input
              type="number"
              step="0.001"
              min="0"
              placeholder="ex: 0.17"
              value={formData.prix_elec_kwh ?? ""}
              onChange={onNumberChange("prix_elec_kwh")}
            />
          </FormField>
        </div>
      )}

      {/* Entretien annuel */}
      <FormField
        label={
          <div className="flex items-center gap-2">
            <span>Coût d'entretien annuel (€/an)</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[300px]">
                  <p className="text-sm">
                    Coût moyen d'entretien pour{" "}
                    <span className="font-semibold">
                      {typeChauffage || "ce type de chauffage"}
                    </span>{" "}
                    :{" "}
                    <span className="font-semibold">
                      {typeChauffage
                        ? MAINTENANCE_DISPLAY[
                            typeChauffage as TypeChauffageActuel
                          ] || 0
                        : 0}
                      €/an
                    </span>
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        }
        required
        error={errors.entretien_annuel}
      >
        <Input
          type="number"
          min="0"
          max="500"
          placeholder="ex: 150"
          value={formData.entretien_annuel ?? ""}
          onChange={onNumberChange("entretien_annuel")}
        />
      </FormField>
    </div>
  );
};
