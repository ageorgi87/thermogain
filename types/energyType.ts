/**
 * Types d'énergie supportés par l'application
 */
export type EnergyType = "fioul" | "gaz" | "gpl" | "bois" | "electricite"

/**
 * Types d'énergie avec données API DIDO (sans GPL qui est calculé depuis fioul)
 */
export type ApiEnergyType = Exclude<EnergyType, "gpl">
