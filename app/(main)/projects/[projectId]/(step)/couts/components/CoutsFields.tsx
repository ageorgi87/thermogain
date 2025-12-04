import { useEffect } from "react"
import type { CostsData } from "../actions/costsSchema"
import { CostsFieldsView } from "./CoutsFieldsView"

interface CoutsFieldsProps {
  formData: Partial<CostsData>;
  errors: Partial<Record<keyof CostsData, string>>;
  onChange: (name: keyof CostsData, value: any) => void;
}

/**
 * Composant parent (container) - gère la logique métier
 * Calcule le total et synchronise avec formData
 * Délègue le rendu au composant CostsFieldsView
 */
export const CoutsFields = ({
  formData,
  errors,
  onChange,
}: CoutsFieldsProps) => {
  // Logique métier : calcul du total
  const coutTotal =
    (formData.cout_pac || 0) +
    (formData.cout_installation || 0) +
    (formData.cout_travaux_annexes || 0);

  // Logique : synchronisation du total calculé avec formData
  useEffect(() => {
    if (formData.cout_total !== coutTotal) {
      onChange("cout_total", coutTotal);
    }
  }, [coutTotal, formData.cout_total, onChange]);

  // Handler unifié pour tous les champs
  const handleChange = ({
    field,
    value,
  }: {
    field: keyof CostsData;
    value: string;
  }) => {
    const parsedValue = value === "" ? undefined : parseFloat(value);
    onChange(field, parsedValue);
  };

  // Délégation du rendu au composant de présentation
  return (
    <CostsFieldsView
      coutPac={formData.cout_pac}
      coutInstallation={formData.cout_installation}
      coutTravauxAnnexes={formData.cout_travaux_annexes}
      coutTotal={coutTotal}
      errors={errors}
      onChange={handleChange}
    />
  );
};
