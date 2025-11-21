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
import { ConsommationData } from "@/lib/schemas/heating-form"

interface ConsommationFieldsProps {
  form: UseFormReturn<ConsommationData>
  watchTypeChauffage: string
}

export function ConsommationFields({ form, watchTypeChauffage }: ConsommationFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="type_chauffage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type d&apos;énergie</FormLabel>
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

      {/* Conditional fields based on type_chauffage */}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
