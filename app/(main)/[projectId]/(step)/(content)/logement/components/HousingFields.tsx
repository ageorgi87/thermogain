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
        error={errors.postalCode}
        description="Code postal français (métropole, Corse, DOM-TOM)"
      >
        <Input
          placeholder="ex: 75001, 20000, 97400"
          maxLength={5}
          value={formData.postalCode ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            onChange("postalCode", value === "" ? undefined : value);
          }}
        />
      </FormField>

      <FormField
        label="Année de construction"
        required
        error={errors.constructionYear}
      >
        <Input
          type="number"
          min="1600"
          placeholder="ex: 1990, 2010"
          value={formData.constructionYear ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              onChange("constructionYear", undefined);
            } else {
              const num = parseFloat(value);
              onChange("constructionYear", isNaN(num) ? undefined : num);
            }
          }}
        />
      </FormField>

      <FormField
        label="Surface habitable (m²)"
        required
        error={errors.livingArea}
      >
        <Input
          type="number"
          min="10"
          max="1000"
          placeholder="ex: 100"
          value={formData.livingArea ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              onChange("livingArea", undefined);
            } else {
              const num = parseFloat(value);
              onChange("livingArea", isNaN(num) ? undefined : num);
            }
          }}
        />
      </FormField>

      <FormField
        label="Nombre d'occupants"
        required
        error={errors.numberOfOccupants}
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 3"
          value={formData.numberOfOccupants ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              onChange("numberOfOccupants", undefined);
            } else {
              const num = parseFloat(value);
              onChange("numberOfOccupants", isNaN(num) ? undefined : num);
            }
          }}
        />
      </FormField>

      <FormField
        label="Classe DPE (Diagnostic de Performance Énergétique)"
        required={true}
        error={errors.dpeRating}
      >
        <Select
          onValueChange={(value) => {
            onChange("dpeRating", value as HousingData["dpeRating"]);
          }}
          value={formData.dpeRating}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez la classe DPE" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ClasseDPE.A}>A</SelectItem>
            <SelectItem value={ClasseDPE.B}>B</SelectItem>
            <SelectItem value={ClasseDPE.C}>C</SelectItem>
            <SelectItem value={ClasseDPE.D}>D</SelectItem>
            <SelectItem value={ClasseDPE.E}>E</SelectItem>
            <SelectItem value={ClasseDPE.F}>F</SelectItem>
            <SelectItem value={ClasseDPE.G}>G</SelectItem>
          </SelectContent>
        </Select>
      </FormField>
    </div>
  );
}
