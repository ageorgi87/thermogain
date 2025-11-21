import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { HeatingFormData } from "@/lib/schemas/heating-form"

interface FinancementSectionProps {
  form: UseFormReturn<HeatingFormData>
  watchModeFinancement: string
}

export function FinancementSection({ form, watchModeFinancement }: FinancementSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financement</CardTitle>
        <CardDescription>
          Mode de financement du reste à charge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="financement.mode_financement"
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
                name="financement.apport_personnel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apport personnel (€)</FormLabel>
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
            )}

            <FormField
              control={form.control}
              name="financement.montant_credit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant du crédit (€)</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="financement.taux_interet"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taux d&apos;intérêt (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
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
                name="financement.duree_credit_mois"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (mois)</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="financement.mensualite"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensualité estimée (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
