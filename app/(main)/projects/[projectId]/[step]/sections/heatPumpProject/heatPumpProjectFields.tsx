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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { useEffect } from "react"
import { HeatPumpProjectData } from "./heatPumpProjectSchema"

interface ProjetPacFieldsProps {
  form: UseFormReturn<HeatPumpProjectData>
}

export function ProjetPacFields({ form }: ProjetPacFieldsProps) {
  const typePac = form.watch("type_pac")
  const isWaterBased = typePac === "Air/Eau" || typePac === "Eau/Eau"
  const isAirToAir = typePac === "Air/Air"

  // Automatically set emetteurs to "Ventilo-convecteurs" for Air/Air PACs
  useEffect(() => {
    if (isAirToAir) {
      form.setValue("emetteurs", "Ventilo-convecteurs")
    }
  }, [isAirToAir, form])

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="type_pac"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de PAC</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Air/Eau">Air/Eau</SelectItem>
                <SelectItem value="Eau/Eau">Eau/Eau</SelectItem>
                <SelectItem value="Air/Air">Air/Air</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="puissance_pac_kw"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Puissance (kW)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  {...field}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === "" ? 0 : Number(value))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cop_estime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                COP estimé
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold">Indiquez le COP fabricant (fiche technique)</p>
                    <p className="mt-2 text-xs">Des ajustements seront automatiquement appliqués selon :</p>
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
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  {...field}
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === "" ? 0 : Number(value))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="duree_vie_pac"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Durée de vie estimée de la PAC (années)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                value={field.value === 0 ? "" : field.value}
                onChange={(e) => {
                  const value = e.target.value
                  field.onChange(value === "" ? 0 : Number(value))
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Temperature departure: only for water-based systems (Air/Eau, Eau/Eau) */}
      {isWaterBased && (
        <FormField
          control={form.control}
          name="temperature_depart"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Température de départ (°C)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === "" ? 0 : Number(value))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Emitters: only show for water-based systems (Air/Eau, Eau/Eau) */}
      {/* For Air/Air, the value is automatically set to "Ventilo-convecteurs" via useEffect */}
      {isWaterBased && (
        <FormField
          control={form.control}
          name="emetteurs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type d'émetteurs</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Radiateurs haute température">
                    Radiateurs haute température
                  </SelectItem>
                  <SelectItem value="Radiateurs basse température">
                    Radiateurs basse température
                  </SelectItem>
                  <SelectItem value="Plancher chauffant">
                    Plancher chauffant
                  </SelectItem>
                  <SelectItem value="Ventilo-convecteurs">
                    Ventilo-convecteurs
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}
