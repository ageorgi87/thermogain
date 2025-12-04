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
