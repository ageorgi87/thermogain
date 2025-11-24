import { Checkbox } from "@/components/ui/checkbox"
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
import { HeatPumpProjectData } from "./heatPumpProjectSchema"

interface ProjetPacFieldsProps {
  form: UseFormReturn<HeatPumpProjectData>
  watchBallonEcs: boolean
}

export function ProjetPacFields({ form, watchBallonEcs }: ProjetPacFieldsProps) {
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
          name="cop_estime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>COP estimé</FormLabel>
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
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="17"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="temperature_depart"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Température de départ (°C)</FormLabel>
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
        name="emetteurs"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type d&apos;émetteurs</FormLabel>
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

      <FormField
        control={form.control}
        name="ballon_ecs"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>
                Ballon d&apos;eau chaude sanitaire (ECS)
              </FormLabel>
            </div>
          </FormItem>
        )}
      />

      {watchBallonEcs && (
        <FormField
          control={form.control}
          name="volume_ballon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Volume du ballon (litres)</FormLabel>
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
      )}
    </div>
  )
}
