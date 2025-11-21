import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { EvolutionsData } from "@/lib/schemas/heating-form"

interface EvolutionsFieldsProps {
  form: UseFormReturn<EvolutionsData>
}

export function EvolutionsFields({ form }: EvolutionsFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="evolution_prix_energie"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Évolution du prix de l&apos;énergie actuelle (%/an)</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Augmentation annuelle estimée (ex: 5 pour +5%/an)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="evolution_prix_electricite"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Évolution du prix de l&apos;électricité (%/an)</FormLabel>
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
        name="duree_etude_annees"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Durée de l&apos;étude (années)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Période sur laquelle analyser la rentabilité
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
