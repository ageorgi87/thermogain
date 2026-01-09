import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { FormField } from "@/app/(main)/[projectId]/(step)/components/FormField";
import { FinancialAidData } from "@/app/(main)/[projectId]/(step)/(content)/aides/actions/financialAidSchema";
import { useEffect } from "react";
import { AidCalculator } from "@/app/(main)/[projectId]/(step)/(content)/aides/components/AidCalculator";

interface FinancialAidFieldsProps {
  formData: Partial<FinancialAidData>;
  errors: Partial<Record<keyof FinancialAidData, string>>;
  onChange: (name: keyof FinancialAidData, value: any) => void;
  projectId: string;
}

export function FinancialAidFields({
  formData,
  errors,
  onChange,
  projectId,
}: FinancialAidFieldsProps) {
  const maPrimeRenov = formData.maPrimeRenov;
  const cee = formData.cee;
  const otherAid = formData.otherAid;

  // Calculate total (computed value, no need for useEffect)
  const totalAid = (maPrimeRenov || 0) + (cee || 0) + (otherAid || 0);

  // Update form data with calculated total when any aid changes
  useEffect(() => {
    if (formData.totalAid !== totalAid) {
      onChange("totalAid", totalAid);
    }
  }, [totalAid, formData.totalAid, onChange]);

  return (
    <div className="space-y-4">
      {/* Calculateur unifié pour les deux aides (API Mes Aides Réno) */}
      <div className="p-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
        <p className="text-sm mb-3">
          💡 Utilisez le calculateur ci-dessous pour vérifier votre éligibilité
          via l'API officielle Mes Aides Réno. Les montants MaPrimeRénov' et CEE
          sont calculés en temps réel selon les barèmes à jour.
        </p>
        <AidCalculator
          projectId={projectId}
          onUseAmounts={(maPrimeRenov, cee) => {
            onChange("maPrimeRenov", maPrimeRenov);
            onChange("cee", cee);
          }}
          savedCriteria={{
            housingType: formData.housingType,
            referenceTaxIncome: formData.referenceTaxIncome,
            isPrimaryResidence: formData.isPrimaryResidence,
            isCompleteReplacement: formData.isCompleteReplacement,
          }}
        />
      </div>

      <Separator />

      <FormField label="MaPrimeRénov' (€)" error={errors.maPrimeRenov}>
        <Input
          type="number"
          min="0"
          placeholder="ex: 4000"
          value={formData.maPrimeRenov ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              onChange("maPrimeRenov", undefined);
            } else {
              const num = parseFloat(value);
              onChange("maPrimeRenov", isNaN(num) ? undefined : num);
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
            const value = e.target.value;
            if (value === "") {
              onChange("cee", undefined);
            } else {
              const num = parseFloat(value);
              onChange("cee", isNaN(num) ? undefined : num);
            }
          }}
        />
      </FormField>

      <FormField
        label="Autres aides (€)"
        error={errors.otherAid}
        description="Aides locales, régionales, etc."
      >
        <Input
          type="number"
          min="0"
          placeholder="ex: 1000"
          value={formData.otherAid ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "") {
              onChange("otherAid", undefined);
            } else {
              const num = parseFloat(value);
              onChange("otherAid", isNaN(num) ? undefined : num);
            }
          }}
        />
      </FormField>

      <Separator />

      <div className="flex justify-between items-center py-4 px-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
        <span className="text-lg font-semibold">Total des aides</span>
        <span className="text-2xl font-bold">
          {totalAid.toLocaleString("fr-FR")} €
        </span>
      </div>
    </div>
  );
}
