import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/form/FormField"
import { CostsData } from "./costsSchema"
import { useEffect } from "react"

interface CoutsFieldsProps {
  formData: Partial<CostsData>
  errors: Partial<Record<keyof CostsData, string>>
  onChange: (name: keyof CostsData, value: any) => void
}

export function CoutsFields({ formData, errors, onChange }: CoutsFieldsProps) {
  const coutPac = formData.cout_pac
  const coutInstallation = formData.cout_installation
  const coutTravauxAnnexes = formData.cout_travaux_annexes

  // Calculate total (computed value, no need for useEffect)
  const coutTotal = (coutPac || 0) + (coutInstallation || 0) + (coutTravauxAnnexes || 0)

  // Update form data with calculated total when any cost changes
  useEffect(() => {
    if (formData.cout_total !== coutTotal) {
      onChange("cout_total", coutTotal)
    }
  }, [coutTotal, formData.cout_total, onChange])

  return (
    <div className="space-y-4">
      <FormField
        label="Coût de la PAC (€)"
        required
        error={errors.cout_pac}
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 8000"
          value={formData.cout_pac ?? ""}
          onChange={(e) => {
            const value = e.target.value
            if (value === "") {
              onChange("cout_pac", undefined)
            } else {
              const num = parseFloat(value)
              onChange("cout_pac", isNaN(num) ? undefined : num)
            }
          }}
        />
      </FormField>

      <FormField
        label="Coût d'installation (€)"
        error={errors.cout_installation}
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 5000"
          value={formData.cout_installation ?? ""}
          onChange={(e) => {
            const value = e.target.value
            if (value === "") {
              onChange("cout_installation", undefined)
            } else {
              const num = parseFloat(value)
              onChange("cout_installation", isNaN(num) ? undefined : num)
            }
          }}
        />
      </FormField>

      <FormField
        label="Coûts annexes (€)"
        error={errors.cout_travaux_annexes}
        description="Peinture, coffrages, etc."
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 1500"
          value={formData.cout_travaux_annexes ?? ""}
          onChange={(e) => {
            const value = e.target.value
            if (value === "") {
              onChange("cout_travaux_annexes", undefined)
            } else {
              const num = parseFloat(value)
              onChange("cout_travaux_annexes", isNaN(num) ? undefined : num)
            }
          }}
        />
      </FormField>

      <Separator />

      <div className="flex justify-between items-center py-4 px-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
        <span className="text-lg font-semibold">Coût total</span>
        <span className="text-2xl font-bold">
          {coutTotal.toLocaleString('fr-FR')} €
        </span>
      </div>
    </div>
  )
}
