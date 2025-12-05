/**
 * Types d'énergie supportés par l'application
 */
export enum EnergyType {
  FIOUL = "fioul",
  GAZ = "gaz",
  GPL = "gpl",
  BOIS = "bois",
  ELECTRICITE = "electricite",
}

/**
 * Types d'énergie avec données API DIDO (sans GPL qui est calculé depuis fioul)
 */
export type ApiEnergyType = Exclude<EnergyType, EnergyType.GPL>
