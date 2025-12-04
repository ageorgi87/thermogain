/**
 * Détermine si le code postal correspond à l'Île-de-France
 */

export const isIleDeFrance = (codePostal: string): boolean => {
  const departement = codePostal.substring(0, 2)
  return ["75", "77", "78", "91", "92", "93", "94", "95"].includes(departement)
}
