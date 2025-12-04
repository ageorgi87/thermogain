/**
 * Vérifie si les données en DB datent de moins de 31 jours
 * @param lastUpdated Date de dernière mise à jour
 * @returns true si les données sont valides (< 31 jours)
 */
export const isDataFresh = (lastUpdated: Date): boolean => {
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24))
  return daysDiff < 31
}
