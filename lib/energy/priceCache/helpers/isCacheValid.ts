/**
 * Vérifie si les données en cache sont du mois en cours
 * Le cache est considéré comme valide si lastUpdated est dans le même mois et la même année
 */
export const isCacheValid = (lastUpdated: Date): boolean => {
  const now = new Date()
  const cacheDate = new Date(lastUpdated)

  // Vérifie si l'année et le mois sont identiques
  return (
    cacheDate.getFullYear() === now.getFullYear() &&
    cacheDate.getMonth() === now.getMonth()
  )
}
