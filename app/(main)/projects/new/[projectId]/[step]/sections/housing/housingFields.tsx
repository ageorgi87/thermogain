import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { HousingData } from "./housingSchema"

interface HousingFieldsProps {
  form: UseFormReturn<HousingData>
}

export function HousingFields({ form }: HousingFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="code_postal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code postal</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: 75001, 20000, 97400"
                maxLength={5}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Code postal français (métropole, Corse, DOM-TOM)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

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
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
        name="nombre_occupants"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre d&apos;occupants</FormLabel>
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

      <div className="space-y-3">
        <FormLabel>Isolation et équipements</FormLabel>
        <FormField
          control={form.control}
          name="isolation_murs"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
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
                  checked={field.value}
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
          name="double_vitrage"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Double vitrage
              </FormLabel>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
