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
import { CoutsData } from "@/lib/schemas/heating-form"

interface CoutsFieldsProps {
  form: UseFormReturn<CoutsData>
}

export function CoutsFields({ form }: CoutsFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="cout_pac"
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
        name="cout_installation"
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
        name="cout_travaux_annexes"
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
        name="cout_total"
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
    </div>
  )
}
