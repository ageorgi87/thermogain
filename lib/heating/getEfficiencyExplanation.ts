/**
 * Génère un message explicatif sur le rendement calculé
 * Utile pour afficher à l'utilisateur pourquoi son rendement est bas/élevé
 */
export const getEfficiencyExplanation = (
  heatingType: string,
  age: number,
  condition: "Bon" | "Moyen" | "Mauvais",
  efficiency: number
): string => {
  const efficiencyPercent = Math.round(efficiency * 100)

  let explanation = `Votre ${heatingType} de ${age} ans `

  if (condition === "Bon") {
    explanation += "bien entretenu "
  } else if (condition === "Moyen") {
    explanation += "moyennement entretenu "
  } else {
    explanation += "mal entretenu "
  }

  explanation += `fonctionne à environ ${efficiencyPercent}% de rendement.`

  if (efficiency < 0.70) {
    explanation += " ⚠️ Ce rendement est faible. Un entretien ou un remplacement permettrait de réaliser des économies importantes."
  } else if (efficiency < 0.80) {
    explanation += " Ce rendement est dans la moyenne des installations anciennes."
  } else if (efficiency < 0.90) {
    explanation += " Ce rendement est correct pour une installation de cet âge."
  } else {
    explanation += " Ce rendement est excellent."
  }

  return explanation
}
