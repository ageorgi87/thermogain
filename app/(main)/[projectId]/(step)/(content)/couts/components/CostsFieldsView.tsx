import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FormField } from "@/app/(main)/[projectId]/(step)/components/FormField";
import type { CostsData } from "@/app/(main)/[projectId]/(step)/(content)/couts/actions/costsSchema";

interface CostsFieldsViewProps {
  heatPumpCost: number | undefined;
  installationCost: number | undefined;
  additionalWorkCost: number | undefined;
  totalCost: number;
  errors: Partial<Record<keyof CostsData, string>>;
  onChange: ({
    field,
    value,
  }: {
    field: keyof CostsData;
    value: string;
  }) => void;
}

/**
 * Composant de présentation pur - affiche les champs de coûts
 * Aucune logique métier, reçoit tout via props
 */
export const CostsFieldsView = ({
  heatPumpCost,
  installationCost,
  additionalWorkCost,
  totalCost,
  errors,
  onChange,
}: CostsFieldsViewProps) => (
  <div className="space-y-4">
    <FormField label="Coût de la PAC (€)" required error={errors.heatPumpCost}>
      <Input
        type="number"
        min="0"
        placeholder="ex: 8000"
        value={heatPumpCost ?? ""}
        onChange={(e) => onChange({ field: "heatPumpCost", value: e.target.value })}
      />
    </FormField>

    <FormField label="Coût d'installation (€)" error={errors.installationCost}>
      <Input
        type="number"
        min="0"
        placeholder="ex: 5000"
        value={installationCost ?? ""}
        onChange={(e) =>
          onChange({ field: "installationCost", value: e.target.value })
        }
      />
    </FormField>

    <FormField
      label="Coûts annexes (€)"
      error={errors.additionalWorkCost}
      description="Peinture, coffrages, etc."
    >
      <Input
        type="number"
        min="0"
        placeholder="ex: 1500"
        value={additionalWorkCost ?? ""}
        onChange={(e) =>
          onChange({ field: "additionalWorkCost", value: e.target.value })
        }
      />
    </FormField>

    <Separator />

    <div className="flex justify-between items-center py-4 px-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
      <span className="text-lg font-semibold">Coût total</span>
      <span className="text-2xl font-bold">
        {totalCost.toLocaleString("fr-FR")} €
      </span>
    </div>
  </div>
);
