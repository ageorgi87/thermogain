import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { HeatingFormData } from "@/lib/schemas/heating-form"

interface AidesSectionProps {
  form: UseFormReturn<HeatingFormData>
}

export function AidesSection({ form }: AidesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aides financières</CardTitle>
        <CardDescription>
          Subventions et aides disponibles pour votre projet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="aides.ma_prime_renov"
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
          name="aides.cee"
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
          name="aides.autres_aides"
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
          name="aides.total_aides"
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
          name="aides.reste_a_charge"
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
      </CardContent>
    </Card>
  )
}
