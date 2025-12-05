import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/app/(main)/[projectId]/(step)/components/FormField";
import { HousingData } from "@/app/(main)/[projectId]/(step)/(content)/logement/actions/housingSchema";
import { ClasseDPE } from "@/types/dpe";

interface HousingFieldsProps {
  formData: Partial<HousingData>;
  errors: Partial<Record<keyof HousingData, string>>;
  onChange: (name: keyof HousingData, value: any) => void;
}

export function HousingFields({
  formData,
  errors,
  onChange,
}: HousingFieldsProps) {
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
            const value = e.target.value;
            onChange("code_postal", value === "" ? undefined : value);
          }}
        />
      </FormField>

      <FormField
        label="Année de construction"
        required
        error={errors.annee_construction}
      >
        <Input
          type="number"
          min="1600"
          placeholder="ex: 1990, 2010"
          value={formData.annee_construction ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              onChange("annee_construction", undefined);
            } else {
              const num = parseFloat(value);
              onChange("annee_construction", isNaN(num) ? undefined : num);
            }
          }}
        />
      </FormField>

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
            const value = e.target.value;
            if (value === "") {
              onChange("nombre_occupants", undefined);
            } else {
              const num = parseFloat(value);
              onChange("nombre_occupants", isNaN(num) ? undefined : num);
            }
          }}
        />
      </FormField>

      <FormField
        label="Classe DPE (Diagnostic de Performance Énergétique)"
        required={true}
        error={errors.classe_dpe}
      >
        <Select
          onValueChange={(value) => {
            onChange("classe_dpe", value as HousingData["classe_dpe"]);
          }}
          value={formData.classe_dpe}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez la classe DPE" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ClasseDPE.A}>
              A - Excellent (≤ 50 kWh/m²/an)
            </SelectItem>
            <SelectItem value={ClasseDPE.B}>
              B - Très bien (51 à 90 kWh/m²/an)
            </SelectItem>
            <SelectItem value={ClasseDPE.C}>
              C - Bien (91 à 150 kWh/m²/an)
            </SelectItem>
            <SelectItem value={ClasseDPE.D}>
              D - Moyen (151 à 230 kWh/m²/an)
            </SelectItem>
            <SelectItem value={ClasseDPE.E}>
              E - Passable (231 à 330 kWh/m²/an)
            </SelectItem>
            <SelectItem value={ClasseDPE.F}>
              F - Médiocre (331 à 450 kWh/m²/an)
            </SelectItem>
            <SelectItem value={ClasseDPE.G}>
              G - Mauvais (&gt; 450 kWh/m²/an)
            </SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}
