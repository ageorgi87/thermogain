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
import { FormField } from "@/components/form/FormField"
import { FinancingData } from "./financingSchema"
import { useEffect } from "react"
import { calculateMensualite } from "@/lib/loanCalculations"
import { Separator } from "@/components/ui/separator"

interface FinancementFieldsProps {
  formData: Partial<FinancingData>
  errors: Partial<Record<keyof FinancingData, string>>
  onChange: (name: keyof FinancingData, value: any) => void
  totalCouts?: number
  totalAides?: number
}

export function FinancementFields({ formData, errors, onChange, totalCouts = 0, totalAides = 0 }: FinancementFieldsProps) {
  const montantAPayer = Math.max(0, totalCouts - totalAides)
  const modeFinancement = formData.mode_financement

  // Watch form values for total cost calculation
  const montantCredit = formData.montant_credit
  const apportPersonnel = formData.apport_personnel
  const tauxInteret = formData.taux_interet
  const dureeCreditMois = formData.duree_credit_mois

  // Auto-calculate montant_credit for "Crédit" mode (non-mixte)
  useEffect(() => {
    if (modeFinancement === "Crédit") {
      if (montantCredit !== montantAPayer) {
        onChange("montant_credit", montantAPayer)
      }
    }
  }, [modeFinancement, montantAPayer, montantCredit, onChange])

  // For Mixte mode: auto-adjust credit amount when personal contribution changes
  useEffect(() => {
    if (modeFinancement === "Mixte") {
      const apport = apportPersonnel || 0
      // Credit = Amount to pay - Personal contribution (but not negative)
      const newCredit = Math.max(0, montantAPayer - apport)
      // Only update if different to avoid infinite loop
      if (montantCredit !== newCredit) {
        onChange("montant_credit", newCredit)
      }
    }
  }, [modeFinancement, apportPersonnel, montantAPayer, montantCredit, onChange])

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
        label="Mode de financement"
        required
        error={errors.mode_financement}
      >
        <Select
          onValueChange={(value) => onChange("mode_financement", value as FinancingData["mode_financement"])}
          value={formData.mode_financement}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le mode de financement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Comptant">Comptant</SelectItem>
            <SelectItem value="Crédit">Crédit</SelectItem>
            <SelectItem value="Mixte">Mixte</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      {(modeFinancement === "Crédit" || modeFinancement === "Mixte") && (
        <>
          {modeFinancement === "Mixte" && (
            <FormField
              label="Apport personnel (€)"
              required
              error={errors.apport_personnel}
            >
              <Input
                type="number"
                min="0"
                max={montantAPayer}
                placeholder="ex: 3000"
                value={formData.apport_personnel ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "") {
                    onChange("apport_personnel", undefined)
                  } else {
                    const numValue = Number(value)
                    // Cap at montant à payer
                    const cappedValue = Math.min(numValue, montantAPayer)
                    onChange("apport_personnel", cappedValue)
                  }
                }}
              />
            </FormField>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Taux d'intérêt (%)"
              required
              error={errors.taux_interet}
            >
              <Input
                type="number"
                step="0.1"
                min="0"
                placeholder="ex: 3.5"
                value={formData.taux_interet ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "") {
                    onChange("taux_interet", undefined)
                  } else {
                    const num = parseFloat(value)
                    onChange("taux_interet", isNaN(num) ? undefined : num)
                  }
                }}
              />
            </FormField>

            <FormField
              label="Durée (mois)"
              required
              error={errors.duree_credit_mois}
            >
              <Input
                type="number"
                min="0"
                placeholder="ex: 120"
                value={formData.duree_credit_mois ?? ""}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "") {
                    onChange("duree_credit_mois", undefined)
                  } else {
                    const num = parseFloat(value)
                    onChange("duree_credit_mois", isNaN(num) ? undefined : num)
                  }
                }}
              />
            </FormField>
          </div>

          {/* Total cost of credit (capital + interests) */}
          {(modeFinancement === "Crédit" || modeFinancement === "Mixte") && (
            <>
              <Separator />

              <div className="flex justify-between items-center py-4 px-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Coût total du crédit
                  </span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold mb-1">Montant total à rembourser</p>
                      <p className="text-xs mb-2">
                        Capital emprunté + intérêts sur {dureeCreditMois || 0} mois
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ⚠️ Ce montant peut légèrement varier selon les banques en fonction des assurances emprunteur, frais de dossier, frais de garantie, etc.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-foreground">
                    {totalCreditCost.toLocaleString('fr-FR')} €
                  </div>
                  <div className="text-xs text-muted-foreground">
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
