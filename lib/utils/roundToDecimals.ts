/**
 * Arrondit un nombre à un nombre de décimales spécifié
 *
 * @param value Valeur à arrondir
 * @param decimals Nombre de décimales
 * @returns Valeur arrondie
 *
 * @example
 * roundToDecimals(3.14159, 2) // 3.14
 * roundToDecimals(10.12345, 3) // 10.123
 */
export const roundToDecimals = (value: number, decimals: number): number => {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
};
