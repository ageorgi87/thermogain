import { Separator } from "@/components/ui/separator"
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
import { AidesData } from "@/lib/schemas/heating-form"

interface AidesFieldsProps {
  form: UseFormReturn<AidesData>
}

export function AidesFields({ form }: AidesFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="ma_prime_renov"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MaPrimeRénov&apos; (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEE (Certificats d&apos;Économies d&apos;Énergie) (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="autres_aides"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Autres aides (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </FormControl>
            <FormDescription>
              Aides locales, régionales, etc.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <FormField
        control={form.control}
        name="total_aides"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">Total des aides (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="text-lg font-semibold"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reste_a_charge"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">Reste à charge (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className="text-lg font-semibold"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
