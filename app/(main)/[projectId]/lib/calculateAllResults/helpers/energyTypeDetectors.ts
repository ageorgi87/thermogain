/**
 * Détecteurs de types d'énergie
 * Centralise la logique de détection des caractéristiques énergétiques
 */

/**
 * Vérifie si le type de chauffage est électrique
 */
export const isElectricHeating = (typeChauffage: string): boolean => {
  return ["Electrique", "PAC Air/Air", "PAC Air/Eau", "PAC Eau/Eau"].includes(typeChauffage)
}

/**
 * Vérifie si le type de chauffage nécessite un abonnement gaz
 */
export const requiresGasSubscription = (typeChauffage: string): boolean => {
  return typeChauffage === "Gaz"
}

/**
 * Vérifie si le type de chauffage nécessite un entretien annuel
 */
export const requiresMaintenance = (typeChauffage: string): boolean => {
  // Tous les systèmes sauf électrique simple nécessitent un entretien
  return typeChauffage !== "Electrique"
}
