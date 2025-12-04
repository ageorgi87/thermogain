import { calculateBoilerEfficiency } from "@/lib/heating/calculateBoilerEfficiency"

/**
 * Calcule le rendement estimé d'une installation de chauffage
 * Cette fonction peut être appelée depuis le client pour afficher le rendement en temps réel
 */
export const calculateEstimatedEfficiency = async (
  typeChauffage: string,
  ageInstallation: number,
  etatInstallation: "Bon" | "Moyen" | "Mauvais"
): Promise<{
  efficiency: number
  efficiencyPercent: number
  explanation: string
}> => {
  const efficiency = calculateBoilerEfficiency(
    typeChauffage,
    ageInstallation,
    etatInstallation
  )

  const efficiencyPercent = Math.round(efficiency * 100)

  let explanation = `Votre ${typeChauffage} de ${ageInstallation} ans `

  if (etatInstallation === "Bon") {
    explanation += "bien entretenu "
  } else if (etatInstallation === "Moyen") {
    explanation += "moyennement entretenu "
  } else {
    explanation += "mal entretenu "
  }

  explanation += `fonctionne à environ ${efficiencyPercent}% de rendement. `

  if (efficiency < 0.7) {
    explanation +=
      "⚠️ Ce rendement est faible. Un entretien ou un remplacement permettrait de réaliser des économies importantes."
  } else if (efficiency < 0.8) {
    explanation +=
      "Ce rendement est dans la moyenne des installations anciennes."
  } else if (efficiency < 0.9) {
    explanation += "Ce rendement est correct pour une installation de cet âge."
  } else {
    explanation += "Ce rendement est excellent."
  }

  return {
    efficiency,
    efficiencyPercent,
    explanation,
  }
}
