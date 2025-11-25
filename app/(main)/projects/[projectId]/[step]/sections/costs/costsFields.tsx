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
import { CostsData } from "./costsSchema"
import { useEffect } from "react"

interface CoutsFieldsProps {
  form: UseFormReturn<CostsData>
}

export function CoutsFields({ form }: CoutsFieldsProps) {
  const coutPac = form.watch("cout_pac")
  const coutInstallation = form.watch("cout_installation")
  const coutTravauxAnnexes = form.watch("cout_travaux_annexes")

  // Auto-calculate cout_total when any of the costs change
  useEffect(() => {
    const total = (coutPac || 0) + (coutInstallation || 0) + (coutTravauxAnnexes || 0)
    form.setValue("cout_total", total)
  }, [coutPac, coutInstallation, coutTravauxAnnexes])

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
                min="0"
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
                min="0"
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
            <FormLabel>Coûts annexes (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Peinture, coffrages, etc.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <div className="flex justify-between items-center py-4 px-4 bg-muted/50 rounded-lg">
        <span className="text-lg font-semibold">Coût total</span>
        <span className="text-2xl font-bold">
          {((coutPac || 0) + (coutInstallation || 0) + (coutTravauxAnnexes || 0)).toLocaleString('fr-FR')} €
        </span>
      </div>
    </div>
  )
}
