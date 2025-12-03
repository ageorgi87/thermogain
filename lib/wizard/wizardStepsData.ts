/**
 * Configuration centralisée des étapes du wizard de projet PAC
 */
export const WIZARD_STEPS = [
  { key: "informations", title: "Informations", description: "Nom du projet et destinataires" },
  { key: "logement", title: "Logement", description: "Caractéristiques de votre logement" },
  { key: "chauffage-actuel", title: "Chauffage actuel", description: "Votre système de chauffage actuel et consommation" },
  { key: "projet-pac", title: "Projet PAC", description: "Caractéristiques de la pompe à chaleur" },
  { key: "couts", title: "Coûts", description: "Coûts d'installation et travaux" },
  { key: "aides", title: "Aides", description: "Aides financières disponibles" },
  { key: "financement", title: "Financement", description: "Mode de financement du projet" },
] as const

/**
 * Type pour les clés d'étapes
 */
export type WizardStepKey = typeof WIZARD_STEPS[number]["key"]
