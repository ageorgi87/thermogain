import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FormField } from "@/components/form/FormField"
import { CurrentHeatingData } from "./currentHeatingSchema"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ENTRETIEN_ANNUEL_MOYEN } from "@/lib/subscription/subscriptionData"

interface ChauffageActuelFieldsProps {
  formData: Partial<CurrentHeatingData>
  errors: Partial<Record<keyof CurrentHeatingData, string>>
  onChange: (name: keyof CurrentHeatingData, value: any) => void
  defaultPrices?: {
    fioul: number
    gaz: number
    gpl: number
    bois: number
    electricite: number
  }
}

// Helper component for price label with tooltip
function PriceLabelWithTooltip({ label, price, unit }: { label: string; price?: number; unit: string }) {
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
                Ce mois-ci, le prix moyen national est de <span className="font-semibold">{price.toFixed(3)}&nbsp;{unit}</span>.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export function ChauffageActuelFields({ formData, errors, onChange, defaultPrices }: ChauffageActuelFieldsProps) {
  const typeChauffage = formData.type_chauffage
  const connaitConsommation = formData.connait_consommation

  const handleNumberChange = (name: keyof CurrentHeatingData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "") {
      onChange(name, undefined)
    } else {
      const num = parseFloat(value)
      onChange(name, isNaN(num) ? undefined : num)
    }
  }

  return (
    <div className="space-y-6">
      <FormField
        label="Type de chauffage"
        required
        error={errors.type_chauffage}
      >
        <Select
          onValueChange={(value) => onChange("type_chauffage", value as CurrentHeatingData["type_chauffage"])}
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
            onChange={handleNumberChange("age_installation")}
          />
        </FormField>

        <FormField
          label="État de l'installation"
          required
          error={errors.etat_installation}
        >
          <Select
            onValueChange={(value) => onChange("etat_installation", value as CurrentHeatingData["etat_installation"])}
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

      {/* Question: connaît sa consommation? */}
      <FormField
        label="Connaissez-vous votre consommation énergétique actuelle ?"
        required
        error={errors.connait_consommation}
      >
        <RadioGroup
          onValueChange={(value: string) => onChange("connait_consommation", value === "true")}
          value={formData.connait_consommation === undefined ? undefined : formData.connait_consommation ? "true" : "false"}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="true" />
            <label className="text-sm font-normal cursor-pointer">
              Oui, je connais ma consommation annuelle et le prix
            </label>
          </div>
          <div className="flex items-center space-x-3 space-y-0">
            <RadioGroupItem value="false" />
            <label className="text-sm font-normal cursor-pointer">
              Non, j&apos;aimerais l&apos;estimer à partir des caractéristiques de mon logement
            </label>
          </div>
        </RadioGroup>
      </FormField>

      {/* If user KNOWS consumption: show consumption fields */}
      {connaitConsommation === true && (
        <>
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
                  onChange={handleNumberChange("conso_fioul_litres")}
                />
              </FormField>

              <FormField
                label={<PriceLabelWithTooltip label="Prix (€/litre)" price={defaultPrices?.fioul} unit="€/L" />}
                required
                error={errors.prix_fioul_litre}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 1.20"
                  value={formData.prix_fioul_litre ?? ""}
                  onChange={handleNumberChange("prix_fioul_litre")}
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
                  onChange={handleNumberChange("conso_gaz_kwh")}
                />
              </FormField>

              <FormField
                label={<PriceLabelWithTooltip label="Prix (€/kWh)" price={defaultPrices?.gaz} unit="€/kWh" />}
                required
                error={errors.prix_gaz_kwh}
              >
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="ex: 0.10"
                  value={formData.prix_gaz_kwh ?? ""}
                  onChange={handleNumberChange("prix_gaz_kwh")}
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
                  onChange={handleNumberChange("abonnement_gaz")}
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
                  onChange={handleNumberChange("conso_gpl_kg")}
                />
              </FormField>

              <FormField
                label={<PriceLabelWithTooltip label="Prix (€/kg)" price={defaultPrices?.gpl} unit="€/kg" />}
                required
                error={errors.prix_gpl_kg}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 2.50"
                  value={formData.prix_gpl_kg ?? ""}
                  onChange={handleNumberChange("prix_gpl_kg")}
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
                  onChange={handleNumberChange("conso_pellets_kg")}
                />
              </FormField>

              <FormField
                label={<PriceLabelWithTooltip label="Prix (€/kg)" price={defaultPrices?.bois} unit="€/kg" />}
                required
                error={errors.prix_pellets_kg}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 0.35"
                  value={formData.prix_pellets_kg ?? ""}
                  onChange={handleNumberChange("prix_pellets_kg")}
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
                  onChange={handleNumberChange("conso_bois_steres")}
                />
              </FormField>

              <FormField
                label={<PriceLabelWithTooltip label="Prix (€/stère)" price={defaultPrices?.bois} unit="€/stère" />}
                required
                error={errors.prix_bois_stere}
              >
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 80"
                  value={formData.prix_bois_stere ?? ""}
                  onChange={handleNumberChange("prix_bois_stere")}
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
                  onChange={handleNumberChange("conso_elec_kwh")}
                />
              </FormField>

              <FormField
                label={<PriceLabelWithTooltip label="Prix (€/kWh)" price={defaultPrices?.electricite} unit="€/kWh" />}
                required
                error={errors.prix_elec_kwh}
              >
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="ex: 0.17"
                  value={formData.prix_elec_kwh ?? ""}
                  onChange={handleNumberChange("prix_elec_kwh")}
                />
              </FormField>
            </div>
          )}

          {(typeChauffage === "PAC Air/Air" || typeChauffage === "PAC Air/Eau" || typeChauffage === "PAC Eau/Eau") && (
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
                  onChange={handleNumberChange("cop_actuel")}
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
                  onChange={handleNumberChange("conso_pac_kwh")}
                />
              </FormField>

              <FormField
                label={<PriceLabelWithTooltip label="Prix électricité (€/kWh)" price={defaultPrices?.electricite} unit="€/kWh" />}
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
                  onChange={handleNumberChange("prix_elec_kwh")}
                />
              </FormField>
            </div>
          )}
        </>
      )}

      {/* If user DOESN'T know consumption: show info alert */}
      {connaitConsommation === false && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Les calculs seront basés sur une estimation à partir des caractéristiques de votre logement (surface, isolation, etc.) renseignées à l&apos;étape précédente.
          </AlertDescription>
        </Alert>
      )}

      {/* Entretien annuel - shown for all users */}
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
                    Coût moyen d'entretien pour <span className="font-semibold">{typeChauffage || "ce type de chauffage"}</span> : <span className="font-semibold">{ENTRETIEN_ANNUEL_MOYEN[typeChauffage as keyof typeof ENTRETIEN_ANNUEL_MOYEN] || 0}€/an</span>
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
          onChange={handleNumberChange("entretien_annuel")}
        />
      </FormField>
    </div>
  )
}
