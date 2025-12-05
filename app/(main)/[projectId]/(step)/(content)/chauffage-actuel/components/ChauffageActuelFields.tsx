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

// Mapping pour afficher les coûts d'entretien moyens
const MAINTENANCE_DISPLAY: Record<string, number> = {
  Gaz: MAINTENANCE_COSTS_ANNUAL.GAZ,
  Fioul: MAINTENANCE_COSTS_ANNUAL.FIOUL,
  GPL: MAINTENANCE_COSTS_ANNUAL.GPL,
  Pellets: MAINTENANCE_COSTS_ANNUAL.PELLETS,
  Bois: MAINTENANCE_COSTS_ANNUAL.BOIS,
  Électricité: MAINTENANCE_COSTS_ANNUAL.ELECTRIQUE,
  Electrique: MAINTENANCE_COSTS_ANNUAL.ELECTRIQUE,
  "PAC Air/Air": MAINTENANCE_COSTS_ANNUAL.PAC,
  "PAC Air/Eau": MAINTENANCE_COSTS_ANNUAL.PAC,
  "PAC Eau/Eau": MAINTENANCE_COSTS_ANNUAL.PAC,
};

interface ChauffageActuelFieldsProps {
  formData: Partial<CurrentHeatingData>;
  errors: Partial<Record<keyof CurrentHeatingData, string>>;
  onChange: (name: keyof CurrentHeatingData, value: any) => void;
  onNumberChange: (
    name: keyof CurrentHeatingData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  defaultPrices?: DefaultEnergyPrices;
}

export const ChauffageActuelFields = ({
  formData,
  errors,
  onChange,
  onNumberChange,
  defaultPrices,
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
            <SelectItem value="Fioul">Fioul</SelectItem>
            <SelectItem value="Gaz">Gaz</SelectItem>
            <SelectItem value="GPL">GPL</SelectItem>
            <SelectItem value="Pellets">Pellets</SelectItem>
            <SelectItem value="Bois">Bois</SelectItem>
            <SelectItem value="Electrique">Électrique</SelectItem>
            <SelectItem value="PAC Air/Air">PAC Air/Air</SelectItem>
            <SelectItem value="PAC Air/Eau">PAC Air/Eau</SelectItem>
            <SelectItem value="PAC Eau/Eau">PAC Eau/Eau</SelectItem>
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

      {/* Consumption fields - conditional based on type_chauffage */}
      {typeChauffage === "Fioul" && (
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

          {typeChauffage === "Gaz" && (
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

          {typeChauffage === "GPL" && (
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

          {typeChauffage === "Pellets" && (
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

          {typeChauffage === "Bois" && (
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

          {typeChauffage === "Electrique" && (
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

          {(typeChauffage === "PAC Air/Air" ||
            typeChauffage === "PAC Air/Eau" ||
            typeChauffage === "PAC Eau/Eau") && (
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
                      {MAINTENANCE_DISPLAY[typeChauffage || ""] || 0}
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
