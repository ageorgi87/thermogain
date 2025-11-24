/**
 * Configuration centralisée des étapes du wizard de projet PAC
 */

export const WIZARD_STEPS = [
  { key: "logement", title: "Logement", description: "Caractéristiques de votre logement" },
  { key: "chauffage-actuel", title: "Chauffage actuel", description: "Votre système de chauffage actuel et consommation" },
  { key: "projet-pac", title: "Projet PAC", description: "Caractéristiques de la pompe à chaleur" },
  { key: "couts", title: "Coûts", description: "Coûts d'installation et travaux" },
  { key: "aides", title: "Aides", description: "Aides financières disponibles" },
  { key: "financement", title: "Financement", description: "Mode de financement du projet" },
  { key: "evolutions", title: "Évolutions", description: "Évolution des prix de l'énergie" },
] as const

/**
 * Retourne le nombre total d'étapes du wizard
 */
export function getTotalSteps(): number {
  return WIZARD_STEPS.length
}

/**
 * Retourne le numéro d'étape (1-based) pour un currentStep donné (1-based)
 * @param currentStep - Le numéro d'étape actuel du projet (1-based)
 * @returns Le numéro d'étape à afficher (1-based)
 */
export function getStepNumber(currentStep: number): number {
  return Math.min(currentStep, getTotalSteps())
}

/**
 * Retourne le statut d'un projet en fonction de son currentStep
 * @param currentStep - Le numéro d'étape actuel du projet (1-based)
 * @returns "En cours" ou "Terminé"
 */
export function getProjectStatus(currentStep: number): "En cours" | "Terminé" {
  return currentStep > getTotalSteps() ? "Terminé" : "En cours"
}

/**
 * Retourne la clé de l'étape pour un currentStep donné (1-based)
 * @param currentStep - Le numéro d'étape actuel du projet (1-based)
 * @returns La clé de l'étape ou undefined si invalide
 */
export function getStepKey(currentStep: number): string | undefined {
  const index = currentStep - 1
  return WIZARD_STEPS[index]?.key
}

/**
 * Type pour les clés d'étapes
 */
export type WizardStepKey = typeof WIZARD_STEPS[number]["key"]
