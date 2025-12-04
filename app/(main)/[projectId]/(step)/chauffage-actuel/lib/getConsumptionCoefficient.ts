interface GetConsumptionCoefficientParams {
  anneeConstruction: number
  qualiteIsolation: string
}

/**
 * Calcule le coefficient de consommation en kWh/m²/an selon l'année de construction et l'isolation
 */
export const getConsumptionCoefficient = ({
  anneeConstruction,
  qualiteIsolation
}: GetConsumptionCoefficientParams): number => {
  // Convertir la qualité d'isolation en score numérique
  // "Mauvaise" = 0, "Moyenne" = 1-2, "Bonne" = 3
  let isolationScore: number
  if (qualiteIsolation === "Mauvaise") {
    isolationScore = 0
  } else if (qualiteIsolation === "Moyenne") {
    isolationScore = 1.5 // Moyenne entre 1 et 2
  } else {
    isolationScore = 3
  }

  // Logements construits avant 1975 (pas de RT)
  if (anneeConstruction < 1975) {
    if (isolationScore === 0) return 200 // Très mal isolé
    if (isolationScore <= 1.5) return 155 // Mal isolé (moyenne de 170 et 140)
    return 110 // Bien isolé après rénovation
  }

  // Logements construits entre 1975 et 2000 (RT 1974-2000)
  if (anneeConstruction < 2000) {
    if (isolationScore === 0) return 150 // Mal isolé
    if (isolationScore <= 1.5) return 120 // Isolation partielle (moyenne de 130 et 110)
    return 90 // Très bien isolé
  }

  // Logements construits entre 2000 et 2012 (RT 2000-2005)
  if (anneeConstruction < 2012) {
    if (isolationScore === 0) return 100 // Isolation standard
    if (isolationScore <= 1.5) return 92.5 // Moyenne (entre 100 et 85)
    return 70 // Très bien isolé
  }

  // Logements construits après 2012 (RT 2012)
  if (isolationScore === 0) return 70 // Standard RT 2012
  if (isolationScore <= 1.5) return 65 // Moyenne (entre 70 et 60)
  return 50 // Très performant (proche BBC)
}
