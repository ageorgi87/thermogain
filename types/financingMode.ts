/**
 * Modes de financement disponibles pour l'achat d'une pompe à chaleur
 */
export enum FinancingMode {
  /** Paiement comptant (100% sans crédit) */
  COMPTANT = "Comptant",

  /** Financement par crédit (100% crédit) */
  CREDIT = "Crédit",

  /** Financement mixte (apport personnel + crédit) */
  MIXTE = "Mixte",
}
