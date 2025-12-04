import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FormField } from "@/components/form/FormField"
import { HousingData } from "@/app/(main)/[projectId]/(step)/logement/actions/housingSchema"

interface HousingFieldsProps {
  formData: Partial<HousingData>
  errors: Partial<Record<keyof HousingData, string>>
  onChange: (name: keyof HousingData, value: any) => void
}

export function HousingFields({ formData, errors, onChange }: HousingFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        label="Code postal"
        required
        error={errors.code_postal}
        description="Code postal français (métropole, Corse, DOM-TOM)"
      >
        <Input
          placeholder="ex: 75001, 20000, 97400"
          maxLength={5}
          value={formData.code_postal ?? ""}
          onChange={(e) => {
            const value = e.target.value
            onChange("code_postal", value === "" ? undefined : value)
          }}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Année de construction"
          required
          error={errors.annee_construction}
        >
          <Input
            type="number"
            min="0"
            placeholder="ex: 1990, 2010"
            value={formData.annee_construction ?? ""}
            onChange={(e) => {
              const value = e.target.value
              if (value === "") {
                onChange("annee_construction", undefined)
              } else {
                const num = parseFloat(value)
                onChange("annee_construction", isNaN(num) ? undefined : num)
              }
            }}
          />
        </FormField>

        <FormField
          label="Surface habitable (m²)"
          required
          error={errors.surface_habitable}
        >
          <Input
            type="number"
            min="0"
            placeholder="ex: 100"
            value={formData.surface_habitable ?? ""}
            onChange={(e) => {
              const value = e.target.value
              if (value === "") {
                onChange("surface_habitable", undefined)
              } else {
                const num = parseFloat(value)
                onChange("surface_habitable", isNaN(num) ? undefined : num)
              }
            }}
          />
        </FormField>
      </div>

      <FormField
        label="Nombre d'occupants"
        required
        error={errors.nombre_occupants}
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 3"
          value={formData.nombre_occupants ?? ""}
          onChange={(e) => {
            const value = e.target.value
            if (value === "") {
              onChange("nombre_occupants", undefined)
            } else {
              const num = parseFloat(value)
              onChange("nombre_occupants", isNaN(num) ? undefined : num)
            }
          }}
        />
      </FormField>

      <FormField
        label="Qualité globale de l'isolation"
        required
        error={errors.qualite_isolation}
      >
        <Select
          onValueChange={(value) => onChange("qualite_isolation", value as HousingData["qualite_isolation"])}
          value={formData.qualite_isolation}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez la qualité de l'isolation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Mauvaise">
              Mauvaise - Aucune isolation ou isolation minimale
            </SelectItem>
            <SelectItem value="Moyenne">
              Moyenne - Isolation partielle (quelques éléments isolés)
            </SelectItem>
            <SelectItem value="Bonne">
              Bonne - Logement bien isolé (la plupart des éléments isolés)
            </SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  )
}
