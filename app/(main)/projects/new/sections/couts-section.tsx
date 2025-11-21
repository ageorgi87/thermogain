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

interface CoutsSectionProps {
  form: UseFormReturn<HeatingFormData>
}

export function CoutsSection({ form }: CoutsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Coûts du projet</CardTitle>
        <CardDescription>
          Détail des investissements nécessaires
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="couts.cout_pac"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coût de la PAC (€)</FormLabel>
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
          name="couts.cout_installation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coût d&apos;installation (€)</FormLabel>
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
          name="couts.cout_travaux_annexes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Travaux annexes (€)</FormLabel>
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
                Isolation, remplacement radiateurs, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="couts.cout_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Coût total (€)</FormLabel>
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
