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
import { FinancingData } from "./financingSchema"
import { useEffect } from "react"

interface FinancementFieldsProps {
  form: UseFormReturn<FinancingData>
  watchModeFinancement: string
  totalCouts?: number
  totalAides?: number
}

export function FinancementFields({ form, watchModeFinancement, totalCouts = 0, totalAides = 0 }: FinancementFieldsProps) {
  // Auto-calculate montant_credit for "Crédit" mode (non-mixte)
  useEffect(() => {
    if (watchModeFinancement === "Crédit" && totalCouts > 0) {
      const montantCredit = Math.max(0, totalCouts - totalAides)
      form.setValue("montant_credit", montantCredit)
    }
  }, [watchModeFinancement, totalCouts, totalAides, form])
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="mode_financement"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mode de financement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Comptant">Comptant</SelectItem>
                <SelectItem value="Crédit">Crédit</SelectItem>
                <SelectItem value="Mixte">Mixte</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {(watchModeFinancement === "Crédit" || watchModeFinancement === "Mixte") && (
        <>
          {watchModeFinancement === "Mixte" && (
            <FormField
              control={form.control}
              name="apport_personnel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apport personnel (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
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
          )}

          {/* Montant du crédit: only show for Mixte mode, auto-calculated for Crédit mode */}
          {watchModeFinancement === "Mixte" && (
            <FormField
              control={form.control}
              name="montant_credit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant du crédit (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
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
          )}

          {/* Display calculated credit amount for Crédit mode */}
          {watchModeFinancement === "Crédit" && (
            <div className="flex justify-between items-center py-4 px-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Montant du crédit (calculé automatiquement)</span>
              <span className="text-lg font-bold">
                {Math.max(0, totalCouts - totalAides).toLocaleString('fr-FR')} €
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="taux_interet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taux d&apos;intérêt (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
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
              name="duree_credit_mois"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Durée (mois)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
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
          </div>
        </>
      )}
    </div>
  )
}
