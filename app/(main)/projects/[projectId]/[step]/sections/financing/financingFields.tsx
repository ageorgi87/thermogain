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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { FinancingData } from "./financingSchema"
import { useEffect } from "react"
import { calculateMensualite } from "@/lib/loanCalculations"
import { Separator } from "@/components/ui/separator"

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

  // Watch form values for total cost calculation
  const montantCredit = form.watch("montant_credit")
  const tauxInteret = form.watch("taux_interet")
  const dureeCreditMois = form.watch("duree_credit_mois")

  // Calculate total cost of credit (principal + interests)
  const calculateTotalCreditCost = () => {
    if (!montantCredit || !dureeCreditMois || tauxInteret === undefined) {
      return 0
    }

    const mensualite = calculateMensualite(montantCredit, tauxInteret, dureeCreditMois)
    const totalPaye = mensualite * dureeCreditMois
    return Math.round(totalPaye * 100) / 100
  }

  const totalCreditCost = calculateTotalCreditCost()
  const interetsPayes = totalCreditCost - (montantCredit || 0)
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Total cost of credit (capital + interests) */}
          {montantCredit && tauxInteret !== undefined && dureeCreditMois && (
            <>
              <Separator />

              <div className="flex justify-between items-center py-4 px-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-blue-900">
                    Coût total du crédit
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-blue-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Montant total à rembourser</p>
                      <p className="text-xs mb-2">
                        Capital emprunté + intérêts sur {dureeCreditMois} mois
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ⚠️ Ce montant peut légèrement varier selon les banques en fonction des assurances emprunteur, frais de dossier, frais de garantie, etc.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-900">
                    {totalCreditCost.toLocaleString('fr-FR')} €
                  </div>
                  <div className="text-xs text-blue-700">
                    dont {interetsPayes.toLocaleString('fr-FR')} € d&apos;intérêts
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
