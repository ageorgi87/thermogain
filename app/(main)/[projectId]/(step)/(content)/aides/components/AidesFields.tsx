import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/form/FormField"
import { FinancialAidData } from "@/app/(main)/[projectId]/(step)/(content)/aides/actions/financialAidSchema"
import { useEffect } from "react"
import { AidCalculator } from "@/components/AidCalculator"

interface AidesFieldsProps {
  formData: Partial<FinancialAidData>
  errors: Partial<Record<keyof FinancialAidData, string>>
  onChange: (name: keyof FinancialAidData, value: any) => void
  // Données des étapes précédentes
  typePac?: string
  anneeConstruction?: number
  codePostal?: string
  surfaceHabitable?: number
  nombreOccupants?: number
}

export function AidesFields({
  formData,
  errors,
  onChange,
  typePac,
  anneeConstruction,
  codePostal,
  surfaceHabitable,
  nombreOccupants,
}: AidesFieldsProps) {
  const maPrimeRenov = formData.ma_prime_renov
  const cee = formData.cee
  const autresAides = formData.autres_aides

  // Calculate total (computed value, no need for useEffect)
  const totalAides = (maPrimeRenov || 0) + (cee || 0) + (autresAides || 0)

  // Update form data with calculated total when any aid changes
  useEffect(() => {
    if (formData.total_aides !== totalAides) {
      onChange("total_aides", totalAides)
    }
  }, [totalAides, formData.total_aides, onChange])

  return (
    <div className="space-y-4">
      {/* Calculateur unifié pour les deux aides */}
      <div className="p-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
        <p className="text-sm mb-3">
          💡 Utilisez le calculateur ci-dessous pour vérifier votre éligibilité et obtenir une estimation automatique des montants MaPrimeRénov' et CEE.
        </p>
        <AidCalculator
          typePac={typePac}
          anneeConstruction={anneeConstruction}
          codePostal={codePostal}
          surfaceHabitable={surfaceHabitable}
          nombreOccupants={nombreOccupants}
          onUseAmounts={(maPrimeRenov, cee) => {
            onChange("ma_prime_renov", maPrimeRenov)
            onChange("cee", cee)
          }}
        />
      </div>

      <Separator />

      <FormField
        label="MaPrimeRénov' (€)"
        error={errors.ma_prime_renov}
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 4000"
          value={formData.ma_prime_renov ?? ""}
          onChange={(e) => {
            const value = e.target.value
            if (value === "") {
              onChange("ma_prime_renov", undefined)
            } else {
              const num = parseFloat(value)
              onChange("ma_prime_renov", isNaN(num) ? undefined : num)
            }
          }}
        />
      </FormField>

      <FormField
        label="CEE (Certificats d'Économies d'Énergie) (€)"
        error={errors.cee}
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 2500"
          value={formData.cee ?? ""}
          onChange={(e) => {
            const value = e.target.value
            if (value === "") {
              onChange("cee", undefined)
            } else {
              const num = parseFloat(value)
              onChange("cee", isNaN(num) ? undefined : num)
            }
          }}
        />
      </FormField>

      <FormField
        label="Autres aides (€)"
        error={errors.autres_aides}
        description="Aides locales, régionales, etc."
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 1000"
          value={formData.autres_aides ?? ""}
          onChange={(e) => {
            const value = e.target.value
            if (value === "") {
              onChange("autres_aides", undefined)
            } else {
              const num = parseFloat(value)
              onChange("autres_aides", isNaN(num) ? undefined : num)
            }
          }}
        />
      </FormField>

      <Separator />

      <div className="flex justify-between items-center py-4 px-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
        <span className="text-lg font-semibold">Total des aides</span>
        <span className="text-2xl font-bold">
          {totalAides.toLocaleString('fr-FR')} €
        </span>
      </div>
    </div>
  )
}
