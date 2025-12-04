/**
 * Calcule le coût total à partir des coûts individuels
 */
export const calculateTotalCost = (
  coutPac: number | undefined,
  coutInstallation: number | undefined,
  coutTravauxAnnexes: number | undefined
): number => {
  return (coutPac || 0) + (coutInstallation || 0) + (coutTravauxAnnexes || 0)
}

/**
 * Convertit une valeur d'input en nombre ou undefined
 * Gère les cas où l'input est vide ou invalide
 */
export const parseInputNumber = (value: string): number | undefined => {
  if (value === "") {
    return undefined
  }
  const num = parseFloat(value)
  return isNaN(num) ? undefined : num
}
