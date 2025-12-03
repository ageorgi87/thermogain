/**
 * Ajuste la consommation selon le nombre d'occupants
 * Plus il y a d'occupants, plus il y a de besoins en chauffage et d'apports internes
 */
export const getOccupancyFactor = (nombreOccupants: number): number => {
  // Facteur de correction basé sur les apports internes
  // 1 personne = référence, plus il y a de personnes, moins on chauffe (apports internes)
  if (nombreOccupants === 1) return 1.1
  if (nombreOccupants === 2) return 1.0
  if (nombreOccupants === 3) return 0.95
  if (nombreOccupants === 4) return 0.92
  return 0.9 // 5+ personnes
}
