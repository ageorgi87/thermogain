import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/form/FormField"
import type { CostsData } from "./actions/costsSchema"
import { calculateTotalCost, parseInputNumber } from "./costsLogic"
import { useEffect } from "react"

interface CoutsFieldsProps {
  formData: Partial<CostsData>
  errors: Partial<Record<keyof CostsData, string>>
  onChange: (name: keyof CostsData, value: any) => void
}

export const CoutsFields = ({ formData, errors, onChange }: CoutsFieldsProps) => {
  const coutTotal = calculateTotalCost(
    formData.cout_pac,
    formData.cout_installation,
    formData.cout_travaux_annexes
  )

  // Synchronise le total calculé avec formData
  useEffect(() => {
    if (formData.cout_total !== coutTotal) {
      onChange("cout_total", coutTotal)
    }
  }, [coutTotal, formData.cout_total, onChange])

  return (
    <div className="space-y-4">
      <FormField label="Coût de la PAC (€)" required error={errors.cout_pac}>
        <Input
          type="number"
          min="0"
          placeholder="ex: 8000"
          value={formData.cout_pac ?? ""}
          onChange={(e) => onChange("cout_pac", parseInputNumber(e.target.value))}
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
          onChange={(e) => onChange("cout_installation", parseInputNumber(e.target.value))}
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
          onChange={(e) => onChange("cout_travaux_annexes", parseInputNumber(e.target.value))}
        />
      </FormField>

      <Separator />

      <div className="flex justify-between items-center py-4 px-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
        <span className="text-lg font-semibold">Coût total</span>
        <span className="text-2xl font-bold">
          {coutTotal.toLocaleString("fr-FR")} €
        </span>
      </div>
    </div>
  )
}
