/**
 * Calcule le coefficient d'ajustement selon le type d'émetteurs
 * Certains émetteurs nécessitent des températures plus élevées
 *
 * ⚠️ Ne s'applique QUE aux PAC avec circuit d'eau (Air/Eau, Eau/Eau)
 * Les PAC Air/Air diffusent directement l'air donc ce facteur = 1.0
 *
 * Référence : DTU 65.14 et guides ADEME
 */
export const getEmitterAdjustment = (typeEmetteurs: string): number => {
  switch (typeEmetteurs) {
    case "Plancher chauffant":
      // Optimal : température de départ 35°C
      return 1.0

    case "Radiateurs basse température":
      // Bon : température de départ 45°C
      return 0.90

    case "Ventilo-convecteurs":
      // Très bon : excellent échange thermique
      return 0.95

    case "Radiateurs haute température":
      // Difficile : température de départ 60-65°C
      // COP fortement dégradé
      return 0.70

    default:
      // Valeur conservatrice par défaut
      return 0.85
  }
}
