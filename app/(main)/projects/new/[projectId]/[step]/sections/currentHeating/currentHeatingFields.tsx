import {
  FormControl,
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
import { UseFormReturn } from "react-hook-form"
import { ChauffageActuelData } from "@/lib/schemas/heating-form"

interface ChauffageActuelFieldsProps {
  form: UseFormReturn<ChauffageActuelData>
}

export function ChauffageActuelFields({ form }: ChauffageActuelFieldsProps) {
  const watchTypeChauffage = form.watch("type_chauffage")

  return (
    <div className="space-y-4">
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
                <SelectItem value="Autre">Autre</SelectItem>
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
                <FormLabel>Prix (€/litre)</FormLabel>
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
                <FormLabel>Prix (€/kWh)</FormLabel>
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
                <FormLabel>Prix (€/kg)</FormLabel>
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
                <FormLabel>Prix (€/kg)</FormLabel>
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
                <FormLabel>Prix (€/stère)</FormLabel>
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
                <FormLabel>Prix (€/kWh)</FormLabel>
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
      )}
    </div>
  )
}
