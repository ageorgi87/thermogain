import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { UseFormReturn } from "react-hook-form"
import { CurrentHeatingData } from "./currentHeatingSchema"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ChauffageActuelFieldsProps {
  form: UseFormReturn<CurrentHeatingData>
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
                Le prix moyen national est de <span className="font-semibold">{price.toFixed(2)} {unit}</span>,
                il a été mis à jour ce mois-ci.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

export function ChauffageActuelFields({ form, defaultPrices }: ChauffageActuelFieldsProps) {
  const watchTypeChauffage = form.watch("type_chauffage")
  const watchConnaitConsommation = form.watch("connait_consommation")

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="type_chauffage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de chauffage</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
              </FormControl>
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
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="age_installation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Âge de l&apos;installation (années)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="etat_installation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>État de l&apos;installation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bon">Bon</SelectItem>
                  <SelectItem value="Moyen">Moyen</SelectItem>
                  <SelectItem value="Mauvais">Mauvais</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="code_postal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code postal</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: 75001, 67000, 13001"
                maxLength={5}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Permet d&apos;ajuster les calculs selon votre zone climatique
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Question: connaît sa consommation? */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <FormField
          control={form.control}
          name="connait_consommation"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="text-base font-semibold">
                Connaissez-vous votre consommation énergétique actuelle ?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value: string) => field.onChange(value === "true")}
                  value={field.value === undefined ? undefined : field.value ? "true" : "false"}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="true" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Oui, je connais ma consommation annuelle et le prix
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="false" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Non, j&apos;aimerais l&apos;estimer à partir des caractéristiques de mon logement
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* If user KNOWS consumption: show consumption fields */}
      {watchConnaitConsommation === true && (
        <>
          {/* Consumption fields - conditional based on type_chauffage */}
          {watchTypeChauffage === "Fioul" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conso_fioul_litres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consommation (litres/an)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix_fioul_litre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <PriceLabelWithTooltip
                        label="Prix (€/litre)"
                        price={defaultPrices?.fioul}
                        unit="€/litre"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {watchTypeChauffage === "Gaz" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conso_gaz_kwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consommation (kWh/an)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix_gaz_kwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <PriceLabelWithTooltip
                        label="Prix (€/kWh)"
                        price={defaultPrices?.gaz}
                        unit="€/kWh"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {watchTypeChauffage === "GPL" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conso_gpl_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consommation (kg/an)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix_gpl_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <PriceLabelWithTooltip
                        label="Prix (€/kg)"
                        price={defaultPrices?.gpl}
                        unit="€/kg"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {watchTypeChauffage === "Pellets" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conso_pellets_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consommation (kg/an)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix_pellets_kg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <PriceLabelWithTooltip
                        label="Prix (€/kg)"
                        price={defaultPrices?.bois}
                        unit="€/kg"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {watchTypeChauffage === "Bois" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conso_bois_steres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consommation (stères/an)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix_bois_stere"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <PriceLabelWithTooltip
                        label="Prix (€/stère)"
                        price={defaultPrices?.bois ? defaultPrices.bois * 416.67 : undefined}
                        unit="€/stère"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {watchTypeChauffage === "Electrique" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="conso_elec_kwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consommation (kWh/an)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prix_elec_kwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <PriceLabelWithTooltip
                        label="Prix (€/kWh)"
                        price={defaultPrices?.electricite}
                        unit="€/kWh"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {(watchTypeChauffage === "PAC Air/Air" ||
            watchTypeChauffage === "PAC Air/Eau" ||
            watchTypeChauffage === "PAC Eau/Eau") && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cop_actuel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>COP actuel</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conso_pac_kwh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consommation (kWh/an)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="prix_elec_kwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <PriceLabelWithTooltip
                        label="Prix de l'électricité (€/kWh)"
                        price={defaultPrices?.electricite}
                        unit="€/kWh"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </>
      )}

      {/* If user DOESN'T KNOW consumption: show housing fields for estimation */}
      {watchConnaitConsommation === false && (
        <>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Renseignez les caractéristiques de votre logement. Nous estimerons votre consommation
              énergétique en nous basant sur la méthode DPE (Diagnostic de Performance Énergétique).
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="annee_construction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Année de construction</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="surface_habitable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surface habitable (m²)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="nombre_occupants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre d&apos;occupants</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            <FormLabel>Isolation et équipements</FormLabel>
            <FormField
              control={form.control}
              name="isolation_murs"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Isolation des murs
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isolation_combles"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Isolation des combles
                  </FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isolation_fenetres"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    Double vitrage / fenêtres isolantes
                  </FormLabel>
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </div>
  )
}
